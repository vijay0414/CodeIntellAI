"""
Unified LLM client — abstracts Groq (primary) and Gemini (fallback).

Usage:
    from app.services.llm_client import get_llm_client
    client = get_llm_client()
    raw_text = await client.chat(system_prompt, user_prompt)

The active provider is chosen by settings.llm_provider.
Swap via LLM_PROVIDER env var without changing call sites.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from functools import lru_cache

import httpx

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)


# ── Exceptions ────────────────────────────────────────────────────────────────

class LLMProviderError(Exception):
    """Raised when the LLM provider returns an error or is unavailable."""

    def __init__(self, message: str, status_code: int = 503) -> None:
        super().__init__(message)
        self.status_code = status_code


class LLMRateLimitError(LLMProviderError):
    def __init__(self, provider: str) -> None:
        super().__init__(f"{provider} rate limit reached. Try again shortly.", 429)


class LLMTimeoutError(LLMProviderError):
    def __init__(self, provider: str) -> None:
        super().__init__(f"{provider} request timed out.", 503)


# ── Base interface ────────────────────────────────────────────────────────────

class BaseLLMClient(ABC):
    """Abstract base — all providers must implement chat()."""

    @abstractmethod
    async def chat(self, system_prompt: str, user_prompt: str) -> str:
        """Send a system + user message; return the raw text response."""


# ── Groq implementation ───────────────────────────────────────────────────────

class GroqClient(BaseLLMClient):
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.groq_api_key
        self._model = settings.groq_model
        self._timeout = settings.llm_timeout

    async def chat(self, system_prompt: str, user_prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,  # low temp for structured/deterministic output
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(self.BASE_URL, json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            raise LLMTimeoutError("Groq") from exc
        except httpx.RequestError as exc:
            raise LLMProviderError(f"Groq network error: {exc}") from exc

        if response.status_code == 401:
            raise LLMProviderError(
                f"Groq authentication failed — check your GROQ_API_KEY. "
                f"Response: {response.text}",
                status_code=503,
            )
        if response.status_code == 429:
            raise LLMRateLimitError("Groq")
        if response.status_code >= 500:
            raise LLMProviderError(
                f"Groq server error {response.status_code}: {response.text}",
                status_code=503,
            )
        if response.status_code >= 400:
            raise LLMProviderError(
                f"Groq request error {response.status_code}: {response.text}",
                status_code=response.status_code,
            )

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise LLMProviderError(f"Unexpected Groq response shape: {data}") from exc


# ── Gemini implementation ─────────────────────────────────────────────────────

class GeminiClient(BaseLLMClient):
    BASE_URL = (
        "https://generativelanguage.googleapis.com/v1beta/models"
        "/{model}:generateContent"
    )

    def __init__(self, settings: Settings) -> None:
        self._api_key = settings.gemini_api_key
        self._model = settings.gemini_model
        self._timeout = settings.llm_timeout

    async def chat(self, system_prompt: str, user_prompt: str) -> str:
        url = self.BASE_URL.format(model=self._model)
        params = {"key": self._api_key}
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {"temperature": 0.2},
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(url, json=payload, params=params)
        except httpx.TimeoutException as exc:
            raise LLMTimeoutError("Gemini") from exc
        except httpx.RequestError as exc:
            raise LLMProviderError(f"Gemini network error: {exc}") from exc

        if response.status_code == 429:
            raise LLMRateLimitError("Gemini")
        if response.status_code >= 500:
            raise LLMProviderError(
                f"Gemini server error: {response.status_code}", status_code=503
            )
        if response.status_code >= 400:
            raise LLMProviderError(
                f"Gemini request error {response.status_code}: {response.text}",
                status_code=response.status_code,
            )

        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as exc:
            raise LLMProviderError(
                f"Unexpected Gemini response shape: {data}"
            ) from exc


# ── Factory ───────────────────────────────────────────────────────────────────

def _build_client(settings: Settings) -> BaseLLMClient:
    provider = settings.llm_provider
    logger.info("Initialising LLM client: provider=%s", provider)
    if provider == "groq":
        return GroqClient(settings)
    if provider == "gemini":
        return GeminiClient(settings)
    raise ValueError(f"Unknown LLM provider: {provider!r}")


@lru_cache
def get_llm_client() -> BaseLLMClient:
    """Return a cached LLM client instance (singleton per process)."""
    return _build_client(get_settings())

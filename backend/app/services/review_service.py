"""
Review service — orchestrates LLM call + JSON parsing for /api/review.

Retry policy:
  - On malformed JSON: retry once with an explicit correction prompt.
  - After one retry: raise a clean error (never leak raw LLM text).
"""
from __future__ import annotations

import logging

from pydantic import ValidationError

from app.schemas.review import ReviewResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError
from app.utils.json_parser import LLMJsonParseError, parse_llm_json
from app.utils.prompt_templates import review_system_prompt, review_user_prompt

logger = logging.getLogger(__name__)

# Correction prompt appended on retry
_JSON_CORRECTION_PROMPT = (
    "Your previous response was not valid JSON. "
    "Return ONLY the raw JSON object — no markdown, no code fences, "
    "no text before or after the JSON. Start your response with '{'."
)


async def run_review(
    code: str,
    language: str,
    mode: str,
    llm: BaseLLMClient,
) -> ReviewResponse:
    """
    Call the LLM to review code and return a validated ReviewResponse.

    Raises:
        LLMProviderError: on provider-side failures.
        ValueError: if the LLM persistently returns unparseable output.
    """
    system_prompt = review_system_prompt(mode)
    user_prompt = review_user_prompt(code, language)

    raw = await llm.chat(system_prompt, user_prompt)
    logger.debug("Review LLM raw response (first 200): %.200s", raw)

    # ── Attempt 1: parse the response ─────────────────────────────────────────
    try:
        data = parse_llm_json(raw)
        return ReviewResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.warning("Review parse failed on first attempt: %s", exc)

    # ── Attempt 2: one retry with a correction nudge ──────────────────────────
    logger.info("Retrying review LLM call with correction prompt.")
    try:
        raw_retry = await llm.chat(
            system_prompt,
            f"{user_prompt}\n\n{_JSON_CORRECTION_PROMPT}",
        )
        data = parse_llm_json(raw_retry)
        return ReviewResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.error("Review parse failed after retry: %s", exc)
        raise ValueError(
            "The AI model returned a response that could not be parsed. "
            "Please try again."
        ) from exc
    except LLMProviderError:
        raise  # propagate provider errors as-is

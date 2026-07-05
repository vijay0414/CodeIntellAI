"""
Translate service — LLM-powered code translation between programming languages.

Follows the exact same retry pattern as optimize_service.py:
  - Parse LLM response → validate with Pydantic.
  - On failure: retry once with a correction nudge.
  - After two failures: raise clean ValueError (never leak raw LLM text).
"""
from __future__ import annotations

import logging

from pydantic import ValidationError

from app.schemas.translate import TranslateResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError
from app.utils.json_parser import LLMJsonParseError, parse_llm_json
from app.utils.prompt_templates import translate_system_prompt, translate_user_prompt

logger = logging.getLogger(__name__)

_JSON_CORRECTION_PROMPT = (
    "Your previous response was not valid JSON. "
    "Return ONLY the raw JSON object — no markdown, no code fences, "
    "no text before or after the JSON. Start your response with '{'."
)


async def run_translate(
    code: str,
    source_language: str,
    target_language: str,
    mode: str,
    llm: BaseLLMClient,
) -> TranslateResponse:
    """
    Translate code from source_language to target_language via LLM.

    Raises:
        LLMProviderError: on provider-side failures.
        ValueError: if the LLM persistently returns unparseable output.
    """
    system_prompt = translate_system_prompt(mode)
    user_prompt = translate_user_prompt(code, source_language, target_language)

    raw = await llm.chat(system_prompt, user_prompt)
    logger.debug("Translate LLM raw response (first 200): %.200s", raw)

    # ── Attempt 1 ─────────────────────────────────────────────────────────────
    try:
        data = parse_llm_json(raw)
        return TranslateResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.warning("Translate parse failed on first attempt: %s", exc)

    # ── Attempt 2: retry with correction nudge ─────────────────────────────────
    logger.info("Retrying translate LLM call with correction prompt.")
    try:
        raw_retry = await llm.chat(
            system_prompt,
            f"{user_prompt}\n\n{_JSON_CORRECTION_PROMPT}",
        )
        data = parse_llm_json(raw_retry)
        return TranslateResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.error("Translate parse failed after retry: %s", exc)
        raise ValueError(
            "The AI model returned a response that could not be parsed. "
            "Please try again."
        ) from exc
    except LLMProviderError:
        raise

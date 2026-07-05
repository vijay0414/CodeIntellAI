"""
Debug service — LLM-powered root cause analysis and fix generation.
"""
from __future__ import annotations

import logging

from pydantic import ValidationError

from app.schemas.debug import DebugResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError
from app.utils.json_parser import LLMJsonParseError, parse_llm_json
from app.utils.prompt_templates import debug_system_prompt, debug_user_prompt

logger = logging.getLogger(__name__)

_JSON_CORRECTION_PROMPT = (
    "Your previous response was not valid JSON. "
    "Return ONLY the raw JSON object — no markdown, no code fences, "
    "no text before or after the JSON. Start your response with '{'."
)


async def run_debug(
    code: str,
    language: str,
    error_trace: str,
    sample_input: str | None,
    llm: BaseLLMClient,
) -> DebugResponse:
    system_prompt = debug_system_prompt()
    user_prompt = debug_user_prompt(code, language, error_trace, sample_input)

    raw = await llm.chat(system_prompt, user_prompt)
    logger.debug("Debug LLM raw response (first 200): %.200s", raw)

    try:
        data = parse_llm_json(raw)
        return DebugResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.warning("Debug parse failed on first attempt: %s", exc)

    logger.info("Retrying debug LLM call with correction prompt.")
    try:
        raw_retry = await llm.chat(
            system_prompt,
            f"{user_prompt}\n\n{_JSON_CORRECTION_PROMPT}",
        )
        data = parse_llm_json(raw_retry)
        return DebugResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.error("Debug parse failed after retry: %s", exc)
        raise ValueError(
            "The AI model returned a response that could not be parsed. "
            "Please try again."
        ) from exc
    except LLMProviderError:
        raise

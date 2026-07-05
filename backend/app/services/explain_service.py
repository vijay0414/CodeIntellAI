"""
Explain service — separate LLM call from review, single-purpose prompt.
"""
from __future__ import annotations

import logging

from pydantic import ValidationError

from app.schemas.explain import ExplainResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError
from app.utils.json_parser import LLMJsonParseError, parse_llm_json
from app.utils.prompt_templates import explain_system_prompt, explain_user_prompt

logger = logging.getLogger(__name__)

_JSON_CORRECTION_PROMPT = (
    "Your previous response was not valid JSON. "
    "Return ONLY the raw JSON object — no markdown, no code fences, "
    "no text before or after the JSON. Start your response with '{'."
)


async def run_explain(
    code: str,
    language: str,
    mode: str,
    llm: BaseLLMClient,
) -> ExplainResponse:
    system_prompt = explain_system_prompt(mode)
    user_prompt = explain_user_prompt(code, language)

    raw = await llm.chat(system_prompt, user_prompt)
    logger.debug("Explain LLM raw response (first 200): %.200s", raw)

    try:
        data = parse_llm_json(raw)
        return ExplainResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.warning("Explain parse failed on first attempt: %s", exc)

    logger.info("Retrying explain LLM call with correction prompt.")
    try:
        raw_retry = await llm.chat(
            system_prompt,
            f"{user_prompt}\n\n{_JSON_CORRECTION_PROMPT}",
        )
        data = parse_llm_json(raw_retry)
        return ExplainResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.error("Explain parse failed after retry: %s", exc)
        raise ValueError(
            "The AI model returned a response that could not be parsed. "
            "Please try again."
        ) from exc
    except LLMProviderError:
        raise

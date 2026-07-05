"""
Interview service — generates code-grounded interview questions via LLM.
"""
from __future__ import annotations

import logging

from pydantic import ValidationError

from app.schemas.interview import InterviewResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError
from app.utils.json_parser import LLMJsonParseError, parse_llm_json
from app.utils.prompt_templates import interview_system_prompt, interview_user_prompt

logger = logging.getLogger(__name__)

_JSON_CORRECTION_PROMPT = (
    "Your previous response was not valid JSON. "
    "Return ONLY the raw JSON object — no markdown, no code fences, "
    "no text before or after the JSON. Start your response with '{'."
)


async def run_interview(
    code: str,
    language: str,
    count: int,
    llm: BaseLLMClient,
) -> InterviewResponse:
    system_prompt = interview_system_prompt()
    user_prompt = interview_user_prompt(code, language, count)

    raw = await llm.chat(system_prompt, user_prompt)
    logger.debug("Interview LLM raw response (first 200): %.200s", raw)

    try:
        data = parse_llm_json(raw)
        return InterviewResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.warning("Interview parse failed on first attempt: %s", exc)

    logger.info("Retrying interview LLM call with correction prompt.")
    try:
        raw_retry = await llm.chat(
            system_prompt,
            f"{user_prompt}\n\n{_JSON_CORRECTION_PROMPT}",
        )
        data = parse_llm_json(raw_retry)
        return InterviewResponse.model_validate(data)
    except (LLMJsonParseError, ValidationError, TypeError) as exc:
        logger.error("Interview parse failed after retry: %s", exc)
        raise ValueError(
            "The AI model returned a response that could not be parsed. "
            "Please try again."
        ) from exc
    except LLMProviderError:
        raise

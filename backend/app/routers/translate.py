"""
POST /api/translate — code translation between languages.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.translate import TranslateRequest, TranslateResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client
from app.services.translate_service import run_translate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["translate"])


@router.post("/translate", response_model=TranslateResponse)
async def translate_code(
    body: TranslateRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> TranslateResponse:
    logger.info(
        "translate | source=%s target=%s mode=%s ts=%s",
        body.source_language, body.target_language,
        body.mode, datetime.now(timezone.utc).isoformat(),
    )
    if body.source_language.strip().lower() == body.target_language.strip().lower():
        raise HTTPException(
            status_code=400,
            detail=f"source_language and target_language are both '{body.source_language}'. They must be different.",
        )
    try:
        return await run_translate(
            code=body.code,
            source_language=body.source_language,
            target_language=body.target_language,
            mode=body.mode,
            llm=llm,
        )
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

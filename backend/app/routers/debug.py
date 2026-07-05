"""
POST /api/debug — debug assistant.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.debug import DebugRequest, DebugResponse
from app.services.debug_service import run_debug
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["debug"])


@router.post("/debug", response_model=DebugResponse)
async def debug_code(
    body: DebugRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> DebugResponse:
    logger.info(
        "debug | language=%s ts=%s",
        body.language, datetime.now(timezone.utc).isoformat(),
    )
    try:
        return await run_debug(
            code=body.code,
            language=body.language,
            error_trace=body.error_trace,
            sample_input=body.sample_input,
            llm=llm,
        )
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

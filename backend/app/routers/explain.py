"""
POST /api/explain — code explanation.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.explain_service import run_explain
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["explain"])


@router.post("/explain", response_model=ExplainResponse)
async def explain_code(
    body: ExplainRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> ExplainResponse:
    logger.info(
        "explain | language=%s mode=%s ts=%s",
        body.language, body.mode, datetime.now(timezone.utc).isoformat(),
    )
    try:
        return await run_explain(code=body.code, language=body.language, mode=body.mode, llm=llm)
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

"""
POST /api/optimize — code optimization.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.optimize import OptimizeRequest, OptimizeResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client
from app.services.optimize_service import run_optimize

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["optimize"])


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_code(
    body: OptimizeRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> OptimizeResponse:
    logger.info(
        "optimize | language=%s ts=%s",
        body.language, datetime.now(timezone.utc).isoformat(),
    )
    try:
        return await run_optimize(code=body.code, language=body.language, llm=llm)
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

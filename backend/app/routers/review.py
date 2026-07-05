"""
POST /api/review — code quality review.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client
from app.services.review_service import run_review

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["review"])


@router.post("/review", response_model=ReviewResponse)
async def review_code(
    body: ReviewRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> ReviewResponse:
    logger.info(
        "review | language=%s mode=%s ts=%s",
        body.language, body.mode, datetime.now(timezone.utc).isoformat(),
    )
    try:
        return await run_review(code=body.code, language=body.language, mode=body.mode, llm=llm)
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

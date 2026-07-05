"""
POST /api/interview-questions — interview question generator.
Pure LLM call — no database, no persistence.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.interview import InterviewRequest, InterviewResponse
from app.services.interview_service import run_interview
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["interview"])


@router.post("/interview-questions", response_model=InterviewResponse)
async def interview_questions(
    body: InterviewRequest,
    llm: BaseLLMClient = Depends(get_llm_client),
) -> InterviewResponse:
    logger.info(
        "interview-questions | language=%s count=%s ts=%s",
        body.language, body.count, datetime.now(timezone.utc).isoformat(),
    )
    try:
        return await run_interview(code=body.code, language=body.language, count=body.count, llm=llm)
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

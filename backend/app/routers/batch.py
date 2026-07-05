"""
POST /api/batch-review — review multiple files concurrently.
Accepts multipart/form-data: files (List[UploadFile]) + optional mode field.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.schemas.batch_schema import BatchReviewResponse
from app.services.batch_service import MAX_FILE_SIZE, MAX_FILES, review_batch
from app.services.llm_client import BaseLLMClient, LLMProviderError, get_llm_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["batch"])


@router.post("/batch-review", response_model=BatchReviewResponse)
async def batch_review(
    files: Annotated[list[UploadFile], File(description="Source files to review (max 10, 200 KB each)")],
    mode: Annotated[str, Form()] = "beginner",
    llm: BaseLLMClient = Depends(get_llm_client),
) -> BatchReviewResponse:
    logger.info(
        "batch-review | files=%d mode=%s ts=%s",
        len(files), mode, datetime.now(timezone.utc).isoformat(),
    )

    # ── Validate file count ───────────────────────────────────────────────────
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum is {MAX_FILES}, got {len(files)}.",
        )

    # ── Validate file sizes (read size from headers if available, else peek) ──
    oversized: list[str] = []
    for f in files:
        # content-length header is not always set; fall back to reading
        if f.size is not None and f.size > MAX_FILE_SIZE:
            oversized.append(f.filename or "unknown")

    if oversized:
        raise HTTPException(
            status_code=400,
            detail=(
                f"The following files exceed the 200 KB limit and were rejected: "
                f"{', '.join(oversized)}"
            ),
        )

    # ── Validate mode ────────────────────────────────────────────────────────
    if mode not in ("beginner", "advanced"):
        mode = "beginner"

    try:
        return await review_batch(files=files, mode=mode, llm=llm)
    except LLMProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

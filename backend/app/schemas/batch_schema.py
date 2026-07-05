"""
Pydantic schemas for POST /api/batch-review.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.review import ReviewIssue


# ── Per-file result ───────────────────────────────────────────────────────────

class FileReviewResult(BaseModel):
    filename: str
    language: str
    health_score: int | None = Field(None, ge=0, le=100)
    issues: list[ReviewIssue] = Field(default_factory=list)
    error: str | None = None          # populated only when this file's review failed
    code: str = ""                    # echoed back so frontend can run per-file actions


# ── Summary dashboard ─────────────────────────────────────────────────────────

class BatchSummary(BaseModel):
    total_files: int
    average_health_score: float
    total_issues: int
    most_common_category: str     # e.g. "style" | "security" | "bug" | "performance"
    worst_file: str               # filename with lowest health score
    best_file: str                # filename with highest health score


# ── Top-level response ────────────────────────────────────────────────────────

class BatchReviewResponse(BaseModel):
    summary: BatchSummary
    file_results: list[FileReviewResult]


# ── Request mode (passed as form field alongside files) ───────────────────────

BatchMode = Literal["beginner", "advanced"]

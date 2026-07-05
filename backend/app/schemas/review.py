from typing import Literal

from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class ReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Source code to review")
    language: str = Field(..., min_length=1, description="Programming language, e.g. 'python'")
    mode: Literal["beginner", "advanced"] = Field(
        "beginner", description="Verbosity level for issue explanations"
    )


# ── Response ──────────────────────────────────────────────────────────────────

class ReviewIssue(BaseModel):
    line: int = Field(..., ge=0)
    severity: Literal["low", "medium", "high", "critical"]
    category: Literal["bug", "style", "security", "performance"]
    message: str
    suggestion: str


class ReviewResponse(BaseModel):
    health_score: int = Field(..., ge=0, le=100)
    summary: str
    issues: list[ReviewIssue] = Field(default_factory=list)

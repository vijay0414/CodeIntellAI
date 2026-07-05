from typing import Literal

from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class InterviewRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    count: int = Field(5, ge=1, le=20)


# ── Response ──────────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    question: str
    difficulty: Literal["easy", "medium", "hard"]
    answer_hint: str


class InterviewResponse(BaseModel):
    topics_detected: list[str] = Field(default_factory=list)
    questions: list[InterviewQuestion] = Field(default_factory=list)

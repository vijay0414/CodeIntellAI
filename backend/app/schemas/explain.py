from typing import Literal

from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    mode: Literal["beginner", "advanced"] = "beginner"


# ── Response ──────────────────────────────────────────────────────────────────

class WalkthroughStep(BaseModel):
    section: str
    explanation: str


class ExplainResponse(BaseModel):
    overview: str
    walkthrough: list[WalkthroughStep] = Field(default_factory=list)

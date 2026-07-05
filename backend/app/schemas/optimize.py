from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)


# ── Response ──────────────────────────────────────────────────────────────────

class OptimizeChange(BaseModel):
    what: str
    why: str


class OptimizeResponse(BaseModel):
    optimized_code: str
    changes: list[OptimizeChange] = Field(default_factory=list)
    complexity_before: str
    complexity_after: str

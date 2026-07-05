from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class DebugRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(..., min_length=1)
    error_trace: str = Field(..., min_length=1)
    sample_input: str | None = None


# ── Response ──────────────────────────────────────────────────────────────────

class DebugResponse(BaseModel):
    root_cause: str
    error_location: str
    error_category: str
    fixed_code: str
    explanation: str
    prevention_tip: str

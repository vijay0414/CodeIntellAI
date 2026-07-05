from typing import Literal

from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Source code to translate")
    source_language: str = Field(..., min_length=1, description="Language of the input code, e.g. 'java'")
    target_language: str = Field(..., min_length=1, description="Language to translate into, e.g. 'python'")
    mode: Literal["beginner", "advanced"] = Field(
        "beginner", description="Verbosity of translation_notes explanations"
    )


# ── Response ──────────────────────────────────────────────────────────────────

class TranslationNote(BaseModel):
    concept: str        # e.g. "Java HashMap"
    explanation: str    # e.g. "Translated to Python dict since dict provides equivalent key-value functionality."


class TranslateResponse(BaseModel):
    translated_code: str
    source_language: str
    target_language: str
    translation_notes: list[TranslationNote] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)

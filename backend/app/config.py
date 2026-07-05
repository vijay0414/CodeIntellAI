from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── LLM ───────────────────────────────────────────────────────────────────
    groq_api_key: str = ""
    gemini_api_key: str = ""
    llm_provider: Literal["groq", "gemini"] = "groq"

    groq_model: str = "llama-3.3-70b-versatile"
    gemini_model: str = "gemini-1.5-pro"

    llm_timeout: float = 60.0
    llm_json_retries: int = 1

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Primary production frontend URL (set this env var on Render)
    frontend_url: str = "http://localhost:5173"

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: Literal["development", "production", "test"] = "development"
    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        """
        Always allows localhost for local dev.
        Adds the production frontend URL when set via FRONTEND_URL env var.
        """
        origins = {
            "http://localhost:5173",
            "http://localhost:3000",
            self.frontend_url,
        }
        return [o for o in origins if o]


@lru_cache
def get_settings() -> Settings:
    return Settings()

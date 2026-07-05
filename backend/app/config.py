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
    # Comma-separated list of allowed frontend URLs
    # e.g. "https://myapp.vercel.app,https://myapp-git-main-xyz.vercel.app"
    frontend_url: str = "http://localhost:5173"

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: Literal["development", "production", "test"] = "development"
    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        """
        Parses FRONTEND_URL as a comma-separated list of allowed origins.
        Always includes localhost for local dev.
        Strips trailing slashes to avoid CORS mismatches.
        """
        base = {
            "http://localhost:5173",
            "http://localhost:3000",
        }
        for url in self.frontend_url.split(","):
            stripped = url.strip().rstrip("/")
            if stripped:
                base.add(stripped)
        return list(base)


@lru_cache
def get_settings() -> Settings:
    return Settings()

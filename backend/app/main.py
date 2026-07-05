"""
Code Intelligence Agent — FastAPI application entry point.
Fully stateless: no database, no persistence. Every request is LLM in → JSON out.

Start command (Render):
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import debug, explain, interview, optimize, review, translate
from app.services.llm_client import LLMProviderError, LLMRateLimitError, LLMTimeoutError

settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    logger.info(
        "Code Intelligence Agent starting (env=%s, frontend=%s)",
        settings.app_env,
        settings.frontend_url,
    )
    yield
    logger.info("Code Intelligence Agent shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Code Intelligence Agent",
        description=(
            "AI-powered code review, explanation, debugging, "
            "optimization, translation, and interview prep."
        ),
        version="2.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global exception handlers ─────────────────────────────────────────────

    @app.exception_handler(LLMTimeoutError)
    async def llm_timeout_handler(request: Request, exc: LLMTimeoutError) -> JSONResponse:
        logger.warning("LLM timeout on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=503,
            content={"detail": str(exc), "error_type": "llm_timeout"},
        )

    @app.exception_handler(LLMRateLimitError)
    async def llm_rate_limit_handler(request: Request, exc: LLMRateLimitError) -> JSONResponse:
        logger.warning("LLM rate limit on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=429,
            content={"detail": str(exc), "error_type": "llm_rate_limit"},
        )

    @app.exception_handler(LLMProviderError)
    async def llm_provider_handler(request: Request, exc: LLMProviderError) -> JSONResponse:
        logger.error("LLM provider error on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": str(exc), "error_type": "llm_provider_error"},
        )

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s", request.url.path)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An unexpected error occurred. Please try again.",
                "error_type": "internal_error",
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(review.router)
    app.include_router(explain.router)
    app.include_router(debug.router)
    app.include_router(optimize.router)
    app.include_router(interview.router)
    app.include_router(translate.router)

    # ── Health check — used by Render health checks and "wake-up" pings ──────
    @app.get("/health", tags=["meta"])
    async def health_check() -> dict[str, Any]:
        return {"status": "ok", "env": settings.app_env}

    # ── Config debug (dev only — safe because keys are masked) ────────────────
    @app.get("/debug/config", tags=["meta"])
    async def debug_config() -> dict[str, Any]:
        groq_key   = settings.groq_api_key
        gemini_key = settings.gemini_api_key
        return {
            "llm_provider":          settings.llm_provider,
            "groq_model":            settings.groq_model,
            "groq_api_key_loaded":   bool(groq_key),
            "groq_api_key_preview":  f"{groq_key[:8]}..."   if groq_key   else "NOT SET",
            "gemini_api_key_loaded": bool(gemini_key),
            "gemini_api_key_preview":f"{gemini_key[:8]}..." if gemini_key else "NOT SET",
            "frontend_url":          settings.frontend_url,
            "cors_origins":          settings.cors_origins_list,
        }

    return app


# Module-level `app` — required by Render's start command: uvicorn app.main:app
app = create_app()

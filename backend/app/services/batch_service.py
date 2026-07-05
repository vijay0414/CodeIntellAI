"""
Batch review service — runs multiple file reviews concurrently via asyncio.gather.
"""
from __future__ import annotations

import asyncio
import logging
from collections import Counter

from fastapi import UploadFile

from app.schemas.batch_schema import BatchReviewResponse, BatchSummary, FileReviewResult
from app.services.llm_client import BaseLLMClient
from app.services.review_service import run_review

logger = logging.getLogger(__name__)

EXT_TO_LANGUAGE: dict[str, str] = {
    ".py":   "python",
    ".js":   "javascript",
    ".jsx":  "javascript",
    ".ts":   "typescript",
    ".tsx":  "typescript",
    ".java": "java",
    ".cpp":  "cpp",
    ".cc":   "cpp",
    ".cxx":  "cpp",
    ".go":   "go",
    ".rs":   "rust",
    ".cs":   "csharp",
}

MAX_FILES = 10
MAX_FILE_SIZE = 200 * 1024  # 200 KB


def detect_language(filename: str) -> str:
    dot = filename.rfind(".")
    if dot == -1:
        return "unknown"
    return EXT_TO_LANGUAGE.get(filename[dot:].lower(), "unknown")


def _build_summary(results: list[FileReviewResult]) -> BatchSummary:
    scored = [r for r in results if r.health_score is not None]
    all_issues = [issue for r in results for issue in r.issues]

    avg_score = round(sum(r.health_score for r in scored) / len(scored), 1) if scored else 0.0
    total_issues = len(all_issues)

    cat_counts = Counter(issue.category for issue in all_issues)
    most_common = cat_counts.most_common(1)[0][0] if cat_counts else "none"

    if scored:
        worst_file = min(scored, key=lambda r: r.health_score).filename  # type: ignore[arg-type]
        best_file = max(scored, key=lambda r: r.health_score).filename   # type: ignore[arg-type]
    else:
        worst_file = "none"
        best_file = "none"

    return BatchSummary(
        total_files=len(results),
        average_health_score=avg_score,
        total_issues=total_issues,
        most_common_category=most_common,
        worst_file=worst_file,
        best_file=best_file,
    )


async def _review_one(file: UploadFile, mode: str, llm: BaseLLMClient) -> FileReviewResult:
    filename = file.filename or "unknown"
    language = detect_language(filename)

    try:
        content_bytes = await file.read()
        code = content_bytes.decode("utf-8", errors="replace")

        if language == "unknown":
            return FileReviewResult(
                filename=filename,
                language=language,
                code=code,
                error="Unsupported file type. Supported: .py .js .jsx .ts .tsx .java .cpp .go .rs .cs",
            )

        response = await run_review(code=code, language=language, mode=mode, llm=llm)
        return FileReviewResult(
            filename=filename,
            language=language,
            health_score=response.health_score,
            issues=response.issues,
            code=code,
        )
    except Exception as exc:
        logger.warning("Batch review failed for %s: %s", filename, exc)
        return FileReviewResult(
            filename=filename,
            language=language,
            error=str(exc),
            code=code if 'code' in dir() else "",
        )


async def review_batch(
    files: list[UploadFile],
    mode: str,
    llm: BaseLLMClient,
) -> BatchReviewResponse:
    results: list[FileReviewResult] = await asyncio.gather(
        *[_review_one(f, mode, llm) for f in files]
    )
    summary = _build_summary(list(results))
    return BatchReviewResponse(summary=summary, file_results=list(results))

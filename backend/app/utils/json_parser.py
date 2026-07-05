"""
Safe JSON extraction from LLM responses.

LLMs sometimes wrap JSON in markdown fences or add preamble text.
This module strips those artifacts and parses cleanly.
"""
import json
import re


class LLMJsonParseError(Exception):
    """Raised when the LLM response cannot be parsed into valid JSON."""


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers if present."""
    # Match ```json\n...\n``` or ```\n...\n```
    pattern = r"```(?:json)?\s*\n?(.*?)\n?```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def _extract_json_object(text: str) -> str:
    """
    Extract the outermost JSON object or array from text that may have
    leading/trailing prose (e.g. 'Here is the result: {...}').
    """
    # Try to find a JSON object
    obj_match = re.search(r"\{.*\}", text, re.DOTALL)
    arr_match = re.search(r"\[.*\]", text, re.DOTALL)

    if obj_match and arr_match:
        # Return whichever starts first
        return (
            obj_match.group()
            if obj_match.start() < arr_match.start()
            else arr_match.group()
        )
    if obj_match:
        return obj_match.group()
    if arr_match:
        return arr_match.group()
    return text


def parse_llm_json(raw: str) -> dict | list:
    """
    Parse LLM output into a Python dict or list.

    Strategy:
      1. Strip markdown fences.
      2. Attempt direct parse.
      3. Extract outermost JSON object/array and retry.

    Raises:
        LLMJsonParseError: if parsing ultimately fails.
    """
    if not raw or not raw.strip():
        raise LLMJsonParseError("LLM returned an empty response.")

    cleaned = _strip_markdown_fences(raw)

    # Attempt 1: direct parse after fence removal
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 2: extract embedded JSON object/array
    extracted = _extract_json_object(cleaned)
    try:
        return json.loads(extracted)
    except json.JSONDecodeError as exc:
        raise LLMJsonParseError(
            f"Could not extract valid JSON from LLM response. "
            f"Parse error: {exc}. "
            f"Raw (first 300 chars): {raw[:300]!r}"
        ) from exc

"""Render pytest run summaries that can be consumed by orchestration scripts."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict

SUMMARY_PATTERN = re.compile(r"==+.*in\s+([\d\.]+)s\s*==+")


def _parse_counts(line: str) -> Dict[str, int]:
    counts: Dict[str, int] = {"passed": 0, "failed": 0, "skipped": 0}
    for key in counts:
        match = re.search(rf"(\d+)\s+{key}", line)
        if match:
            counts[key] = int(match.group(1))
    total = sum(counts.values())
    counts["total"] = total
    return counts


def render_summary(log_path: str | Path, exit_code: int, summary_path: str | Path) -> None:
    """Parse pytest output and write a JSON summary."""
    log_path = Path(log_path)
    summary_path = Path(summary_path)

    summary: Dict[str, Any] = {
        "log_path": str(log_path),
        "exit_code": exit_code,
        "duration_seconds": None,
        "tests": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
    }

    if log_path.exists():
        content = log_path.read_text(encoding="utf-8").splitlines()
        for line in reversed(content):
            match = SUMMARY_PATTERN.search(line)
            if match:
                summary["duration_seconds"] = float(match.group(1))
                counts = _parse_counts(line)
                summary.update(
                    tests=counts["total"],
                    passed=counts["passed"],
                    failed=counts["failed"],
                    skipped=counts["skipped"],
                )
                break

    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

"""CLI helper for running pytest-bdd suites and emitting summaries."""

from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from summary_renderer import render_summary


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run pytest suites and emit summary artefacts."
    )
    parser.add_argument(
        "--marker",
        help="Optional pytest marker expression (for example: api, util).",
        default=None,
    )
    parser.add_argument(
        "--results-dir",
        default=".results",
        help="Directory where logs and summaries will be written.",
    )
    parser.add_argument(
        "pytest_args",
        nargs=argparse.REMAINDER,
        help="Additional arguments passed directly to pytest.",
    )
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%MZ")
    marker_label = (args.marker or "all").replace(" ", "_")

    results_dir = Path(args.results_dir)
    results_dir.mkdir(parents=True, exist_ok=True)

    log_path = results_dir / f"pytest_{marker_label}_{timestamp}.log"
    summary_path = results_dir / f"pytest_{marker_label}_{timestamp}.summary.json"

    cmd = [sys.executable, "-m", "pytest", "--maxfail=1"]
    if args.marker:
        cmd += ["-m", args.marker]
    if args.pytest_args:
        cmd += args.pytest_args

    process = subprocess.run(cmd, capture_output=True, text=True)
    log_path.write_text(process.stdout + process.stderr, encoding="utf-8")

    render_summary(log_path, process.returncode, summary_path)

    print(f"[run_bdd] pytest exit code: {process.returncode}")
    print(f"[run_bdd] log: {log_path}")
    print(f"[run_bdd] summary: {summary_path}")
    return process.returncode


if __name__ == "__main__":
    raise SystemExit(main())

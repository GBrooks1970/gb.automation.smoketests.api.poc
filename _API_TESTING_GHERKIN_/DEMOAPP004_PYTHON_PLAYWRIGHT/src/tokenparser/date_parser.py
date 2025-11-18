"""
Date token parser aligned with the TypeScript implementation.

Handles the `[TODAY±nUNIT ...]` grammar as well as `[START-JANUARY-2024]`
format described in `tokenparser_api_contract.md`.
"""

from __future__ import annotations

import re
from calendar import monthrange
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable


class DateTokenError(ValueError):
    """Raised when a date token cannot be parsed."""


BRACKETED_TOKEN = re.compile(r"^\[.*\]$")
FULL_PATTERN = re.compile(
    r"^(?P<anchorDate>TODAY|TOMORROW|YESTERDAY)"
    r"(?P<adjustTokens>([+-]\d+(YEAR|MONTH|DAY))*)$"
)
RANGE_PATTERN = re.compile(r"^(START|END)-([A-Z]+)-(\d{4})$")
INNER_SECTION_PATTERN = re.compile(
    r"(?P<sign>[+-])(?P<adjustValue>\d+)(?P<dateUnit>YEAR|MONTH|DAY)"
)

MONTH_MAP = {
    "JANUARY": 1,
    "FEBRUARY": 2,
    "MARCH": 3,
    "APRIL": 4,
    "MAY": 5,
    "JUNE": 6,
    "JULY": 7,
    "AUGUST": 8,
    "SEPTEMBER": 9,
    "OCTOBER": 10,
    "NOVEMBER": 11,
    "DECEMBER": 12,
}


def _midnight_utc(dt: datetime) -> datetime:
    return datetime(dt.year, dt.month, dt.day, tzinfo=timezone.utc)


def _anchor_date(anchor: str) -> datetime:
    today = _midnight_utc(datetime.utcnow().replace(tzinfo=timezone.utc))
    if anchor == "TODAY":
        return today
    if anchor == "TOMORROW":
        return today + timedelta(days=1)
    if anchor == "YESTERDAY":
        return today - timedelta(days=1)
    raise DateTokenError("Invalid start date section")


def _adjust_year(date: datetime, delta: int) -> datetime:
    return date.replace(year=date.year + delta)


def _adjust_month(date: datetime, delta: int) -> datetime:
    total_months = date.year * 12 + (date.month - 1) + delta
    year, month_index = divmod(total_months, 12)
    month = month_index + 1
    last_day = monthrange(year, month)[1]
    day = min(date.day, last_day)
    return date.replace(year=year, month=month, day=day)


def _adjust_day(date: datetime, delta: int) -> datetime:
    return date + timedelta(days=delta)


def _apply_adjustments(date: datetime, adjustments: Iterable[re.Match]) -> datetime:
    for match in adjustments:
        sign = 1 if match.group("sign") == "+" else -1
        value = int(match.group("adjustValue")) * sign
        unit = match.group("dateUnit")
        if unit == "YEAR":
            date = _adjust_year(date, value)
        elif unit == "MONTH":
            date = _adjust_month(date, value)
        elif unit == "DAY":
            date = _adjust_day(date, value)
        else:
            raise DateTokenError("Invalid date unit")
    return date


def _parse_full_token(inner: str) -> datetime:
    match = FULL_PATTERN.fullmatch(inner)
    if not match:
        raise DateTokenError("Invalid string token format")

    date = _anchor_date(match.group("anchorDate"))
    adjustments = INNER_SECTION_PATTERN.finditer(match.group("adjustTokens"))
    return _apply_adjustments(date, adjustments)


def _parse_month_start_end(inner: str) -> datetime:
    match = RANGE_PATTERN.fullmatch(inner)
    if not match:
        raise DateTokenError("Invalid string token format")

    start_end, month_str, year_str = match.groups()
    month = MONTH_MAP.get(month_str.upper())
    if not month:
        raise DateTokenError("Invalid month token")

    year = int(year_str)
    if year < 1:
        raise DateTokenError("Invalid year value")

    if start_end == "START":
        return datetime(year, month, 1, tzinfo=timezone.utc)

    # END => last day of month.
    last_day = monthrange(year, month)[1]
    return datetime(year, month, last_day, tzinfo=timezone.utc)


def parse_date_token(token: str) -> datetime:
    """
    Parse a Token Parser date token and return a timezone-aware UTC datetime.

    Raises:
        DateTokenError: if validation fails.
    """
    if not token or not BRACKETED_TOKEN.fullmatch(token):
        raise DateTokenError("Invalid string token format")

    inner = token[1:-1]

    if FULL_PATTERN.fullmatch(inner):
        return _parse_full_token(inner)

    if RANGE_PATTERN.fullmatch(inner):
        return _parse_month_start_end(inner)

    raise DateTokenError("Invalid string token format")


def format_date_utc(dt: datetime) -> str:
    """Return `yyyy-MM-dd HH:mm:ssZ` formatted string."""
    iso = dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    return f"{iso}Z"


def parse_date_range_token(token: str) -> tuple[datetime, datetime]:
    """
    Parse a date range token in the form
    [MONTHENDSTART-MONTH-YEAR<->MONTHENDSTART-MONTH-YEAR].
    """
    if not token or not BRACKETED_TOKEN.fullmatch(token):
        raise DateTokenError("Invalid string token format")

    inner = token[1:-1]
    parts = inner.split("<->")
    if len(parts) != 2:
        raise DateTokenError("Invalid string token format")

    start_inner, end_inner = parts
    start = _parse_month_start_end(start_inner)
    end = _parse_month_start_end(end_inner)
    return start, end

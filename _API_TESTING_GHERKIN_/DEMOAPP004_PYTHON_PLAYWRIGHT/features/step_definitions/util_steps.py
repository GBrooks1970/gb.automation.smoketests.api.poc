"""BDD steps for local parser utility coverage."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Tuple

import pytest
import re
from pytest_bdd import given, parsers, then, when, scenarios

from screenplay.abilities.use_token_parsers import UseTokenParsers
from screenplay.support.memory_keys import MemoryKeys
from tokenparser.dynamic_string_parser import SPECIAL_CHARS

FEATURE_DIR = Path(__file__).resolve().parents[1] / "util-tests"
scenarios(str(FEATURE_DIR / "tokenDateParser.feature"))
scenarios(str(FEATURE_DIR / "tokenDynamicStringParser.feature"))


def _parser(actor):
    return actor.ability(UseTokenParsers)


def _clear_error(actor):
    actor.memory.forget(MemoryKeys.LAST_PARSE_ERROR)


def _remember_error(actor, error: Exception):
    actor.memory.remember(MemoryKeys.LAST_PARSE_ERROR, error)


def _start_of_day_utc() -> datetime:
    now = datetime.utcnow()
    return datetime(now.year, now.month, now.day, tzinfo=timezone.utc)


def _add_months(date: datetime, delta: int) -> datetime:
    total = date.year * 12 + (date.month - 1) + delta
    year, month_idx = divmod(total, 12)
    month = month_idx + 1
    from calendar import monthrange

    day = min(date.day, monthrange(year, month)[1])
    return date.replace(year=year, month=month, day=day)


@given(parsers.parse('I have the date token "{token}"'))
def remember_date_token(token: str, scenario_context):
    scenario_context["date_token"] = token


@given(parsers.parse('I have the date string "{token}"'))
def remember_date_string(token: str, scenario_context):
    scenario_context["date_string_token"] = token


@given(parsers.parse('I have the date range string "{token}"'))
def remember_date_range(token: str, scenario_context):
    scenario_context["date_range_token"] = token


@given(parsers.parse('I have the dynamic token "{token}"'))
def remember_dynamic_token(token: str, scenario_context):
    scenario_context["dynamic_token"] = token


@when("I parse the date token locally")
def parse_relative_date(actor, scenario_context):
    token = scenario_context["date_token"]
    _clear_error(actor)
    try:
        result = _parser(actor).parse_date(token)
        actor.memory.remember(MemoryKeys.LAST_PARSED_DATE, result)
    except Exception as error:  # noqa: BLE001 - propagate message in assertions
        _remember_error(actor, error)
        actor.memory.forget(MemoryKeys.LAST_PARSED_DATE)


@when("I parse the date string token locally")
def parse_date_string(actor, scenario_context):
    token = scenario_context["date_string_token"]
    _clear_error(actor)
    try:
        result = _parser(actor).parse_date(token)
        actor.memory.remember(MemoryKeys.SECONDARY_PARSED_DATE, result)
    except Exception as error:
        _remember_error(actor, error)
        actor.memory.forget(MemoryKeys.SECONDARY_PARSED_DATE)


@when("I parse the date range string locally")
def parse_date_range(actor, scenario_context):
    token = scenario_context["date_range_token"]
    _clear_error(actor)
    try:
        start, end = _parser(actor).parse_date_range(token)
        actor.memory.remember(MemoryKeys.LAST_PARSED_RANGE, (start, end))
    except Exception as error:
        _remember_error(actor, error)
        actor.memory.forget(MemoryKeys.LAST_PARSED_RANGE)


@when("I parse the dynamic token locally")
def parse_dynamic_string(actor, scenario_context):
    token = scenario_context["dynamic_token"]
    _clear_error(actor)
    try:
        generated = _parser(actor).parse_dynamic_string(token)
        actor.memory.remember(MemoryKeys.LAST_GENERATED_STRING, generated)
    except Exception as error:
        _remember_error(actor, error)
        actor.memory.forget(MemoryKeys.LAST_GENERATED_STRING)


@then(parsers.parse("the result should equal today plus {years:d} years {months:d} months {days:d} days"))
def assert_relative_date(actor, years: int, months: int, days: int):
    parsed: datetime | None = actor.memory.recall(MemoryKeys.LAST_PARSED_DATE)
    assert parsed, "Expected a parsed date to be stored"

    expected = _start_of_day_utc()
    if years:
        expected = expected.replace(year=expected.year + years)
    if months:
        expected = _add_months(expected, months)
    if days:
        expected = expected + timedelta(days=days)

    assert parsed == expected, f"Expected {expected.isoformat()} got {parsed.isoformat()}"


@then(parsers.parse('an error should be thrown with message "{message}"'))
def assert_parse_error(actor, message: str):
    error = actor.memory.recall(MemoryKeys.LAST_PARSE_ERROR)
    assert error, "Expected a parser error"
    assert message in str(error)


@then(parsers.parse('the result should be "{expected_date}"'))
def assert_specific_date(actor, expected_date: str):
    parsed: datetime | None = actor.memory.recall(MemoryKeys.SECONDARY_PARSED_DATE)
    assert parsed, "Expected a parsed date"
    iso = parsed.strftime("%Y-%m-%d")
    assert iso == expected_date


@then(parsers.parse('the start date should be "{start}" and the end date should be "{end}"'))
def assert_range(actor, start: str, end: str):
    stored: Tuple[datetime, datetime] | None = actor.memory.recall(MemoryKeys.LAST_PARSED_RANGE)
    assert stored, "Expected a parsed date range"
    actual_start, actual_end = stored
    assert actual_start.strftime("%Y-%m-%d") == start
    assert actual_end.strftime("%Y-%m-%d") == end


@then(parsers.parse("the generated string should have a length of {length:d}"))
def assert_generated_length(actor, length: int):
    generated = actor.memory.recall(MemoryKeys.LAST_GENERATED_STRING)
    assert generated, "Expected a generated string"
    assert len(generated.replace("\r\n", "")) == length


SPECIAL_CHARS_REGEX = re.escape(SPECIAL_CHARS)

CHARSET_REGEX = {
    "ALPHA": r"^[A-Za-z\r\n]+$",
    "NUMERIC": r"^[0-9\r\n]+$",
    "PUNCTUATION": r"^[\.,!?;:\r\n]+$",
    "ALPHA_NUMERIC": r"^[A-Za-z0-9\r\n]+$",
    "ALPHA_NUMERIC_PUNCTUATION": r"^[A-Za-z0-9\.,!?;:\r\n]+$",
    "SPECIAL": rf"^[{SPECIAL_CHARS_REGEX}\r\n]+$",
    "ALPHA_PUNCTUATION": r"^[A-Za-z\.,!?;:\r\n]+$",
    "SPECIAL_PUNCTUATION": rf"^[{SPECIAL_CHARS_REGEX}\r\n]+$",
    "ALPHA_NUMERIC_SPECIAL": rf"^[A-Za-z0-9{SPECIAL_CHARS_REGEX}\r\n]+$",
}


@then(parsers.parse('the generated string should match the character set "{charset}"'))
def assert_charset(actor, charset: str):
    generated = actor.memory.recall(MemoryKeys.LAST_GENERATED_STRING)
    assert generated, "Expected a generated string"
    pattern = CHARSET_REGEX.get(charset)
    assert pattern, f"Unknown character set {charset}"
    assert re.match(pattern, generated), f"Generated string does not match {charset}"


@then(parsers.parse("the generated string should have {lines:d} lines"))
def assert_lines(actor, lines: int):
    generated = actor.memory.recall(MemoryKeys.LAST_GENERATED_STRING)
    assert generated, "Expected a generated string"
    actual_lines = generated.split("\r\n") if generated else []
    assert len(actual_lines) == lines


@then(parsers.parse('a dynamic string parser error should be thrown with message "{message}"'))
def assert_dynamic_error(actor, message: str):
    assert_parse_error(actor, message)

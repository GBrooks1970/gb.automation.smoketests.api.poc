"""
BDD step definitions for API scenarios.

Implements the same narratives as DEMOAPP001 but using Playwright + Python
Screenplay tasks.
"""

from __future__ import annotations

from pathlib import Path

from pytest_bdd import given, parsers, then, when, scenarios

from screenplay.questions.response_body import ResponseBody
from screenplay.questions.response_status import ResponseStatus
from screenplay.tasks.send_get_request import SendGetRequest
from tokenparser.date_parser import format_date_utc, parse_date_token
from tokenparser.dynamic_string_parser import (
    ALPHA_CHARS,
    NUMERIC_CHARS,
    PUNCTUATION_CHARS,
    SPECIAL_CHARS,
    TOKEN_PATTERN,
)

FEATURE_DIR = Path(__file__).resolve().parents[1]
scenarios(str(FEATURE_DIR / "api" / "alive.feature"))
scenarios(str(FEATURE_DIR / "api" / "parse_date_token.feature"))
scenarios(str(FEATURE_DIR / "api" / "parse_dynamic_string_token.feature"))


@given("the Token Parser API is available")
def api_available():
    """Presence of the API is validated implicitly by the GET requests."""


@given(parsers.parse('a date token "{token}"'))
def store_date_token(token: str, scenario_context):
    scenario_context["date_token"] = token
    scenario_context.pop("dynamic_token", None)


@given(parsers.parse('a dynamic string token "{token}"'))
def store_dynamic_token(token: str, scenario_context):
    scenario_context["dynamic_token"] = token
    scenario_context.pop("date_token", None)


@when(parsers.parse('I send a GET request to "{endpoint}"'))
def send_basic_get(actor, endpoint: str):
    actor.attempts_to(SendGetRequest(endpoint=endpoint))


@when("I send a GET request to \"/parse-date-token\" with the token query")
def send_date_token(actor, scenario_context):
    token = scenario_context["date_token"]
    actor.attempts_to(SendGetRequest(endpoint="/parse-date-token", params={"token": token}))


@when("I send a GET request to \"/parse-dynamic-string-token\" with the token query")
def send_dynamic_token(actor, scenario_context):
    token = scenario_context["dynamic_token"]
    actor.attempts_to(
        SendGetRequest(endpoint="/parse-dynamic-string-token", params={"token": token})
    )


@then(parsers.parse("the response status should be {status:d}"))
def assert_status(actor, status: int):
    actual = ResponseStatus.answered_by(actor)
    assert actual == status


def _expected_date_string(token: str) -> str:
    parsed = parse_date_token(token)
    return format_date_utc(parsed)


CHARSET_LOOKUP = {
    "ALPHA": ALPHA_CHARS,
    "NUMERIC": NUMERIC_CHARS,
    "PUNCTUATION": PUNCTUATION_CHARS,
    "SPECIAL": SPECIAL_CHARS,
}


def _assert_dynamic_token_value(token: str, actual_value: str) -> None:
    match = TOKEN_PATTERN.fullmatch(token)
    if not match:
        raise AssertionError(f"Token {token} is not valid according to TOKEN_PATTERN")

    types = match.group("types").split("-")
    lines_expected = int(match.group("lines")) if match.group("lines") else 1
    length_token = match.group("length")

    char_pool = "".join(dict.fromkeys("".join(CHARSET_LOOKUP[t] for t in types)))
    actual_lines = actual_value.split("\r\n")
    assert len(actual_lines) == lines_expected, f"Expected {lines_expected} lines"

    if length_token == "ALL":
        for line in actual_lines:
            assert line == char_pool, "Expected ALL tokens to emit the full pool"
        return

    length_expected = int(length_token)
    allowed_chars = set(char_pool)
    for line in actual_lines:
        assert len(line) == length_expected, f"Expected length {length_expected}"
        assert set(line).issubset(allowed_chars), "Unexpected characters in generated string"


@then(parsers.parse('the response should contain "{field}" with the value "{expected}"'))
def assert_response_contains(actor, scenario_context, field: str, expected: str):
    body = ResponseBody.answered_by(actor)
    assert field in body, f"Response missing field '{field}'"

    if field.lower() == "error":
        assert expected in str(body[field])
        return

    if field == "ParsedToken":
        if "date_token" in scenario_context:
            expected_value = _expected_date_string(scenario_context["date_token"])
            assert body[field] == expected_value
            return
        if "dynamic_token" in scenario_context:
            _assert_dynamic_token_value(scenario_context["dynamic_token"], body[field])
            return

    raise AssertionError(f"Unhandled assertion for field '{field}'")

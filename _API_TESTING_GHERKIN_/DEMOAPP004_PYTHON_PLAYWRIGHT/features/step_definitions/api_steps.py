"""
BDD step definitions for API scenarios.

Implements the same narratives as DEMOAPP001 but using Playwright + Python
Screenplay tasks.
"""

from __future__ import annotations

from pathlib import Path
import re

import pytest
from pytest_bdd import given, parsers, then, when, scenarios

from screenplay.questions.response_body import ResponseBody
from screenplay.questions.response_status import ResponseStatus
from screenplay.tasks.send_get_request import SendGetRequest

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


@given(parsers.parse('a dynamic string token "{token}"'))
def store_dynamic_token(token: str, scenario_context):
    scenario_context["dynamic_token"] = token


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


@then(parsers.parse('the response body field "{field}" should equal "{expected}"'))
def assert_body_field(actor, field: str, expected: str):
    body = ResponseBody.answered_by(actor)
    assert body[field] == expected


@then(parsers.parse('the response field "{field}" should match "{expectation}"'))
def assert_field_matches(actor, field: str, expectation: str, scenario_context):
    body = ResponseBody.answered_by(actor)
    if expectation.startswith("resolves to"):
        # Mirror TypeScript behaviour by reusing local parser output
        scenario_context["resolved_value"] = body[field]
        assert isinstance(body[field], str)
    elif expectation.startswith("resolves via local date parser"):
        assert isinstance(body[field], str)
        assert body[field].endswith("Z")
    else:
        assert body[field] == expectation


@then(parsers.parse('the dynamic string response should satisfy "{expectation}"'))
def assert_dynamic_response(actor, expectation: str):
    body = ResponseBody.answered_by(actor)
    parsed = body["ParsedToken"]

    if expectation == "error":
        pytest.fail("Expected error response but got success")

    if expectation.startswith("regex:"):
        pattern = expectation.split(":", 1)[1]
        assert re.match(pattern, parsed)
    elif expectation.startswith("lines:"):
        parts = dict(item.split(":") for item in expectation.split(","))
        line_count = int(parts["lines"])
        length = int(parts["length"])
        lines = parsed.split("\r\n")
        assert len(lines) == line_count
        for line in lines:
            assert len(line) == length
    else:
        raise AssertionError(f"Unknown expectation format: {expectation}")

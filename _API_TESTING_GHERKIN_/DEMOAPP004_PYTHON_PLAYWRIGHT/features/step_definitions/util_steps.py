"""BDD steps for local parser utility coverage."""

from __future__ import annotations

from pathlib import Path

import pytest
from pytest_bdd import given, parsers, then, when, scenarios

from screenplay.support.memory_keys import MemoryKeys
from screenplay.tasks.parse_token_locally import ParseTokenLocally

FEATURE_DIR = Path(__file__).resolve().parents[1] / "util-tests"
scenarios(str(FEATURE_DIR / "tokenDateParser.feature"))
scenarios(str(FEATURE_DIR / "tokenDynamicStringParser.feature"))


@given(parsers.parse('I have the date token "{token}"'))
def util_date_token(token, scenario_context):
    scenario_context["util_token"] = token


@given(parsers.parse('I have the dynamic token "{token}"'))
def util_dynamic_token(token, scenario_context):
    scenario_context["util_token"] = token


@when("I parse the token locally")
def parse_date_locally(actor, scenario_context):
    token = scenario_context["util_token"]
    try:
        actor.attempts_to(ParseTokenLocally(token, "DATE"))
        scenario_context["util_valid"] = True
    except Exception:
        scenario_context["util_valid"] = False


@when("I parse the dynamic token locally")
def parse_dynamic_locally(actor, scenario_context):
    token = scenario_context["util_token"]
    actor.attempts_to(ParseTokenLocally(token, "DYNAMIC"))


@then(parsers.parse("the local date parser should succeed = {expected}"))
def assert_util_result(scenario_context, expected: str):
    expected_bool = expected.lower() == "true"
    assert scenario_context["util_valid"] == expected_bool


@then(parsers.parse('the local dynamic parser should return "{expectation}"'))
def assert_dynamic_util(actor, expectation: str):
    result = actor.memory.recall(MemoryKeys.LAST_UTIL_RESULT)
    if expectation.startswith("regex:"):
        import re

        pattern = expectation.split(":", 1)[1]
        assert re.match(pattern, result)
    elif expectation.startswith("lines:"):
        parts = dict(item.split(":") for item in expectation.split(","))
        lines_expected = int(parts["lines"])
        length = int(parts["length"])
        lines = result.split("\r\n")
        assert len(lines) == lines_expected
        for line in lines:
            assert len(line) == length
    else:
        pytest.fail(f"Unhandled expectation: {expectation}")

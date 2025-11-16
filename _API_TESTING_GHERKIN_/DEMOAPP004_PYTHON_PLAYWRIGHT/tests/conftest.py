"""Shared pytest fixtures for Screenplay tests."""

from __future__ import annotations

import os
from typing import Dict

import pytest
from playwright.sync_api import APIRequestContext, Playwright, sync_playwright

from screenplay.abilities.call_an_api import CallAnApi
from screenplay.abilities.use_token_parsers import UseTokenParsers
from screenplay.actors.actor import Actor


@pytest.fixture(scope="session")
def api_base_url() -> str:
    return os.getenv("API_BASE_URL", "http://localhost:3002")


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    playwright = sync_playwright().start()
    yield playwright
    playwright.stop()


@pytest.fixture(scope="session")
def playwright_api_context(
    playwright_instance: Playwright, api_base_url: str
) -> APIRequestContext:
    context = playwright_instance.request.new_context(base_url=api_base_url)
    yield context
    context.dispose()


@pytest.fixture
def scenario_context() -> Dict[str, str]:
    return {}


@pytest.fixture
def actor(playwright_api_context: APIRequestContext) -> Actor:
    actor = Actor("Python API Tester")
    actor.can(CallAnApi(playwright_api_context))
    actor.can(UseTokenParsers())
    return actor

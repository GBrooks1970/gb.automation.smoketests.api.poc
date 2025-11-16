"""Ability wrapping Playwright's APIRequestContext."""

from playwright.sync_api import APIRequestContext


class CallAnApi:
    def __init__(self, context: APIRequestContext) -> None:
        self.context = context

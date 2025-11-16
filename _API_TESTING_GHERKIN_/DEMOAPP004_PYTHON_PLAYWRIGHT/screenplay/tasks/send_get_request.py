"""Task that performs a GET request via Playwright."""

from __future__ import annotations

from typing import Any, Dict

from screenplay.abilities.call_an_api import CallAnApi
from screenplay.support.memory import ActorMemory
from screenplay.support.memory_keys import MemoryKeys


class SendGetRequest:
    def __init__(self, endpoint: str, params: Dict[str, Any] | None = None):
        self.endpoint = endpoint
        self.params = params or {}

    def perform_as(self, actor):
        """Execute the HTTP request via Playwright."""
        api = actor.ability(CallAnApi)
        response = api.context.get(self.endpoint, params=self.params)
        actor.memory.remember(MemoryKeys.LAST_RESPONSE, response)

"""Question that returns the last response status code."""

from playwright.sync_api import APIResponse

from screenplay.support.memory_keys import MemoryKeys


class ResponseStatus:
    @staticmethod
    def answered_by(actor) -> int:
        response: APIResponse = actor.memory.recall(MemoryKeys.LAST_RESPONSE)
        if response is None:
            raise AssertionError("No response stored in memory")
        return response.status

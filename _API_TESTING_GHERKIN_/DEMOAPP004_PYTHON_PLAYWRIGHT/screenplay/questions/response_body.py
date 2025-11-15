"""Question that returns the JSON body of the last response."""

from playwright.sync_api import APIResponse

from screenplay.support.memory_keys import MemoryKeys


class ResponseBody:
    @staticmethod
    def answered_by(actor):
        response: APIResponse = actor.memory.recall(MemoryKeys.LAST_RESPONSE)
        if response is None:
            raise AssertionError("No response stored in memory")
        return response.json()

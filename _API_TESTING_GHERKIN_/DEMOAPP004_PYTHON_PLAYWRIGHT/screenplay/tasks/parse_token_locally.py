"""Task that executes local parser utilities via UseTokenParsers."""

from screenplay.abilities.use_token_parsers import UseTokenParsers
from screenplay.support.memory_keys import MemoryKeys


class ParseTokenLocally:
    def __init__(self, token: str, parser_type: str):
        self.token = token
        self.parser_type = parser_type.upper()

    def perform_as(self, actor):
        ability = actor.ability(UseTokenParsers)
        if self.parser_type == "DATE":
            value = ability.parse_date(self.token)
        elif self.parser_type == "DYNAMIC":
            value = ability.parse_dynamic_string(self.token)
        else:
            raise ValueError(f"Unsupported parser type: {self.parser_type}")

        actor.memory.remember(MemoryKeys.LAST_UTIL_RESULT, value)

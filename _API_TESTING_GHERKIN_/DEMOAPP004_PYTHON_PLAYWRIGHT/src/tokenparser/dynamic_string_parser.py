"""
Dynamic string token parser mirrored from the TypeScript implementation.

The parser honours the grammar defined in
`API Testing POC/tokenparser_api_contract.md` and is intentionally verbose so
that engineers can follow the Screenplay tests when they call into this module.
"""

from __future__ import annotations

import random
import re
from dataclasses import dataclass


class DynamicStringTokenError(ValueError):
    """Raised when a token fails validation."""


# Canonical character pools (contract states that these sets MUST be used).
ALPHA_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
NUMERIC_CHARS = "0123456789"
PUNCTUATION_CHARS = ".,!?;:"
SPECIAL_CHARS = "!@#$%^&*()_+[]{}|;:,.<>?"

# Regex copied from `SymbolsDS.DynamicStringRegex`.
TOKEN_PATTERN = re.compile(
    r"\[(?P<types>(?:(?:ALPHA|NUMERIC|PUNCTUATION|SPECIAL)(?:-(?!-))?)+)-"
    r"(?P<length>(?:[1-9]\d*|ALL))(?:-LINES-(?P<lines>\d+))?\]",
    re.ASCII,
)


@dataclass(frozen=True)
class ParsedDynamicStringToken:
    char_pool: str
    length: int | None
    lines: int


def _parse_token(token: str) -> ParsedDynamicStringToken:
    """Validate the token and extract structural information."""
    match = TOKEN_PATTERN.fullmatch(token)
    if not match:
        raise DynamicStringTokenError("Invalid string token format")

    types = match.group("types").split("-")
    length_token = match.group("length")
    lines = int(match.group("lines")) if match.group("lines") else 1

    if lines <= 0:
        raise DynamicStringTokenError("Invalid line count in token")

    pool_lookup = {
        "ALPHA": ALPHA_CHARS,
        "NUMERIC": NUMERIC_CHARS,
        "PUNCTUATION": PUNCTUATION_CHARS,
        "SPECIAL": SPECIAL_CHARS,
    }

    char_pool_parts = []
    for token_type in types:
        chars = pool_lookup.get(token_type)
        if not chars:
            raise DynamicStringTokenError("Invalid token type")
        char_pool_parts.append(chars)

    char_pool = "".join(char_pool_parts)
    if not char_pool:
        raise DynamicStringTokenError("No valid character types found in token")

    length = None if length_token == "ALL" else int(length_token)
    if length is not None and length <= 0:
        raise DynamicStringTokenError("Invalid length in token")

    return ParsedDynamicStringToken(char_pool=char_pool, length=length, lines=lines)


def generate_dynamic_string(token: str) -> str:
    """
    Generate one or more lines of characters based on the supplied token.

    - When `length` is numeric, characters are sampled randomly from the pool.
    - When `length` equals `ALL`, the entire pool is emitted once per line.
    - Lines are separated using Windows-style CRLF (`\\r\\n`) to mirror the
      existing TypeScript implementation and the contract.
    """
    parsed = _parse_token(token)
    rng = random.SystemRandom()  # crypto-strong randomness for stability
    lines = []

    for _ in range(parsed.lines):
        if parsed.length is None:  # ALL
            lines.append(parsed.char_pool)
        else:
            chars = "".join(
                parsed.char_pool[rng.randrange(len(parsed.char_pool))]
                for _ in range(parsed.length)
            )
            lines.append(chars)

    return "\r\n".join(lines)

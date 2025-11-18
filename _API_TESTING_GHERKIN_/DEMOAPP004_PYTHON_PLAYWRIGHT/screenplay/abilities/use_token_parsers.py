"""Ability exposing token parser utilities."""

from tokenparser.date_parser import parse_date_range_token, parse_date_token
from tokenparser.dynamic_string_parser import generate_dynamic_string


class UseTokenParsers:
    def parse_date(self, token: str):
        return parse_date_token(token)

    def parse_date_range(self, token: str):
        return parse_date_range_token(token)

    def parse_dynamic_string(self, token: str) -> str:
        return generate_dynamic_string(token)

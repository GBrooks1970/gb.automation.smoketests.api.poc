"""Simple key/value memory used by Screenplay actors."""

from __future__ import annotations

from typing import Any, Dict


class ActorMemory:
    """In-memory store for sharing data between tasks and questions."""

    def __init__(self) -> None:
        self._store: Dict[str, Any] = {}

    def remember(self, key: str, value: Any) -> None:
        self._store[key] = value

    def recall(self, key: str) -> Any:
        return self._store.get(key)

    def forget(self, key: str) -> None:
        if key in self._store:
            del self._store[key]

    def reset(self) -> None:
        self._store.clear()

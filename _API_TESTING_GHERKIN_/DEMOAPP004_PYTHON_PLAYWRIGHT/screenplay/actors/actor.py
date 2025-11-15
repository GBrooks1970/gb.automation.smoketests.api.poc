"""Screenplay actor implementation for the Python stack."""

from __future__ import annotations

from typing import Dict, Type, TypeVar

from screenplay.support.memory import ActorMemory

AbilityType = TypeVar("AbilityType")
Task = TypeVar("Task")


class Actor:
    """Encapsulates abilities and memory for Screenplay tasks/questions."""

    def __init__(self, name: str) -> None:
        self.name = name
        self._abilities: Dict[Type, AbilityType] = {}
        self.memory = ActorMemory()

    def can(self, ability: AbilityType) -> "Actor":
        """Attach an ability to the actor."""
        self._abilities[type(ability)] = ability
        return self

    def ability(self, ability_cls: Type[AbilityType]) -> AbilityType:
        return self._abilities[ability_cls]

    def forget(self) -> None:
        self.memory.reset()

    def attempts_to(self, *tasks: Task) -> None:
        for task in tasks:
            task.perform_as(self)

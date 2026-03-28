from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class RuleResult:
    rule_id: str
    passed: bool
    message: str
    weight: float = 1.0


class RuleEngine:
    def __init__(self) -> None:
        self._results: list[RuleResult] = []

    def add(self, rule_id: str, condition: bool, message: str, weight: float = 1.0) -> None:
        self._results.append(RuleResult(rule_id=rule_id, passed=condition, message=message, weight=weight))

    def results(self) -> list[RuleResult]:
        return self._results

    def trace(self) -> list[dict[str, Any]]:
        return [
            {"rule_id": r.rule_id, "passed": r.passed, "message": r.message, "weight": r.weight}
            for r in self._results
        ]

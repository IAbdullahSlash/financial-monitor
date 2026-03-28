from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SplitResult:
    user1_share: float
    user2_share: float
    objective_value: float


def grid_search_split(total: float, objective, step: int = 5000) -> SplitResult:
    best = SplitResult(user1_share=0.0, user2_share=total, objective_value=float("inf"))
    step = max(1, step)

    current = 0.0
    while current <= total:
        user1 = current
        user2 = total - current
        score = objective(user1, user2)
        if score < best.objective_value:
            best = SplitResult(user1_share=user1, user2_share=user2, objective_value=score)
        current += step

    return best

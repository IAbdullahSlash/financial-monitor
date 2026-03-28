from __future__ import annotations

from app.models.fire import FirePlannerRequest, FirePlannerResponse, GoalSipResult, MonthlyRoadmapPoint
from app.utils.finance import (
    heuristic_goal_allocation,
    required_monthly_sip,
    retirement_corpus,
)
from app.utils.monte_carlo import simulate_corpus_paths


class FinancialEngine:
    def compute_fire_plan(self, payload: FirePlannerRequest) -> FirePlannerResponse:
        years_to_retirement = max(1, payload.retirement_age - payload.age)

        annual_expenses_today = payload.expenses_monthly * 12
        retirement_corpus_required = retirement_corpus(
            annual_expenses_today=annual_expenses_today,
            inflation=payload.inflation,
            years_to_retire=years_to_retirement,
        )

        monthly_sip_retirement = required_monthly_sip(
            target_amount=retirement_corpus_required,
            annual_return=payload.expected_return,
            years=years_to_retirement,
            current_assets=payload.current_assets,
        )

        goal_results: list[GoalSipResult] = []
        for goal in payload.goals:
            allocation = heuristic_goal_allocation(goal.name, goal.years_to_goal)
            monthly_sip = required_monthly_sip(
                target_amount=goal.target_amount,
                annual_return=payload.expected_return,
                years=goal.years_to_goal,
                current_assets=0.0,
            )
            goal_results.append(
                GoalSipResult(
                    goal_name=goal.name,
                    monthly_sip=round(monthly_sip, 2),
                    target_amount=goal.target_amount,
                    allocation={
                        "equity_weight": round(allocation.equity_weight, 2),
                        "debt_weight": round(allocation.debt_weight, 2),
                    },
                )
            )

        total_monthly_investment_required = monthly_sip_retirement + sum(x.monthly_sip for x in goal_results)

        monthly_rate = (1 + payload.expected_return) ** (1 / 12) - 1
        months = years_to_retirement * 12
        roadmap: list[MonthlyRoadmapPoint] = []
        corpus = payload.current_assets
        for month in range(1, months + 1):
            corpus = corpus * (1 + monthly_rate) + total_monthly_investment_required
            roadmap.append(
                MonthlyRoadmapPoint(
                    month=month,
                    age=round(payload.age + month / 12.0, 2),
                    projected_corpus=round(corpus, 2),
                    contribution=round(total_monthly_investment_required, 2),
                )
            )

        monte_carlo = simulate_corpus_paths(
            start_corpus=payload.current_assets,
            monthly_contribution=total_monthly_investment_required,
            years=years_to_retirement,
            expected_annual_return=payload.expected_return,
            annual_volatility=payload.annual_volatility,
            inflation=payload.inflation,
            simulations=1200,
        )

        explainability = {
            "rules": [
                "Retirement corpus based on inflation-adjusted annuity method",
                "Goal SIP computed via monthly annuity future value inversion",
                "Allocation uses time-horizon heuristics",
            ],
            "inputs_used": payload.model_dump(),
        }

        return FirePlannerResponse(
            retirement_corpus_required=round(retirement_corpus_required, 2),
            monthly_sip_for_retirement=round(monthly_sip_retirement, 2),
            goals=goal_results,
            total_monthly_investment_required=round(total_monthly_investment_required, 2),
            roadmap=roadmap,
            monte_carlo=monte_carlo,
            explainability=explainability,
        )


financial_engine = FinancialEngine()

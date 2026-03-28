from __future__ import annotations

from dataclasses import dataclass


@dataclass
class GoalAllocation:
    goal_name: str
    years_to_goal: float
    equity_weight: float
    debt_weight: float


def effective_monthly_rate(annual_return: float) -> float:
    return (1 + annual_return) ** (1 / 12) - 1


def future_value_lumpsum(present_value: float, annual_return: float, years: float) -> float:
    return present_value * ((1 + annual_return) ** years)


def future_value_sip(monthly_investment: float, annual_return: float, years: float) -> float:
    months = int(max(years * 12, 1))
    monthly_rate = effective_monthly_rate(annual_return)
    if monthly_rate == 0:
        return monthly_investment * months
    return monthly_investment * (((1 + monthly_rate) ** months - 1) / monthly_rate)


def required_monthly_sip(target_amount: float, annual_return: float, years: float, current_assets: float = 0.0) -> float:
    months = int(max(years * 12, 1))
    monthly_rate = effective_monthly_rate(annual_return)
    fv_assets = current_assets * ((1 + monthly_rate) ** months)
    net_target = max(0.0, target_amount - fv_assets)
    if monthly_rate == 0:
        return net_target / months
    annuity_factor = (((1 + monthly_rate) ** months - 1) / monthly_rate)
    return net_target / annuity_factor


def retirement_corpus(annual_expenses_today: float, inflation: float, years_to_retire: float, post_retirement_years: int = 30, real_return_post_retirement: float = 0.01) -> float:
    first_year_expense_retirement = annual_expenses_today * ((1 + inflation) ** years_to_retire)
    if real_return_post_retirement <= 0:
        return first_year_expense_retirement * post_retirement_years
    corpus = first_year_expense_retirement * (1 - (1 + real_return_post_retirement) ** (-post_retirement_years)) / real_return_post_retirement
    return corpus


def heuristic_goal_allocation(goal_name: str, years_to_goal: float) -> GoalAllocation:
    if years_to_goal >= 12:
        eq = 0.8
    elif years_to_goal >= 7:
        eq = 0.65
    elif years_to_goal >= 4:
        eq = 0.45
    else:
        eq = 0.2
    return GoalAllocation(goal_name=goal_name, years_to_goal=years_to_goal, equity_weight=eq, debt_weight=1 - eq)

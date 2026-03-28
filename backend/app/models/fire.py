from __future__ import annotations

from pydantic import BaseModel, Field


class GoalInput(BaseModel):
    name: str
    target_amount: float = Field(gt=0)
    years_to_goal: float = Field(gt=0)


class FirePlannerRequest(BaseModel):
    age: int = Field(ge=18, le=75)
    income_monthly: float = Field(gt=0)
    expenses_monthly: float = Field(gt=0)
    inflation: float = Field(default=0.06, ge=0.0, le=0.2)
    expected_return: float = Field(default=0.11, ge=0.0, le=0.3)
    annual_volatility: float = Field(default=0.16, ge=0.01, le=0.8)
    current_assets: float = Field(default=0.0, ge=0.0)
    retirement_age: int = Field(default=55, ge=30, le=80)
    goals: list[GoalInput] = Field(default_factory=list)


class MonthlyRoadmapPoint(BaseModel):
    month: int
    age: float
    projected_corpus: float
    contribution: float


class GoalSipResult(BaseModel):
    goal_name: str
    monthly_sip: float
    target_amount: float
    allocation: dict


class FirePlannerResponse(BaseModel):
    retirement_corpus_required: float
    monthly_sip_for_retirement: float
    goals: list[GoalSipResult]
    total_monthly_investment_required: float
    roadmap: list[MonthlyRoadmapPoint]
    monte_carlo: dict
    explainability: dict

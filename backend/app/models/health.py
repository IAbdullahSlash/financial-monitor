from __future__ import annotations

from pydantic import BaseModel, Field


class HealthScoreRequest(BaseModel):
    monthly_expenses: float = Field(gt=0)
    emergency_fund: float = Field(ge=0)
    annual_income: float = Field(gt=0)
    annual_insurance_cover: float = Field(ge=0)
    monthly_debt_obligation: float = Field(ge=0)
    equity_percent: float = Field(ge=0, le=100)
    debt_percent: float = Field(ge=0, le=100)
    other_assets_percent: float = Field(ge=0, le=100)
    tax_saving_utilization_percent: float = Field(ge=0, le=100)
    retirement_progress_percent: float = Field(ge=0, le=100)


class HealthScoreResponse(BaseModel):
    score: float
    weighted_breakdown: dict
    recommendations: list[str]
    explainability: dict

from __future__ import annotations

from pydantic import BaseModel, Field


class LifeEventRequest(BaseModel):
    event_type: str = Field(description="bonus | marriage | child | inheritance")
    amount: float = Field(gt=0)
    annual_income: float = Field(gt=0)
    monthly_expenses: float = Field(gt=0)
    emergency_fund: float = Field(ge=0)
    high_interest_debt: float = Field(ge=0)
    risk_profile: str = Field(default="moderate")


class LifeEventResponse(BaseModel):
    optimized_split: dict
    recommendations: list[str]
    tax_impact_estimate: dict
    explainability: dict

from __future__ import annotations

from pydantic import BaseModel, Field


class PartnerIncome(BaseModel):
    annual_income: float = Field(gt=0)
    current_80c: float = Field(default=0, ge=0)
    current_80d: float = Field(default=0, ge=0)


class CouplesPlannerRequest(BaseModel):
    partner1: PartnerIncome
    partner2: PartnerIncome
    investible_amount: float = Field(gt=0)
    risk_profile: str = Field(default="moderate")


class CouplesPlannerResponse(BaseModel):
    recommended_split: dict
    joint_tax_outcome: dict
    target_asset_allocation: dict
    explainability: dict

from __future__ import annotations

from pydantic import BaseModel, Field


class Form16Payload(BaseModel):
    basic_salary: float = Field(ge=0)
    hra_received: float = Field(default=0, ge=0)
    special_allowance: float = Field(default=0, ge=0)
    other_income: float = Field(default=0, ge=0)


class DeductionPayload(BaseModel):
    section_80c: float = Field(default=0, ge=0)
    section_80d: float = Field(default=0, ge=0)
    section_80ccd_1b: float = Field(default=0, ge=0)
    home_loan_interest: float = Field(default=0, ge=0)
    hra_exemption_claim: float = Field(default=0, ge=0)


class TaxOptimizationRequest(BaseModel):
    form16: Form16Payload
    deductions: DeductionPayload = Field(default_factory=DeductionPayload)
    city_type: str = Field(default="metro", description="metro | non_metro")
    rent_paid_annual: float = Field(default=0, ge=0)


class TaxOptimizationResponse(BaseModel):
    gross_income: float
    old_regime_tax: float
    new_regime_tax: float
    better_regime: str
    potential_tax_saving: float
    deduction_optimization: dict
    explainability: dict

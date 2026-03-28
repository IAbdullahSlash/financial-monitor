from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class PortfolioTxn(BaseModel):
    scheme_code: int
    scheme_name: str
    date: date
    amount: float
    units: float
    txn_type: str = Field(description="buy | sell")


class PortfolioXRayRequest(BaseModel):
    transactions: list[PortfolioTxn]


class PortfolioUploadResponse(BaseModel):
    transactions: list[PortfolioTxn]


class PortfolioXRayResponse(BaseModel):
    portfolio_value: float
    xirr: float
    holdings: list[dict]
    overlap_analysis: dict
    expense_ratio_drag: dict
    benchmark_comparison: dict
    explainability: dict

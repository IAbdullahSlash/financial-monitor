from fastapi import APIRouter

from app.models.tax import TaxOptimizationRequest, TaxOptimizationResponse
from app.services.tax_engine import tax_engine

router = APIRouter()


@router.post("/optimize", response_model=TaxOptimizationResponse)
def optimize_tax(payload: TaxOptimizationRequest) -> TaxOptimizationResponse:
    return tax_engine.optimize_tax(payload)

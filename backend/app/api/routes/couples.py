from fastapi import APIRouter

from app.models.couples import CouplesPlannerRequest, CouplesPlannerResponse
from app.services.optimization_engine import optimization_engine

router = APIRouter()


@router.post("/plan", response_model=CouplesPlannerResponse)
def optimize_couples_plan(payload: CouplesPlannerRequest) -> CouplesPlannerResponse:
    return optimization_engine.optimize_couples_plan(payload)

from fastapi import APIRouter

from app.models.fire import FirePlannerRequest, FirePlannerResponse
from app.services.financial_engine import financial_engine

router = APIRouter()


@router.post("/plan", response_model=FirePlannerResponse)
def build_fire_plan(payload: FirePlannerRequest) -> FirePlannerResponse:
    return financial_engine.compute_fire_plan(payload)

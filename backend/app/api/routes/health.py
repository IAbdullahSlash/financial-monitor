from fastapi import APIRouter

from app.models.health import HealthScoreRequest, HealthScoreResponse
from app.services.risk_engine import risk_engine

router = APIRouter()


@router.post("/score", response_model=HealthScoreResponse)
def compute_health_score(payload: HealthScoreRequest) -> HealthScoreResponse:
    return risk_engine.compute_health_score(payload)

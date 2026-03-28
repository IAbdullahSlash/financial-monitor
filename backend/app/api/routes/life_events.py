from fastapi import APIRouter

from app.models.life_events import LifeEventRequest, LifeEventResponse
from app.services.life_event_engine import life_event_engine

router = APIRouter()


@router.post("/advise", response_model=LifeEventResponse)
def advise_life_event(payload: LifeEventRequest) -> LifeEventResponse:
    return life_event_engine.advise(payload)

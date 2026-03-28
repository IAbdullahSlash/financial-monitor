from fastapi import APIRouter

from app.api.routes.couples import router as couples_router
from app.api.routes.fire import router as fire_router
from app.api.routes.health import router as health_router
from app.api.routes.life_events import router as life_events_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.tax import router as tax_router

api_router = APIRouter()
api_router.include_router(fire_router, prefix="/fire", tags=["fire-planner"])
api_router.include_router(health_router, prefix="/health-score", tags=["health-score"])
api_router.include_router(life_events_router, prefix="/life-events", tags=["life-event-advisor"])
api_router.include_router(tax_router, prefix="/tax", tags=["tax-optimizer"])
api_router.include_router(couples_router, prefix="/couples", tags=["couples-planner"])
api_router.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio-xray"])

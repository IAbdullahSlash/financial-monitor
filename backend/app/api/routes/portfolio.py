from fastapi import APIRouter, File, HTTPException, UploadFile

from app.data.alpha_vantage_client import alpha_vantage_client
from app.data.nav_repository import nav_repository
from app.models.portfolio import PortfolioUploadResponse, PortfolioXRayRequest, PortfolioXRayResponse
from app.services.portfolio_engine import portfolio_engine

router = APIRouter()


@router.post("/upload-statement", response_model=PortfolioUploadResponse)
async def upload_statement(file: UploadFile = File(...)) -> PortfolioUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV statements are supported in this version")

    content = await file.read()
    try:
        txns = portfolio_engine.parse_statement_csv(content)
        return PortfolioUploadResponse(transactions=txns)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/xray", response_model=PortfolioXRayResponse)
def generate_portfolio_xray(payload: PortfolioXRayRequest) -> PortfolioXRayResponse:
    return portfolio_engine.analyze(payload)


@router.get("/nav/{scheme_code}")
def get_latest_nav(scheme_code: int) -> dict:
	nav = nav_repository.latest_nav_for_scheme_code(scheme_code)
	if nav is None:
		raise HTTPException(status_code=404, detail="Scheme code not found in local NAV dataset")
	return {
		"scheme_code": nav.scheme_code,
		"scheme_name": nav.scheme_name,
		"nav": nav.nav,
		"date": nav.date.date().isoformat(),
	}


@router.get("/market/quote/{symbol}")
def get_market_quote(symbol: str) -> dict:
	try:
		data = alpha_vantage_client.global_quote(symbol)
		return {"provider": "alpha_vantage", "symbol": symbol, "data": data}
	except Exception as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/market/daily/{symbol}")
def get_market_daily(symbol: str, compact: bool = True) -> dict:
	try:
		data = alpha_vantage_client.daily_series(symbol, compact=compact)
		return {"provider": "alpha_vantage", "symbol": symbol, "compact": compact, "data": data}
	except Exception as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc

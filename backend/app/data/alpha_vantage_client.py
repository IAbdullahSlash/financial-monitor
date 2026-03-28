from __future__ import annotations

import requests

from app.core.config import settings


class AlphaVantageClient:
    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.alpha_vantage_api_key

    def _ensure_key(self) -> None:
        if not self.api_key:
            raise ValueError("Alpha Vantage API key is not configured")

    def global_quote(self, symbol: str) -> dict:
        self._ensure_key()
        response = requests.get(
            self.BASE_URL,
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key,
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def daily_series(self, symbol: str, compact: bool = True) -> dict:
        self._ensure_key()
        response = requests.get(
            self.BASE_URL,
            params={
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": "compact" if compact else "full",
                "apikey": self.api_key,
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()


alpha_vantage_client = AlphaVantageClient()

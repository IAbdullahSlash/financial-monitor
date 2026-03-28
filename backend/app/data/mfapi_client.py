from __future__ import annotations

import requests

from app.core.config import settings


class MfApiClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or settings.mfapi_base_url

    def fetch_scheme_history(self, scheme_code: int) -> dict:
        response = requests.get(f"{self.base_url}/{scheme_code}", timeout=10)
        response.raise_for_status()
        return response.json()


mfapi_client = MfApiClient()

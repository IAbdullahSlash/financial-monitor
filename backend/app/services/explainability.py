from __future__ import annotations

import requests

from app.core.config import settings


class ExplainabilityService:
    def explain(self, summary_prompt: str, fallback_trace: dict) -> dict:
        if not settings.ollama_enabled:
            return {
                "mode": "rule-trace",
                "explanation": "Local LLM disabled; returning deterministic explanation trace.",
                "trace": fallback_trace,
            }

        try:
            response = requests.post(
                settings.ollama_base_url,
                json={
                    "model": settings.ollama_model,
                    "prompt": summary_prompt,
                    "stream": False,
                },
                timeout=20,
            )
            response.raise_for_status()
            payload = response.json()
            return {
                "mode": "ollama-local",
                "explanation": payload.get("response", "No explanation generated"),
                "trace": fallback_trace,
            }
        except Exception:
            return {
                "mode": "rule-trace-fallback",
                "explanation": "Ollama unavailable; using deterministic explanation trace.",
                "trace": fallback_trace,
            }


explainability_service = ExplainabilityService()

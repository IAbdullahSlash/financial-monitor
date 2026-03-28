from __future__ import annotations

import json
from typing import Any, Optional

import redis

from app.core.config import settings


class CacheClient:
    def __init__(self) -> None:
        self._client: redis.Redis | None = None
        self._memory: dict[str, str] = {}

    def _ensure_client(self) -> redis.Redis | None:
        if self._client:
            return self._client
        try:
            self._client = redis.Redis.from_url(settings.redis_url, decode_responses=True)
            self._client.ping()
            return self._client
        except Exception:
            self._client = None
            return None

    def set_json(self, key: str, value: Any, ttl_sec: int = 300) -> None:
        payload = json.dumps(value)
        client = self._ensure_client()
        if client:
            client.setex(key, ttl_sec, payload)
            return
        self._memory[key] = payload

    def get_json(self, key: str) -> Optional[Any]:
        client = self._ensure_client()
        payload = client.get(key) if client else self._memory.get(key)
        if not payload:
            return None
        return json.loads(payload)


cache_client = CacheClient()

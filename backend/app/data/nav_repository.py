from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import pandas as pd

from app.core.config import settings


@dataclass
class NavRecord:
    scheme_code: int
    scheme_name: str
    nav: float
    date: datetime


class NavRepository:
    def __init__(self, file_path: str | None = None) -> None:
        self.file_path = Path(file_path or settings.nav_file_path)
        if not self.file_path.is_absolute():
            self.file_path = Path(__file__).resolve().parents[3] / self.file_path
        self._df: pd.DataFrame | None = None

    def _load(self) -> pd.DataFrame:
        if self._df is not None:
            return self._df

        records: list[dict] = []
        with self.file_path.open("r", encoding="utf-8") as f:
            for line in f:
                parts = [x.strip() for x in line.split(";")]
                if len(parts) != 6:
                    continue
                if not parts[0].isdigit():
                    continue
                try:
                    records.append(
                        {
                            "scheme_code": int(parts[0]),
                            "isin_growth": parts[1],
                            "isin_reinvest": parts[2],
                            "scheme_name": parts[3],
                            "nav": float(parts[4]),
                            "date": datetime.strptime(parts[5], "%d-%b-%Y"),
                        }
                    )
                except Exception:
                    continue

        self._df = pd.DataFrame(records)
        if self._df.empty:
            raise ValueError("No NAV rows parsed from NAV source file")
        return self._df

    def latest_nav_for_scheme_code(self, scheme_code: int) -> NavRecord | None:
        df = self._load()
        subset = df[df["scheme_code"] == scheme_code]
        if subset.empty:
            return None
        row = subset.sort_values("date", ascending=False).iloc[0]
        return NavRecord(
            scheme_code=int(row["scheme_code"]),
            scheme_name=str(row["scheme_name"]),
            nav=float(row["nav"]),
            date=row["date"],
        )

    def latest_nav_by_name_contains(self, scheme_keyword: str) -> list[NavRecord]:
        df = self._load()
        subset = df[df["scheme_name"].str.contains(scheme_keyword, case=False, na=False)]
        if subset.empty:
            return []
        latest = subset.sort_values("date", ascending=False).drop_duplicates(subset=["scheme_code"])
        return [
            NavRecord(
                scheme_code=int(row["scheme_code"]),
                scheme_name=str(row["scheme_name"]),
                nav=float(row["nav"]),
                date=row["date"],
            )
            for _, row in latest.iterrows()
        ]


nav_repository = NavRepository()

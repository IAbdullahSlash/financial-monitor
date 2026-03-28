from __future__ import annotations

import csv
import io
from collections import defaultdict
from datetime import date

from app.data.mfapi_client import mfapi_client
from app.data.nav_repository import nav_repository
from app.models.portfolio import PortfolioTxn, PortfolioXRayRequest, PortfolioXRayResponse
from app.utils.xirr import xirr


class PortfolioEngine:
    def parse_statement_csv(self, content: bytes) -> list[PortfolioTxn]:
        text = content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
        txns: list[PortfolioTxn] = []

        for row in reader:
            txn = PortfolioTxn(
                scheme_code=int(row["scheme_code"]),
                scheme_name=row["scheme_name"],
                date=date.fromisoformat(row["date"]),
                amount=float(row["amount"]),
                units=float(row["units"]),
                txn_type=row.get("txn_type", "buy").lower(),
            )
            txns.append(txn)

        if not txns:
            raise ValueError("No transactions could be parsed from CSV")
        return txns

    def _latest_nav(self, scheme_code: int) -> float:
        local = nav_repository.latest_nav_for_scheme_code(scheme_code)
        if local:
            return local.nav

        remote = mfapi_client.fetch_scheme_history(scheme_code)
        history = remote.get("data", [])
        if not history:
            raise ValueError(f"No NAV data found for scheme code {scheme_code}")
        return float(history[0]["nav"])

    def _expense_ratio_estimate(self, scheme_name: str) -> float:
        name = scheme_name.lower()
        if "direct" in name:
            return 0.008
        if "debt" in name or "liquid" in name:
            return 0.011
        return 0.018

    def _token_similarity(self, a: str, b: str) -> float:
        tokens_a = {x for x in a.lower().replace("-", " ").split() if len(x) > 2}
        tokens_b = {x for x in b.lower().replace("-", " ").split() if len(x) > 2}
        if not tokens_a or not tokens_b:
            return 0.0
        return len(tokens_a.intersection(tokens_b)) / len(tokens_a.union(tokens_b))

    def analyze(self, payload: PortfolioXRayRequest) -> PortfolioXRayResponse:
        units_by_scheme = defaultdict(float)
        amount_invested_by_scheme = defaultdict(float)
        names = {}

        for txn in payload.transactions:
            direction = 1 if txn.txn_type.lower() == "buy" else -1
            units_by_scheme[txn.scheme_code] += direction * txn.units
            amount_invested_by_scheme[txn.scheme_code] += direction * txn.amount
            names[txn.scheme_code] = txn.scheme_name

        holdings = []
        total_value = 0.0
        for scheme_code, units in units_by_scheme.items():
            if units <= 0:
                continue
            nav = self._latest_nav(scheme_code)
            value = units * nav
            total_value += value
            holdings.append(
                {
                    "scheme_code": scheme_code,
                    "scheme_name": names[scheme_code],
                    "units": round(units, 4),
                    "latest_nav": round(nav, 4),
                    "market_value": round(value, 2),
                    "invested_amount": round(amount_invested_by_scheme[scheme_code], 2),
                }
            )

        for h in holdings:
            h["weight"] = round((h["market_value"] / total_value) * 100, 2) if total_value > 0 else 0

        cashflows = []
        dates = []
        for txn in payload.transactions:
            direction = -1 if txn.txn_type.lower() == "buy" else 1
            cashflows.append(direction * txn.amount)
            dates.append(txn.date)
        cashflows.append(total_value)
        dates.append(date.today())
        portfolio_xirr = xirr(cashflows, dates)

        overlaps = []
        for idx, first in enumerate(holdings):
            for second in holdings[idx + 1 :]:
                sim = self._token_similarity(first["scheme_name"], second["scheme_name"])
                if sim >= 0.25:
                    overlaps.append(
                        {
                            "fund_a": first["scheme_name"],
                            "fund_b": second["scheme_name"],
                            "similarity_score": round(sim, 2),
                        }
                    )

        weighted_expense_ratio = sum(
            self._expense_ratio_estimate(h["scheme_name"]) * (h["market_value"] / total_value)
            for h in holdings
        ) if total_value > 0 else 0.0

        annual_expense_drag = total_value * weighted_expense_ratio
        benchmark_assumption = 0.12

        explainability = {
            "nav_source_priority": ["local NAV dataset", "mfapi fallback"],
            "xirr_method": "Newton-Raphson with dated cashflows",
            "overlap_method": "Token-based holdings similarity proxy",
        }

        return PortfolioXRayResponse(
            portfolio_value=round(total_value, 2),
            xirr=round(portfolio_xirr * 100, 2),
            holdings=holdings,
            overlap_analysis={
                "high_overlap_pairs": overlaps,
                "pair_count": len(overlaps),
            },
            expense_ratio_drag={
                "weighted_expense_ratio_percent": round(weighted_expense_ratio * 100, 2),
                "annual_drag_rupees": round(annual_expense_drag, 2),
            },
            benchmark_comparison={
                "benchmark_assumption_percent": benchmark_assumption * 100,
                "alpha_percent": round((portfolio_xirr - benchmark_assumption) * 100, 2),
            },
            explainability=explainability,
        )


portfolio_engine = PortfolioEngine()

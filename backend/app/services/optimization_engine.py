from __future__ import annotations

from app.models.couples import CouplesPlannerRequest, CouplesPlannerResponse
from app.services.tax_engine import tax_engine
from app.utils.optimization import grid_search_split


class OptimizationEngine:
    def _allocation_for_risk(self, risk_profile: str) -> dict:
        mapping = {
            "conservative": {"equity": 0.30, "debt": 0.60, "gold": 0.10},
            "moderate": {"equity": 0.55, "debt": 0.35, "gold": 0.10},
            "aggressive": {"equity": 0.75, "debt": 0.20, "gold": 0.05},
        }
        return mapping.get(risk_profile.lower(), mapping["moderate"])

    def optimize_couples_plan(self, payload: CouplesPlannerRequest) -> CouplesPlannerResponse:
        investible_amount = payload.investible_amount

        def objective(partner1_share: float, partner2_share: float) -> float:
            p1_ded_80c = min(150_000, payload.partner1.current_80c + partner1_share)
            p2_ded_80c = min(150_000, payload.partner2.current_80c + partner2_share)

            p1_taxable = max(0.0, payload.partner1.annual_income - 50_000 - p1_ded_80c - payload.partner1.current_80d)
            p2_taxable = max(0.0, payload.partner2.annual_income - 50_000 - p2_ded_80c - payload.partner2.current_80d)

            p1_tax = tax_engine._apply_cess(tax_engine._slab_tax_old(p1_taxable))
            p2_tax = tax_engine._apply_cess(tax_engine._slab_tax_old(p2_taxable))
            return p1_tax + p2_tax

        best = grid_search_split(investible_amount, objective=objective, step=5000)

        target_alloc = self._allocation_for_risk(payload.risk_profile)

        p1_final_taxable = max(
            0.0,
            payload.partner1.annual_income
            - 50_000
            - min(150_000, payload.partner1.current_80c + best.user1_share)
            - payload.partner1.current_80d,
        )
        p2_final_taxable = max(
            0.0,
            payload.partner2.annual_income
            - 50_000
            - min(150_000, payload.partner2.current_80c + best.user2_share)
            - payload.partner2.current_80d,
        )

        explainability = {
            "method": "Grid-search constrained optimization",
            "constraint": "partner split sums to total investible amount",
            "objective": "minimize combined old-regime tax outflow",
        }

        return CouplesPlannerResponse(
            recommended_split={
                "partner1_80c_investment": round(best.user1_share, 2),
                "partner2_80c_investment": round(best.user2_share, 2),
            },
            joint_tax_outcome={
                "combined_tax_after_optimization": round(best.objective_value, 2),
                "partner1_taxable_income": round(p1_final_taxable, 2),
                "partner2_taxable_income": round(p2_final_taxable, 2),
            },
            target_asset_allocation=target_alloc,
            explainability=explainability,
        )


optimization_engine = OptimizationEngine()

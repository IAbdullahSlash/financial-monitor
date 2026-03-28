from __future__ import annotations

from app.models.life_events import LifeEventRequest, LifeEventResponse


class LifeEventEngine:
    def _allocation_template(self, event_type: str) -> dict:
        templates = {
            "bonus": {"emergency_topup": 0.20, "debt_prepay": 0.30, "tax_saver": 0.25, "invest": 0.25},
            "marriage": {"liquidity_buffer": 0.40, "short_term_debt_fund": 0.30, "tax_saver": 0.15, "long_term_invest": 0.15},
            "child": {"emergency_topup": 0.25, "health_cover": 0.20, "child_goal_equity": 0.30, "debt_fund": 0.25},
            "inheritance": {"debt_prepay": 0.25, "emergency_topup": 0.15, "equity_index": 0.40, "tax_reserve": 0.20},
        }
        return templates.get(event_type.lower(), templates["bonus"])

    def advise(self, payload: LifeEventRequest) -> LifeEventResponse:
        template = self._allocation_template(payload.event_type)
        optimized_split = {k: round(payload.amount * v, 2) for k, v in template.items()}

        emergency_target = payload.monthly_expenses * 6
        emergency_gap = max(0.0, emergency_target - payload.emergency_fund)

        recommendations: list[str] = []
        if emergency_gap > 0:
            recommendations.append(f"Allocate at least ₹{round(min(emergency_gap, payload.amount), 2):,.2f} to emergency corpus")
        if payload.high_interest_debt > 0:
            recommendations.append("Prepay high-interest debt before increasing market exposure")
        if payload.event_type.lower() in {"bonus", "inheritance"}:
            recommendations.append("Use available 80C/80CCD(1B) headroom to reduce tax")
        if payload.event_type.lower() == "child":
            recommendations.append("Increase term + health insurance coverage before long-term investing")

        tax_impact_estimate = {
            "possible_deduction_routed": round(min(payload.amount * 0.25, 200_000), 2),
            "estimated_tax_saved": round(min(payload.amount * 0.25, 200_000) * 0.312, 2),
            "liquidity_post_plan": round(max(payload.amount * template.get("liquidity_buffer", 0.0), 0.0), 2),
        }

        explainability = {
            "event_template": template,
            "heuristics": [
                "Liquidity priority for near-term obligations",
                "High-interest debt repayment before risk assets",
                "Tax-advantaged allocation before non-deductible deployment",
            ],
            "risk_profile_used": payload.risk_profile,
        }

        return LifeEventResponse(
            optimized_split=optimized_split,
            recommendations=recommendations,
            tax_impact_estimate=tax_impact_estimate,
            explainability=explainability,
        )


life_event_engine = LifeEventEngine()

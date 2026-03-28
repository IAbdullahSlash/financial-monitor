from __future__ import annotations

from typing import Any

from app.models.health import HealthScoreRequest, HealthScoreResponse
from app.services.ml_scoring import health_score_calibrator
from app.utils.rule_engine import RuleEngine


class RiskEngine:
    WEIGHTS = {
        "emergency_fund": 0.20,
        "insurance": 0.15,
        "debt_to_income": 0.20,
        "diversification": 0.15,
        "tax_efficiency": 0.15,
        "retirement_readiness": 0.15,
    }

    def _score_emergency(self, monthly_expenses: float, emergency_fund: float) -> float:
        months_cover = emergency_fund / monthly_expenses
        return min(100.0, (months_cover / 6.0) * 100)

    def _score_insurance(self, annual_income: float, annual_insurance_cover: float) -> float:
        recommended_cover = annual_income * 10
        return min(100.0, (annual_insurance_cover / max(recommended_cover, 1)) * 100)

    def _score_debt(self, annual_income: float, monthly_debt_obligation: float) -> float:
        dti = (monthly_debt_obligation * 12) / annual_income
        if dti <= 0.2:
            return 100.0
        if dti <= 0.35:
            return 70.0
        if dti <= 0.5:
            return 40.0
        return 20.0

    def _score_diversification(self, equity: float, debt: float, other_assets: float) -> float:
        penalty = abs(equity - 60) * 0.5 + abs(debt - 30) * 0.5 + abs(other_assets - 10) * 0.5
        return max(0.0, 100 - penalty)

    def compute_health_score(self, payload: HealthScoreRequest) -> HealthScoreResponse:
        emergency = self._score_emergency(payload.monthly_expenses, payload.emergency_fund)
        insurance = self._score_insurance(payload.annual_income, payload.annual_insurance_cover)
        debt = self._score_debt(payload.annual_income, payload.monthly_debt_obligation)
        diversification = self._score_diversification(payload.equity_percent, payload.debt_percent, payload.other_assets_percent)
        tax_efficiency = payload.tax_saving_utilization_percent
        retirement = payload.retirement_progress_percent

        breakdown = {
            "emergency_fund": round(emergency, 2),
            "insurance": round(insurance, 2),
            "debt_to_income": round(debt, 2),
            "diversification": round(diversification, 2),
            "tax_efficiency": round(tax_efficiency, 2),
            "retirement_readiness": round(retirement, 2),
        }

        weighted_score = sum(breakdown[k] * self.WEIGHTS[k] for k in self.WEIGHTS)
        ml_output = health_score_calibrator.calibrate(breakdown)
        final_score = (0.75 * weighted_score) + (0.25 * ml_output.calibrated_score)

        engine = RuleEngine()
        engine.add("EF_01", emergency >= 70, "Emergency fund should be >= 6 months")
        engine.add("INS_01", insurance >= 70, "Insurance cover should be around 10x annual income")
        engine.add("DEBT_01", debt >= 70, "Debt-to-income ratio should stay below 35%")
        engine.add("DIV_01", diversification >= 70, "Improve asset diversification between equity/debt/other")
        engine.add("TAX_01", tax_efficiency >= 70, "Use available deductions and exemptions")
        engine.add("RET_01", retirement >= 70, "Retirement savings pace is behind plan")

        recommendations: list[str] = []
        for result in engine.results():
            if not result.passed:
                recommendations.append(result.message)

        explainability: dict[str, Any] = {
            "weights": self.WEIGHTS,
            "rule_trace": engine.trace(),
            "top_impact_factors": sorted(breakdown.items(), key=lambda x: x[1])[:3],
            "ml": {
                "model": "GradientBoostingRegressor",
                "calibrated_score": ml_output.calibrated_score,
                "feature_importance": ml_output.feature_importance,
            },
        }

        return HealthScoreResponse(
            score=round(final_score, 2),
            weighted_breakdown={
                key: round(value * self.WEIGHTS[key], 2)
                for key, value in breakdown.items()
            },
            recommendations=recommendations,
            explainability=explainability,
        )


risk_engine = RiskEngine()

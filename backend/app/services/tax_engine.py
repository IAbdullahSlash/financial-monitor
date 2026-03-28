from __future__ import annotations

from dataclasses import dataclass

from app.models.tax import DeductionPayload, TaxOptimizationRequest, TaxOptimizationResponse


@dataclass
class TaxBreakdown:
    taxable_income: float
    base_tax: float
    cess: float
    total_tax: float


class TaxEngine:
    STANDARD_DEDUCTION = 50_000

    def _slab_tax_old(self, taxable_income: float) -> float:
        tax = 0.0
        slabs = [
            (250_000, 0.00),
            (500_000, 0.05),
            (1_000_000, 0.20),
            (float("inf"), 0.30),
        ]
        previous = 0.0
        for limit, rate in slabs:
            if taxable_income <= previous:
                break
            chunk = min(taxable_income, limit) - previous
            tax += max(0.0, chunk) * rate
            previous = limit

        if taxable_income <= 500_000:
            return 0.0
        return tax

    def _slab_tax_new(self, taxable_income: float) -> float:
        tax = 0.0
        slabs = [
            (300_000, 0.00),
            (600_000, 0.05),
            (900_000, 0.10),
            (1_200_000, 0.15),
            (1_500_000, 0.20),
            (float("inf"), 0.30),
        ]
        previous = 0.0
        for limit, rate in slabs:
            if taxable_income <= previous:
                break
            chunk = min(taxable_income, limit) - previous
            tax += max(0.0, chunk) * rate
            previous = limit

        if taxable_income <= 1_200_000:
            return 0.0
        return tax

    def _apply_cess(self, tax: float) -> float:
        return tax * 1.04

    def compute_hra_exemption(self, basic_salary: float, hra_received: float, rent_paid_annual: float, city_type: str) -> float:
        ten_percent_salary = 0.10 * basic_salary
        excess_rent = max(0.0, rent_paid_annual - ten_percent_salary)
        salary_share_cap = (0.50 if city_type == "metro" else 0.40) * basic_salary
        return max(0.0, min(hra_received, excess_rent, salary_share_cap))

    def _eligible_old_deductions(self, deductions: DeductionPayload, hra_exemption: float) -> float:
        return (
            min(deductions.section_80c, 150_000)
            + min(deductions.section_80d, 25_000)
            + min(deductions.section_80ccd_1b, 50_000)
            + min(deductions.home_loan_interest, 200_000)
            + max(hra_exemption, deductions.hra_exemption_claim)
        )

    def tax_old_regime(self, gross_income: float, deductions: DeductionPayload, hra_exemption: float) -> TaxBreakdown:
        taxable = max(0.0, gross_income - self.STANDARD_DEDUCTION - self._eligible_old_deductions(deductions, hra_exemption))
        base_tax = self._slab_tax_old(taxable)
        total = self._apply_cess(base_tax)
        return TaxBreakdown(taxable_income=taxable, base_tax=base_tax, cess=total - base_tax, total_tax=total)

    def tax_new_regime(self, gross_income: float) -> TaxBreakdown:
        taxable = max(0.0, gross_income - self.STANDARD_DEDUCTION)
        base_tax = self._slab_tax_new(taxable)
        total = self._apply_cess(base_tax)
        return TaxBreakdown(taxable_income=taxable, base_tax=base_tax, cess=total - base_tax, total_tax=total)

    def deduction_headroom(self, deductions: DeductionPayload) -> dict:
        headroom = {
            "80C": max(0.0, 150_000 - deductions.section_80c),
            "80D": max(0.0, 25_000 - deductions.section_80d),
            "80CCD_1B": max(0.0, 50_000 - deductions.section_80ccd_1b),
            "SECTION_24": max(0.0, 200_000 - deductions.home_loan_interest),
        }
        max_rank_tax_rate = 0.30
        ranked = {
            k: {
                "remaining_limit": v,
                "max_tax_saving_estimate": round(v * max_rank_tax_rate * 1.04, 2),
            }
            for k, v in headroom.items()
            if v > 0
        }
        return ranked

    def optimize_tax(self, payload: TaxOptimizationRequest) -> TaxOptimizationResponse:
        gross_income = (
            payload.form16.basic_salary
            + payload.form16.hra_received
            + payload.form16.special_allowance
            + payload.form16.other_income
        )
        hra_exemption = self.compute_hra_exemption(
            basic_salary=payload.form16.basic_salary,
            hra_received=payload.form16.hra_received,
            rent_paid_annual=payload.rent_paid_annual,
            city_type=payload.city_type,
        )

        old = self.tax_old_regime(gross_income, payload.deductions, hra_exemption)
        new = self.tax_new_regime(gross_income)

        better = "old" if old.total_tax < new.total_tax else "new"
        savings = abs(old.total_tax - new.total_tax)

        deduction_optimization = self.deduction_headroom(payload.deductions)

        explainability = {
            "fy_assumption": "FY 2025-26 default slab assumptions; keep configurable",
            "old_regime_taxable_income": round(old.taxable_income, 2),
            "new_regime_taxable_income": round(new.taxable_income, 2),
            "hra_exemption_used": round(hra_exemption, 2),
            "rule_trace": [
                "Old regime uses deductions + standard deduction",
                "New regime uses standard deduction and lower slab rates",
                "4% health and education cess applied",
            ],
        }

        return TaxOptimizationResponse(
            gross_income=round(gross_income, 2),
            old_regime_tax=round(old.total_tax, 2),
            new_regime_tax=round(new.total_tax, 2),
            better_regime=better,
            potential_tax_saving=round(savings, 2),
            deduction_optimization=deduction_optimization,
            explainability=explainability,
        )


tax_engine = TaxEngine()

from __future__ import annotations

from datetime import date
from typing import Iterable, Sequence


def xnpv(rate: float, cashflows: Sequence[float], dates: Sequence[date]) -> float:
    d0 = dates[0]
    return sum(cf / (1 + rate) ** ((d - d0).days / 365.0) for cf, d in zip(cashflows, dates))


def xirr(cashflows: Iterable[float], dates: Iterable[date], guess: float = 0.12) -> float:
    flow_list = list(cashflows)
    date_list = list(dates)

    if len(flow_list) != len(date_list):
        raise ValueError("Cashflows and dates must have same length")
    if not flow_list or min(flow_list) >= 0 or max(flow_list) <= 0:
        raise ValueError("XIRR requires at least one negative and one positive cashflow")

    rate = guess
    for _ in range(100):
        npv = xnpv(rate, flow_list, date_list)
        derivative = 0.0
        d0 = date_list[0]
        for cf, d in zip(flow_list, date_list):
            days = (d - d0).days / 365.0
            derivative -= days * cf / (1 + rate) ** (days + 1)
        if abs(derivative) < 1e-10:
            break
        new_rate = rate - npv / derivative
        if abs(new_rate - rate) < 1e-7:
            return new_rate
        rate = new_rate

    return rate

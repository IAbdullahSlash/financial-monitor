from __future__ import annotations

import numpy as np


def simulate_corpus_paths(
    start_corpus: float,
    monthly_contribution: float,
    years: int,
    expected_annual_return: float,
    annual_volatility: float,
    inflation: float,
    simulations: int = 1000,
    random_seed: int = 42,
) -> dict:
    np.random.seed(random_seed)

    months = max(1, years * 12)
    mean_monthly = (1 + expected_annual_return) ** (1 / 12) - 1
    std_monthly = annual_volatility / np.sqrt(12)

    paths = np.zeros((simulations, months + 1))
    paths[:, 0] = start_corpus

    for month in range(1, months + 1):
        shocks = np.random.normal(mean_monthly, std_monthly, simulations)
        paths[:, month] = paths[:, month - 1] * (1 + shocks) + monthly_contribution

    inflation_adjuster = (1 + inflation) ** (years)
    terminal = paths[:, -1] / inflation_adjuster

    return {
        "p10": float(np.percentile(terminal, 10)),
        "p50": float(np.percentile(terminal, 50)),
        "p90": float(np.percentile(terminal, 90)),
        "mean": float(np.mean(terminal)),
        "std": float(np.std(terminal)),
    }

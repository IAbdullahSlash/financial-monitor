from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor


@dataclass
class HealthMlOutput:
    calibrated_score: float
    feature_importance: dict[str, float]


class HealthScoreCalibrator:
    def __init__(self) -> None:
        self._model = GradientBoostingRegressor(random_state=42, n_estimators=120, max_depth=3)
        self._feature_names = [
            "emergency_fund",
            "insurance",
            "debt_to_income",
            "diversification",
            "tax_efficiency",
            "retirement_readiness",
        ]
        self._train_on_synthetic_data()

    def _train_on_synthetic_data(self) -> None:
        rng = np.random.default_rng(42)
        samples = 3000
        x = rng.uniform(0, 100, size=(samples, len(self._feature_names)))

        y = (
            0.22 * x[:, 0]
            + 0.12 * x[:, 1]
            + 0.2 * x[:, 2]
            + 0.16 * x[:, 3]
            + 0.14 * x[:, 4]
            + 0.16 * x[:, 5]
        )
        y = np.clip(y + rng.normal(0, 4.0, samples), 0, 100)
        self._model.fit(x, y)

    def calibrate(self, feature_scores: dict[str, float]) -> HealthMlOutput:
        vector = np.array([[feature_scores[name] for name in self._feature_names]], dtype=float)
        prediction = float(self._model.predict(vector)[0])
        prediction = max(0.0, min(100.0, prediction))

        fi = getattr(self._model, "feature_importances_", None)
        if fi is None:
            feature_importance = {name: 0.0 for name in self._feature_names}
        else:
            feature_importance = {
                name: round(float(weight), 4)
                for name, weight in zip(self._feature_names, fi)
            }

        return HealthMlOutput(calibrated_score=round(prediction, 2), feature_importance=feature_importance)


health_score_calibrator = HealthScoreCalibrator()

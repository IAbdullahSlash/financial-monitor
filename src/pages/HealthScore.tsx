import { useState } from "react";
import { financeApi } from "../services/api";

type HealthResponse = {
  score: number;
  weighted_breakdown: Record<string, number>;
  recommendations: string[];
  explainability: {
    rule_trace?: Array<{ id: string; passed: boolean; message: string }>;
    ml?: { model: string; calibrated_score: number; feature_importance: Record<string, number> };
  };
};

export default function HealthScore() {
  const [payload, setPayload] = useState({
    monthly_expenses: 50000,
    emergency_fund: 200000,
    annual_income: 1800000,
    annual_insurance_cover: 10000000,
    monthly_debt_obligation: 20000,
    equity_percent: 60,
    debt_percent: 30,
    other_assets_percent: 10,
    tax_saving_utilization_percent: 55,
    retirement_progress_percent: 45,
  });
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runScore = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financeApi.healthScore<HealthResponse>(payload);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute health score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-5xl font-black text-primary">Money Health Score</h1>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Financial Profile Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(payload).map(([key, value]) => (
            <label key={key} className="space-y-1">
              <span className="font-headline text-sm uppercase text-primary/60">{key}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setPayload((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
            </label>
          ))}
        </div>

        <button className="sketch-button bg-primary text-white" onClick={runScore} disabled={loading}>
          {loading ? "Calculating..." : "Compute Health Score"}
        </button>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="sketch-card bg-white text-center">
            <p className="text-primary/60">Overall Score</p>
            <p className="text-7xl font-black text-primary">{Math.round(result.score)}</p>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Weighted Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result.weighted_breakdown).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3 flex justify-between">
                  <span>{k}</span>
                  <span className="font-bold">{Number(v).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Recommendations</h3>
            {result.recommendations.length === 0 ? (
              <p>Great job — no major risk flags from current profile.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {result.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Explainability</h3>
            <p>Model: {result.explainability?.ml?.model || "rule-based"}</p>
            <p>ML Calibrated Score: {result.explainability?.ml?.calibrated_score ?? "N/A"}</p>
          </div>
        </section>
      )}
    </div>
  );
}

import { useState } from "react";
import { financeApi } from "../services/api";

type LifeResponse = {
  optimized_split: Record<string, number>;
  recommendations: string[];
  tax_impact_estimate: Record<string, number>;
  explainability: Record<string, unknown>;
};

export default function LifeAdvisor() {
  const [payload, setPayload] = useState({
    event_type: "bonus",
    amount: 300000,
    annual_income: 1800000,
    monthly_expenses: 50000,
    emergency_fund: 200000,
    high_interest_debt: 50000,
    risk_profile: "moderate",
  });
  const [result, setResult] = useState<LifeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runAdvisor = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financeApi.lifeAdvice<LifeResponse>(payload);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight">
        <span className="marker-highlight px-6">Life Event Advisor</span>
      </h1>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Event Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="font-headline text-sm uppercase text-primary/60">event_type</span>
            <select
              value={payload.event_type}
              onChange={(e) => setPayload((prev) => ({ ...prev, event_type: e.target.value }))}
              className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
            >
              <option value="bonus">bonus</option>
              <option value="marriage">marriage</option>
              <option value="child">child</option>
              <option value="inheritance">inheritance</option>
            </select>
          </label>

          {Object.entries(payload)
            .filter(([k]) => k !== "event_type" && k !== "risk_profile")
            .map(([key, value]) => (
              <label key={key} className="space-y-1">
                <span className="font-headline text-sm uppercase text-primary/60">{key}</span>
                <input
                  type="number"
                  value={value as number}
                  onChange={(e) => setPayload((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
                />
              </label>
            ))}

          <label className="space-y-1">
            <span className="font-headline text-sm uppercase text-primary/60">risk_profile</span>
            <select
              value={payload.risk_profile}
              onChange={(e) => setPayload((prev) => ({ ...prev, risk_profile: e.target.value }))}
              className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
            >
              <option value="conservative">conservative</option>
              <option value="moderate">moderate</option>
              <option value="aggressive">aggressive</option>
            </select>
          </label>
        </div>

        <button className="sketch-button bg-primary text-white" onClick={runAdvisor} disabled={loading}>
          {loading ? "Advising..." : "Generate Advice"}
        </button>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Optimized Split</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result.optimized_split).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3 flex justify-between">
                  <span>{k}</span>
                  <span className="font-bold">₹{Math.round(Number(v)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-2">
              {result.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Tax & Liquidity Estimate</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(result.tax_impact_estimate).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3">
                  <p className="text-primary/60 text-sm">{k}</p>
                  <p className="text-lg font-bold">₹{Math.round(Number(v)).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

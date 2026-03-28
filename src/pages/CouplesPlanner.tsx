import { useState } from "react";
import { financeApi } from "../services/api";

type CouplesResponse = {
  recommended_split: Record<string, number>;
  joint_tax_outcome: Record<string, number>;
  target_asset_allocation: Record<string, number>;
  explainability: Record<string, unknown>;
};

export default function CouplesPlanner() {
  const [payload, setPayload] = useState({
    partner1: { annual_income: 1800000, current_80c: 90000, current_80d: 15000 },
    partner2: { annual_income: 1200000, current_80c: 60000, current_80d: 12000 },
    investible_amount: 300000,
    risk_profile: "moderate",
  });
  const [result, setResult] = useState<CouplesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePartner = (partner: "partner1" | "partner2", key: string, value: number) => {
    setPayload((prev) => ({
      ...prev,
      [partner]: {
        ...prev[partner],
        [key]: value,
      },
    }));
  };

  const runPlan = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financeApi.couplesPlan<CouplesResponse>(payload);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute couples plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-5xl font-black text-primary">Couple Financial Planner</h1>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Partner Inputs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-headline font-bold text-xl">Partner 1</h3>
            {Object.entries(payload.partner1).map(([k, v]) => (
              <label key={k} className="space-y-1 block">
                <span className="text-sm uppercase text-primary/60">{k}</span>
                <input
                  type="number"
                  value={v}
                  onChange={(e) => updatePartner("partner1", k, Number(e.target.value))}
                  className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
                />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-headline font-bold text-xl">Partner 2</h3>
            {Object.entries(payload.partner2).map(([k, v]) => (
              <label key={k} className="space-y-1 block">
                <span className="text-sm uppercase text-primary/60">{k}</span>
                <input
                  type="number"
                  value={v}
                  onChange={(e) => updatePartner("partner2", k, Number(e.target.value))}
                  className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm uppercase text-primary/60">investible_amount</span>
            <input
              type="number"
              value={payload.investible_amount}
              onChange={(e) => setPayload((prev) => ({ ...prev, investible_amount: Number(e.target.value) }))}
              className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm uppercase text-primary/60">risk_profile</span>
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

        <button className="sketch-button bg-primary text-white" onClick={runPlan} disabled={loading}>
          {loading ? "Optimizing..." : "Optimize Joint Plan"}
        </button>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Recommended Investment Split</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(result.recommended_split).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3 flex justify-between">
                  <span>{k}</span>
                  <span className="font-bold">₹{Math.round(Number(v)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Joint Tax Outcome</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(result.joint_tax_outcome).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3">
                  <p className="text-sm text-primary/60">{k}</p>
                  <p className="font-bold">₹{Math.round(Number(v)).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Target Asset Allocation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(result.target_asset_allocation).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3 flex justify-between">
                  <span>{k}</span>
                  <span className="font-bold">{Math.round(Number(v) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

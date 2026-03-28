import { useState } from "react";
import { financeApi } from "../services/api";

type TaxResponse = {
  gross_income: number;
  old_regime_tax: number;
  new_regime_tax: number;
  better_regime: string;
  potential_tax_saving: number;
  deduction_optimization: Record<string, { remaining_limit: number; max_tax_saving_estimate: number }>;
  explainability: Record<string, unknown>;
};

export default function TaxWizard() {
  const [payload, setPayload] = useState({
    form16: {
      basic_salary: 1200000,
      hra_received: 300000,
      special_allowance: 150000,
      other_income: 50000,
    },
    deductions: {
      section_80c: 100000,
      section_80d: 15000,
      section_80ccd_1b: 0,
      home_loan_interest: 0,
      hra_exemption_claim: 0,
    },
    city_type: "metro",
    rent_paid_annual: 240000,
  });
  const [result, setResult] = useState<TaxResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runOptimization = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financeApi.taxOptimize<TaxResponse>(payload);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to optimize tax");
    } finally {
      setLoading(false);
    }
  };

  const updateForm16 = (key: string, value: number) => {
    setPayload((prev) => ({ ...prev, form16: { ...prev.form16, [key]: value } }));
  };

  const updateDeductions = (key: string, value: number) => {
    setPayload((prev) => ({ ...prev, deductions: { ...prev.deductions, [key]: value } }));
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-5xl font-black text-primary">Tax Optimization Wizard</h1>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Form 16 Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(payload.form16).map(([key, value]) => (
            <label key={key} className="space-y-1">
              <span className="font-headline text-sm uppercase text-primary/60">{key}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => updateForm16(key, Number(e.target.value))}
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
            </label>
          ))}

          {Object.entries(payload.deductions).map(([key, value]) => (
            <label key={key} className="space-y-1">
              <span className="font-headline text-sm uppercase text-primary/60">{key}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => updateDeductions(key, Number(e.target.value))}
                className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
              />
            </label>
          ))}

          <label className="space-y-1">
            <span className="font-headline text-sm uppercase text-primary/60">city_type</span>
            <select
              value={payload.city_type}
              onChange={(e) => setPayload((prev) => ({ ...prev, city_type: e.target.value }))}
              className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
            >
              <option value="metro">metro</option>
              <option value="non_metro">non_metro</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="font-headline text-sm uppercase text-primary/60">rent_paid_annual</span>
            <input
              type="number"
              value={payload.rent_paid_annual}
              onChange={(e) => setPayload((prev) => ({ ...prev, rent_paid_annual: Number(e.target.value) }))}
              className="w-full border-2 border-primary/20 rounded-xl px-3 py-2"
            />
          </label>
        </div>

        <button className="sketch-button bg-primary text-white" onClick={runOptimization} disabled={loading}>
          {loading ? "Optimizing..." : "Compare Old vs New Regime"}
        </button>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Old Regime Tax</p>
              <p className="text-3xl font-black">₹{Math.round(result.old_regime_tax).toLocaleString()}</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">New Regime Tax</p>
              <p className="text-3xl font-black">₹{Math.round(result.new_regime_tax).toLocaleString()}</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Better Regime</p>
              <p className="text-3xl font-black uppercase">{result.better_regime}</p>
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Potential Tax Saving</h3>
            <p className="text-4xl font-black">₹{Math.round(result.potential_tax_saving).toLocaleString()}</p>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Deduction Headroom</h3>
            <div className="space-y-2">
              {Object.entries(result.deduction_optimization).map(([k, v]) => {
                const row = v as { remaining_limit: number; max_tax_saving_estimate: number };
                return (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <span className="font-bold">{k}</span>
                  <span>Remaining: ₹{Math.round(Number(row.remaining_limit)).toLocaleString()}</span>
                  <span>Tax Save: ₹{Math.round(Number(row.max_tax_saving_estimate)).toLocaleString()}</span>
                </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

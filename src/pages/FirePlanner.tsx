import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { financeApi } from "../services/api";

type FireGoal = {
  name: string;
  target_amount: number;
  years_to_goal: number;
};

type FireResponse = {
  retirement_corpus_required: number;
  monthly_sip_for_retirement: number;
  total_monthly_investment_required: number;
  goals: Array<{ goal_name: string; monthly_sip: number; target_amount: number; allocation: Record<string, number> }>;
  roadmap: Array<{ month: number; age: number; projected_corpus: number; contribution: number }>;
  monte_carlo: Record<string, number>;
  explainability: Record<string, unknown>;
};

export default function FirePlanner() {
  const [payload, setPayload] = useState({
    age: 28,
    income_monthly: 120000,
    expenses_monthly: 50000,
    inflation: 0.06,
    expected_return: 0.11,
    annual_volatility: 0.16,
    current_assets: 800000,
    retirement_age: 55,
  });
  const [goals, setGoals] = useState<FireGoal[]>([
    { name: "Home Down Payment", target_amount: 3000000, years_to_goal: 7 },
    { name: "Child Education", target_amount: 5000000, years_to_goal: 15 },
  ]);
  const [result, setResult] = useState<FireResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roadmapPreview = useMemo(() => result?.roadmap.slice(0, 120) || [], [result]);

  const addGoal = () => {
    setGoals((prev) => [...prev, { name: "New Goal", target_amount: 1000000, years_to_goal: 5 }]);
  };

  const updateGoal = (index: number, key: keyof FireGoal, value: string) => {
    setGoals((prev) =>
      prev.map((goal, idx) =>
        idx === index
          ? {
              ...goal,
              [key]: key === "name" ? value : Number(value),
            }
          : goal
      )
    );
  };

  const runPlan = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await financeApi.firePlan<FireResponse>({ ...payload, goals });
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute FIRE plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight">
          <span className="marker-highlight px-6">FIRE Path Planner</span>
        </h1>
        <p className="text-primary/70 italic text-lg">Set your lifestyle assumptions, define life goals, and generate a contribution roadmap.</p>
        <div className="flex flex-wrap gap-2">
          <span className="status-chip">Step 1: Income and expenses</span>
          <span className="status-chip">Step 2: Goal setup</span>
          <span className="status-chip">Step 3: Review roadmap</span>
        </div>
      </header>

      <section className="sketch-card bg-white space-y-4">
        <h2 className="font-headline text-2xl font-bold">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold">Goals</h3>
            <button className="sketch-button" onClick={addGoal}>Add Goal</button>
          </div>
          {goals.map((goal, index) => (
            <div key={`${goal.name}-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={goal.name}
                onChange={(e) => updateGoal(index, "name", e.target.value)}
                className="border-2 border-primary/20 rounded-xl px-3 py-2"
                placeholder="Goal name"
              />
              <input
                type="number"
                value={goal.target_amount}
                onChange={(e) => updateGoal(index, "target_amount", e.target.value)}
                className="border-2 border-primary/20 rounded-xl px-3 py-2"
                placeholder="Target amount"
              />
              <input
                type="number"
                value={goal.years_to_goal}
                onChange={(e) => updateGoal(index, "years_to_goal", e.target.value)}
                className="border-2 border-primary/20 rounded-xl px-3 py-2"
                placeholder="Years"
              />
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 z-20 pt-2">
          <button className="sketch-button bg-primary text-white w-full md:w-auto" onClick={runPlan} disabled={loading}>
            {loading ? "Calculating..." : "Generate FIRE Plan"}
          </button>
        </div>
        {error && <p className="text-red-600 font-headline">{error}</p>}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Retirement Corpus</p>
              <p className="text-3xl font-black">₹{Math.round(result.retirement_corpus_required).toLocaleString()}</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Monthly SIP (Retirement)</p>
              <p className="text-3xl font-black">₹{Math.round(result.monthly_sip_for_retirement).toLocaleString()}</p>
            </div>
            <div className="sketch-card bg-white">
              <p className="text-primary/60">Total Monthly Investment</p>
              <p className="text-3xl font-black">₹{Math.round(result.total_monthly_investment_required).toLocaleString()}</p>
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Goal SIP Breakdown</h3>
            <div className="space-y-2">
              {result.goals.map((goal) => (
                <div key={goal.goal_name} className="border-2 border-dashed border-primary/20 rounded-xl px-3 py-2 flex justify-between">
                  <span>{goal.goal_name}</span>
                  <span className="font-bold">₹{Math.round(goal.monthly_sip).toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Roadmap Projection</h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roadmapPreview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                  <Tooltip formatter={(v: number) => `₹${Math.round(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="projected_corpus" stroke="#2d3436" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sketch-card bg-white">
            <h3 className="font-headline text-xl font-bold mb-3">Monte Carlo (Inflation-adjusted)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(result.monte_carlo).map(([k, v]) => (
                <div key={k} className="border-2 border-dashed border-primary/20 rounded-xl p-3">
                  <p className="text-primary/60 uppercase text-xs">{k}</p>
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

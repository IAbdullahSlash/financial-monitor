import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Activity, Wallet, ShieldCheck, Landmark, Users, Sparkles, AlertCircle } from "lucide-react";
import { financeApi } from "../services/api";

type FireResponse = {
  retirement_corpus_required: number;
  monthly_sip_for_retirement: number;
  total_monthly_investment_required: number;
  goals: Array<{ goal_name: string; monthly_sip: number }>;
};

type HealthResponse = {
  score: number;
  recommendations: string[];
};

type TaxResponse = {
  better_regime: string;
  potential_tax_saving: number;
  old_regime_tax: number;
  new_regime_tax: number;
};

type CouplesResponse = {
  joint_tax_outcome: Record<string, number>;
  recommended_split: Record<string, number>;
};

type LifeResponse = {
  recommendations: string[];
  optimized_split: Record<string, number>;
};

type AggregateState = {
  fire: FireResponse | null;
  health: HealthResponse | null;
  tax: TaxResponse | null;
  couples: CouplesResponse | null;
  life: LifeResponse | null;
};

const defaultPayloads = {
  fire: {
    age: 29,
    income_monthly: 130000,
    expenses_monthly: 55000,
    inflation: 0.06,
    expected_return: 0.11,
    annual_volatility: 0.16,
    current_assets: 900000,
    retirement_age: 55,
    goals: [
      { name: "Home Down Payment", target_amount: 3500000, years_to_goal: 8 },
      { name: "Child Education", target_amount: 5000000, years_to_goal: 14 },
    ],
  },
  health: {
    monthly_expenses: 55000,
    emergency_fund: 250000,
    annual_income: 2100000,
    annual_insurance_cover: 12000000,
    monthly_debt_obligation: 25000,
    equity_percent: 58,
    debt_percent: 32,
    other_assets_percent: 10,
    tax_saving_utilization_percent: 60,
    retirement_progress_percent: 50,
  },
  tax: {
    form16: {
      basic_salary: 1400000,
      hra_received: 320000,
      special_allowance: 180000,
      other_income: 60000,
    },
    deductions: {
      section_80c: 120000,
      section_80d: 18000,
      section_80ccd_1b: 20000,
      home_loan_interest: 0,
      hra_exemption_claim: 0,
    },
    city_type: "metro",
    rent_paid_annual: 300000,
  },
  couples: {
    partner1: { annual_income: 1800000, current_80c: 90000, current_80d: 15000 },
    partner2: { annual_income: 1200000, current_80c: 70000, current_80d: 12000 },
    investible_amount: 300000,
    risk_profile: "moderate",
  },
  life: {
    event_type: "bonus",
    amount: 250000,
    annual_income: 2100000,
    monthly_expenses: 55000,
    emergency_fund: 250000,
    high_interest_debt: 70000,
    risk_profile: "moderate",
  },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<AggregateState>({
    fire: null,
    health: null,
    tax: null,
    couples: null,
    life: null,
  });

  const refreshDashboard = async () => {
    setLoading(true);
    setErrors({});

    const [fire, health, tax, couples, life] = await Promise.allSettled([
      financeApi.firePlan<FireResponse>(defaultPayloads.fire),
      financeApi.healthScore<HealthResponse>(defaultPayloads.health),
      financeApi.taxOptimize<TaxResponse>(defaultPayloads.tax),
      financeApi.couplesPlan<CouplesResponse>(defaultPayloads.couples),
      financeApi.lifeAdvice<LifeResponse>(defaultPayloads.life),
    ]);

    const next: AggregateState = {
      fire: fire.status === "fulfilled" ? fire.value : null,
      health: health.status === "fulfilled" ? health.value : null,
      tax: tax.status === "fulfilled" ? tax.value : null,
      couples: couples.status === "fulfilled" ? couples.value : null,
      life: life.status === "fulfilled" ? life.value : null,
    };

    const nextErrors: Record<string, string> = {};
    if (fire.status === "rejected") nextErrors.fire = fire.reason?.message || "FIRE unavailable";
    if (health.status === "rejected") nextErrors.health = health.reason?.message || "Health unavailable";
    if (tax.status === "rejected") nextErrors.tax = tax.reason?.message || "Tax unavailable";
    if (couples.status === "rejected") nextErrors.couples = couples.reason?.message || "Couples unavailable";
    if (life.status === "rejected") nextErrors.life = life.reason?.message || "Life advisor unavailable";

    setData(next);
    setErrors(nextErrors);
    setLastRefreshed(new Date().toLocaleString());
    setLoading(false);
  };

  const topRecommendations = useMemo(() => {
    const recs: string[] = [];
    if (data.health?.recommendations?.length) recs.push(...data.health.recommendations.slice(0, 2));
    if (data.life?.recommendations?.length) recs.push(...data.life.recommendations.slice(0, 2));
    return recs.slice(0, 4);
  }, [data.health, data.life]);

  const availableModules = Object.values(data).filter(Boolean).length;

  return (
    <div className="space-y-10 font-body">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-5xl font-black text-primary"
          >
            Live Finance Dashboard
          </motion.h1>
          <p className="text-primary/70 italic text-lg">Aggregated real-time outputs from FIRE, Health, Tax, Couples, and Life Event engines.</p>
        </div>

        <button
          onClick={refreshDashboard}
          disabled={loading}
          className="sketch-button bg-primary text-white flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Live Outputs"}
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="sketch-card bg-white">
          <p className="text-primary/60 text-sm">Modules Online</p>
          <p className="text-3xl font-black">{availableModules}/5</p>
          <div className="mt-2 flex items-center gap-2 text-primary/70 text-sm"><Activity className="w-4 h-4" /> Live aggregation status</div>
        </div>

        <div className="sketch-card bg-white">
          <p className="text-primary/60 text-sm">Health Score</p>
          <p className="text-3xl font-black">{data.health ? Math.round(data.health.score) : "--"}</p>
          <div className="mt-2 flex items-center gap-2 text-primary/70 text-sm"><ShieldCheck className="w-4 h-4" /> Money health</div>
        </div>

        <div className="sketch-card bg-white">
          <p className="text-primary/60 text-sm">Monthly FIRE SIP</p>
          <p className="text-3xl font-black">{data.fire ? `₹${Math.round(data.fire.total_monthly_investment_required).toLocaleString()}` : "--"}</p>
          <div className="mt-2 flex items-center gap-2 text-primary/70 text-sm"><Wallet className="w-4 h-4" /> Total monthly required</div>
        </div>

        <div className="sketch-card bg-white">
          <p className="text-primary/60 text-sm">Best Tax Regime</p>
          <p className="text-3xl font-black uppercase">{data.tax ? data.tax.better_regime : "--"}</p>
          <div className="mt-2 flex items-center gap-2 text-primary/70 text-sm"><Landmark className="w-4 h-4" /> Old vs new optimization</div>
        </div>

        <div className="sketch-card bg-white">
          <p className="text-primary/60 text-sm">Couples Combined Tax</p>
          <p className="text-3xl font-black">
            {data.couples
              ? `₹${Math.round(Number(data.couples.joint_tax_outcome?.combined_tax_after_optimization || 0)).toLocaleString()}`
              : "--"}
          </p>
          <div className="mt-2 flex items-center gap-2 text-primary/70 text-sm"><Users className="w-4 h-4" /> Joint optimization</div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sketch-card bg-white space-y-3">
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Key Recommendations
          </h2>
          {topRecommendations.length === 0 ? (
            <p className="text-primary/60">No recommendation data yet. Click “Refresh Live Outputs”.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {topRecommendations.map((rec, idx) => (
                <li key={`${rec}-${idx}`}>{rec}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="sketch-card bg-white space-y-3">
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            Module Errors
          </h2>
          {Object.keys(errors).length === 0 ? (
            <p className="text-primary/60">No module errors.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(errors).map(([module, msg]) => (
                <div key={module} className="border-2 border-dashed border-accent/40 rounded-xl p-2">
                  <p className="font-bold uppercase text-sm">{module}</p>
                  <p className="text-sm">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sketch-card bg-white">
        <h2 className="font-headline text-2xl font-bold mb-3">Snapshot Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border-2 border-dashed border-primary/20 rounded-xl p-3">
            <p className="font-bold mb-1">FIRE</p>
            <p>Retirement Corpus: {data.fire ? `₹${Math.round(data.fire.retirement_corpus_required).toLocaleString()}` : "--"}</p>
            <p>Goals: {data.fire?.goals?.length ?? 0}</p>
          </div>

          <div className="border-2 border-dashed border-primary/20 rounded-xl p-3">
            <p className="font-bold mb-1">Tax</p>
            <p>Old: {data.tax ? `₹${Math.round(data.tax.old_regime_tax).toLocaleString()}` : "--"}</p>
            <p>New: {data.tax ? `₹${Math.round(data.tax.new_regime_tax).toLocaleString()}` : "--"}</p>
            <p>Savings: {data.tax ? `₹${Math.round(data.tax.potential_tax_saving).toLocaleString()}` : "--"}</p>
          </div>

          <div className="border-2 border-dashed border-primary/20 rounded-xl p-3">
            <p className="font-bold mb-1">Couples + Life</p>
            <p>
              Split P1: {data.couples ? `₹${Math.round(Number(data.couples.recommended_split?.partner1_80c_investment || 0)).toLocaleString()}` : "--"}
            </p>
            <p>
              Split P2: {data.couples ? `₹${Math.round(Number(data.couples.recommended_split?.partner2_80c_investment || 0)).toLocaleString()}` : "--"}
            </p>
            <p>Life recos: {data.life?.recommendations?.length ?? 0}</p>
          </div>
        </div>

        <p className="text-xs text-primary/50 mt-4">Last refreshed: {lastRefreshed || "Never"}</p>
      </section>
    </div>
  );
}

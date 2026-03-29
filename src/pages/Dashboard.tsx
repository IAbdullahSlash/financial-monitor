import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  RefreshCw,
  Activity,
  Sparkles,
  TrendingUp,
  Gauge,
  BarChart3,
  HeartPulse,
  Coins,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
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
  const hasSnapshot = availableModules > 0;
  const errorCount = Object.keys(errors).length;
  const reliabilityPercent = Math.round((availableModules / 5) * 100);
  const healthScore = data.health ? Math.round(data.health.score) : null;
  const monthlySip = data.fire ? Math.round(data.fire.total_monthly_investment_required) : null;
  const fireCorpus = data.fire ? Math.round(data.fire.retirement_corpus_required) : null;
  const taxSaving = data.tax ? Math.round(data.tax.potential_tax_saving) : null;
  const couplesCombinedTax = data.couples
    ? Math.round(Number(data.couples.joint_tax_outcome?.combined_tax_after_optimization || 0))
    : null;

  const formatRupees = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "--";
    return `₹${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="space-y-10 font-body">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-6xl md:text-8xl font-black text-primary tracking-tight"
          >
            <span className="marker-highlight px-6">Live Finance Dashboard</span>
          </motion.h1>
          <p className="text-primary/70 italic text-lg">Aggregated real-time outputs from FIRE, Health, Tax, Couples, and Life Event engines.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-chip">
              <Activity className="w-4 h-4" />
              {loading ? "Syncing modules" : "Live monitor"}
            </span>
            <span className="status-chip">
              <Gauge className="w-4 h-4" />
              Reliability {reliabilityPercent}%
            </span>
            <span className="status-chip">Last refresh: {lastRefreshed || "Not yet"}</span>
          </div>
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

      {loading && !hasSnapshot && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="sketch-card bg-white space-y-3">
              <div className="skeleton-line w-1/2"></div>
              <div className="skeleton-block"></div>
              <div className="skeleton-line w-3/4"></div>
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <article className="xl:col-span-7 sketch-card bg-gradient-to-br from-sky-100/75 via-white to-cyan-100/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-headline text-4xl font-black text-primary">Today Snapshot</h2>
              <p className="text-primary/70">Your daily money pulse in one glance.</p>
            </div>
            <span className="status-chip">
              <Activity className="w-4 h-4" />
              {loading ? "Sync in progress" : "Live data state"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border-2 border-primary/20 bg-white/80 p-4">
              <p className="text-sm text-primary/60">Modules Online</p>
              <p className="text-3xl font-black">{availableModules}/5</p>
            </div>
            <div className="rounded-2xl border-2 border-primary/20 bg-white/80 p-4">
              <p className="text-sm text-primary/60">Reliability</p>
              <p className="text-3xl font-black">{reliabilityPercent}%</p>
            </div>
            <div className="rounded-2xl border-2 border-primary/20 bg-white/80 p-4">
              <p className="text-sm text-primary/60">Active Alerts</p>
              <p className="text-3xl font-black">{errorCount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-primary/70">
              <span>Coverage Progress</span>
              <span>{reliabilityPercent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/80 border-2 border-primary/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(reliabilityPercent, 100)}%` }}
                transition={{ duration: 0.7 }}
                className="h-full bg-gradient-to-r from-secondary via-accent to-tertiary"
              />
            </div>
          </div>
        </article>

        <aside className="xl:col-span-5 sketch-card bg-gradient-to-br from-amber-100/80 via-white to-orange-100/65 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h2 className="font-headline text-3xl font-black">Advisor Highlights</h2>
          </div>

          {topRecommendations.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-primary/25 bg-white/80 p-4 space-y-3">
              <p className="text-primary/65">No recommendations yet. Generate one refresh for personalized highlights.</p>
              <button className="sketch-button" onClick={refreshDashboard} disabled={loading}>
                {loading ? "Loading advice..." : "Load Insights"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {topRecommendations.slice(0, 3).map((rec, idx) => (
                <div key={`${rec}-${idx}`} className="rounded-xl border-2 border-primary/20 bg-white/85 px-3 py-2 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-secondary shrink-0" />
                  <p className="text-sm text-primary/85">{rec}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-white/80 p-3">
            {errorCount === 0 ? (
              <p className="text-sm text-primary/70">No service issues in the latest run.</p>
            ) : (
              <p className="text-sm text-primary/80">{errorCount} module alert(s) detected. Use refresh to retry.</p>
            )}
          </div>
        </aside>

        <article className="xl:col-span-4 sketch-card bg-gradient-to-br from-emerald-100/80 via-white to-teal-100/65 space-y-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-secondary" />
            <h3 className="font-headline text-2xl font-black">Health & Safety</h3>
          </div>
          <p className="text-4xl font-black">{healthScore ?? "--"}</p>
          <p className="text-primary/70 text-sm">Health score and recommendation confidence.</p>
          <div className="rounded-xl border-2 border-primary/20 bg-white/80 p-3 text-sm flex items-center justify-between">
            <span>Top advice</span>
            <span className="font-bold">{topRecommendations.length}</span>
          </div>
        </article>

        <article className="xl:col-span-4 sketch-card bg-gradient-to-br from-sky-100/80 via-white to-indigo-100/65 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="font-headline text-2xl font-black">Growth Engine</h3>
          </div>
          <p className="text-3xl font-black">{formatRupees(monthlySip)}</p>
          <p className="text-primary/70 text-sm">Monthly SIP target toward your FIRE plan.</p>
          <div className="rounded-xl border-2 border-primary/20 bg-white/80 p-3 text-sm flex items-center justify-between">
            <span>Corpus target</span>
            <span className="font-bold">{formatRupees(fireCorpus)}</span>
          </div>
        </article>

        <article className="xl:col-span-4 sketch-card bg-gradient-to-br from-rose-100/80 via-white to-orange-100/65 space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-tertiary" />
            <h3 className="font-headline text-2xl font-black">Tax & Family</h3>
          </div>
          <p className="text-3xl font-black">{formatRupees(taxSaving)}</p>
          <p className="text-primary/70 text-sm">Potential annual tax efficiency from current inputs.</p>
          <div className="rounded-xl border-2 border-primary/20 bg-white/80 p-3 text-sm flex items-center justify-between">
            <span>Couples combined tax</span>
            <span className="font-bold">{formatRupees(couplesCombinedTax)}</span>
          </div>
        </article>

        <section className="xl:col-span-12 sketch-card bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              <h2 className="font-headline text-2xl font-black">Compact Snapshot</h2>
            </div>
            <button className="text-primary/70 hover:text-secondary flex items-center gap-1 font-headline text-lg" onClick={refreshDashboard}>
              Refresh details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border-2 border-dashed border-primary/20 bg-surface/70 p-3 space-y-1">
              <p className="font-bold">FIRE</p>
              <p>Retirement corpus: {formatRupees(fireCorpus)}</p>
              <p>Goals tracked: {data.fire?.goals?.length ?? 0}</p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/20 bg-surface/70 p-3 space-y-1">
              <p className="font-bold">Tax</p>
              <p>Old regime: {formatRupees(data.tax?.old_regime_tax)}</p>
              <p>New regime: {formatRupees(data.tax?.new_regime_tax)}</p>
              <p>Best regime: {data.tax?.better_regime?.toUpperCase() || "--"}</p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/20 bg-surface/70 p-3 space-y-1">
              <p className="font-bold">Couples + Advisor</p>
              <p>
                Suggested P1 split: {formatRupees(
                  data.couples ? Number(data.couples.recommended_split?.partner1_80c_investment || 0) : null
                )}
              </p>
              <p>
                Suggested P2 split: {formatRupees(
                  data.couples ? Number(data.couples.recommended_split?.partner2_80c_investment || 0) : null
                )}
              </p>
              <p>Advisor recommendations: {data.life?.recommendations?.length ?? 0}</p>
            </div>
          </div>

          <p className="text-xs text-primary/50 mt-4">Last refreshed: {lastRefreshed || "Never"}</p>
        </section>
      </section>
    </div>
  );
}

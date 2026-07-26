import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp, ShieldAlert, XCircle, Save } from "lucide-react";
import { SketchCard, StatusChip, SectionLabel, Marker } from "./ui";
import { simulateDecision, inr } from "@/lib/fintwin-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const verdictMap = {
  safe: { tone: "good" as const, label: "Safe to go", icon: TrendingUp, bg: "bg-mint" },
  risky: { tone: "warn" as const, label: "Risky — think twice", icon: ShieldAlert, bg: "bg-butter" },
  no: { tone: "risk" as const, label: "Not recommended", icon: XCircle, bg: "bg-coral text-white" },
};

export function SimulatorCard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [decision, setDecision] = useState("Buy an iPhone 16 Pro");
  const [amount, setAmount] = useState(140000);
  const [months, setMonths] = useState(6);
  const [saving, setSaving] = useState(false);
  const result = useMemo(() => simulateDecision(amount, months), [amount, months]);
  const V = verdictMap[result.verdict];

  async function saveRun() {
    if (!user) return toast.error("Sign in to save runs");
    setSaving(true);
    const { error } = await supabase.from("decision_simulations").insert({
      user_id: user.id,
      prompt: decision,
      inputs: { amount, months },
      result: JSON.parse(JSON.stringify(result)),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved to history");
  }

  return (
    <SketchCard className="relative overflow-hidden" hoverable={false}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-marker opacity-60" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <SectionLabel>Decision Simulator</SectionLabel>
        </div>
        <h3 className="font-headline text-2xl">
          Try it: <Marker>{decision}</Marker>
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mini-label">Decision</label>
            <input className="sketch-input mt-1" value={decision} onChange={(e) => setDecision(e.target.value)} />
          </div>
          <div>
            <label className="mini-label">Amount (₹)</label>
            <input
              type="number"
              className="sketch-input mt-1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mini-label">Over how many months</label>
            <input
              type="number"
              className="sketch-input mt-1"
              value={months}
              onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div className={`mt-6 rounded-2xl border-2 border-ink p-5 ${V.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <V.icon className="h-5 w-5" />
              <div className="font-headline text-xl">{V.label}</div>
            </div>
            <StatusChip tone={V.tone}>Verdict</StatusChip>
          </div>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <ResultTile label="Monthly Impact" value={inr(result.monthly)} hint={`${Math.round(result.ratio * 100)}% of surplus`} />
            <ResultTile label="Emergency Fund Impact" value={`-${result.emergencyImpact}%`} hint={`${result.emergencyMonths.toFixed(1)}mo cushion`} />
            <ResultTile label="Goal Delay" value={`${result.goalDelayMonths} mo`} hint="on your top goals" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <button onClick={saveRun} disabled={saving} className="sketch-btn text-sm">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save run"}
          </button>
          {!compact && (
            <>
              <span className="mini-label ml-2">Want a full plan?</span>
              <Link to="/dashboard" className="sketch-btn text-sm">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </SketchCard>
  );
}

function ResultTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-card p-4">
      <div className="mini-label">{label}</div>
      <div className="font-headline text-2xl mt-1 text-foreground">{value}</div>
      {hint && <div className="hand text-sm text-muted-foreground">{hint}</div>}
    </div>
  );
}

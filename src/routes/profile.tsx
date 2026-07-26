import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell, SketchCard, SectionLabel, Marker, DashedCard, StatusChip } from "@/components/fintwin/ui";
import { profile as demoProfile } from "@/lib/fintwin-data";
import { useEffect, useState } from "react";
import { Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Financial Profile — Fin Twin" },
      { name: "description", content: "Set up your income, expenses, savings, debts and goals. Low friction, no bank sync." },
      { property: "og:title", content: "Build your financial profile" },
      { property: "og:description", content: "Manual, private, and takes under 3 minutes." },
    ],
  }),
  component: Profile,
});

type ProfileRow = {
  full_name: string;
  age: number | "";
  city: string;
  income: number | "";
  expenses: number | "";
  savings: number | "";
  emergency_fund: number | "";
  debts: number | "";
  risk_appetite: "Low" | "Moderate" | "High";
  goal_1: string;
  goal_2: string;
  goal_3: string;
};

const empty: ProfileRow = {
  full_name: "", age: "", city: "",
  income: "", expenses: "", savings: "", emergency_fund: "", debts: "",
  risk_appetite: "Moderate",
  goal_1: "", goal_2: "", goal_3: "",
};

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileRow>(empty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) setError(error.message);
      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          age: data.age ?? "",
          city: data.city ?? "",
          income: data.income ?? "",
          expenses: data.expenses ?? "",
          savings: data.savings ?? "",
          emergency_fund: data.emergency_fund ?? "",
          debts: data.debts ?? "",
          risk_appetite: (data.risk_appetite as any) ?? "Moderate",
          goal_1: data.goal_1 ?? "",
          goal_2: data.goal_2 ?? "",
          goal_3: data.goal_3 ?? "",
        });
      }
      setFetching(false);
    })();
  }, [user, loading, navigate]);

  const set = <K extends keyof ProfileRow>(k: K, v: ProfileRow[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    const payload = {
      id: user.id,
      full_name: form.full_name || null,
      age: form.age === "" ? null : Number(form.age),
      city: form.city || null,
      income: form.income === "" ? null : Number(form.income),
      expenses: form.expenses === "" ? null : Number(form.expenses),
      savings: form.savings === "" ? null : Number(form.savings),
      emergency_fund: form.emergency_fund === "" ? null : Number(form.emergency_fund),
      debts: form.debts === "" ? null : Number(form.debts),
      risk_appetite: form.risk_appetite,
      goal_1: form.goal_1 || null,
      goal_2: form.goal_2 || null,
      goal_3: form.goal_3 || null,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading || fetching) {
    return (
      <PageShell>
        <div className="hand text-lg">Loading your profile…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-4xl">
        <SectionLabel>Step 1 · Profile</SectionLabel>
        <h1 className="font-headline text-4xl md:text-5xl">Tell your Fin Twin <Marker>who you are</Marker>.</h1>
        <p className="hand text-lg mt-2 text-muted-foreground">Manual inputs only for V1 — we never touch your bank.</p>

        <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
          <SketchCard hoverable={false}>
            <SectionLabel>The basics</SectionLabel>
            <div className="grid gap-4 md:grid-cols-3 mt-3">
              <Field label="Full name" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder={demoProfile.name} />
              <Field label="Age" type="number" value={form.age} onChange={(v) => set("age", v === "" ? "" : Number(v))} placeholder={String(demoProfile.age)} />
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder={demoProfile.city} />
            </div>
          </SketchCard>

          <SketchCard hoverable={false}>
            <SectionLabel>Money in / money out</SectionLabel>
            <div className="grid gap-4 md:grid-cols-2 mt-3">
              <Field label="Monthly income (₹)" type="number" value={form.income} onChange={(v) => set("income", v === "" ? "" : Number(v))} />
              <Field label="Monthly expenses (₹)" type="number" value={form.expenses} onChange={(v) => set("expenses", v === "" ? "" : Number(v))} />
              <Field label="Total savings (₹)" type="number" value={form.savings} onChange={(v) => set("savings", v === "" ? "" : Number(v))} />
              <Field label="Emergency fund (₹)" type="number" value={form.emergency_fund} onChange={(v) => set("emergency_fund", v === "" ? "" : Number(v))} />
              <Field label="Total debts (₹)" type="number" value={form.debts} onChange={(v) => set("debts", v === "" ? "" : Number(v))} />
              <div>
                <label className="mini-label">Risk appetite</label>
                <select
                  className="sketch-input mt-1"
                  value={form.risk_appetite}
                  onChange={(e) => set("risk_appetite", e.target.value as any)}
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          </SketchCard>

          <SketchCard hoverable={false}>
            <SectionLabel>Goals (top 3)</SectionLabel>
            <div className="grid gap-4 md:grid-cols-3 mt-3">
              <Field label="Goal 1" value={form.goal_1} onChange={(v) => set("goal_1", v)} placeholder="Emergency fund" />
              <Field label="Goal 2" value={form.goal_2} onChange={(v) => set("goal_2", v)} placeholder="Home down payment" />
              <Field label="Goal 3" value={form.goal_3} onChange={(v) => set("goal_3", v)} placeholder="Japan trip" />
            </div>
          </SketchCard>

          <DashedCard>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <SectionLabel>Optional</SectionLabel>
                <div className="font-headline text-xl">Upload a bank statement (PDF/CSV)</div>
                <p className="hand text-sm text-muted-foreground">Coming soon — for now, we'll skip this politely.</p>
              </div>
              <button type="button" className="sketch-btn-ghost"><Upload className="h-4 w-4" /> Choose file</button>
            </div>
          </DashedCard>

          {error && <div className="chip bg-coral text-white text-xs w-fit">{error}</div>}

          <div className="flex items-center gap-3">
            <button disabled={busy} className="sketch-btn disabled:opacity-60"><Save className="h-4 w-4" /> {busy ? "Saving…" : "Save profile"}</button>
            {saved && <StatusChip tone="good">Saved to your account</StatusChip>}
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: any) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mini-label">{label}</label>
      <input
        className="sketch-input mt-1"
        type={type}
        value={value as any}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

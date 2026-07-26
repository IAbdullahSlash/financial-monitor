import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, SectionLabel, Marker, SketchCard, StatusChip } from "@/components/fintwin/ui";
import { goals as mockGoals, inr } from "@/lib/fintwin-data";
import { ProjectionChart } from "@/components/fintwin/charts";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goal Planner — Fin Twin" },
      { name: "description", content: "Track your goals, see projected timelines, and rebalance monthly contributions." },
      { property: "og:title", content: "Goal Planner" },
      { property: "og:description", content: "Every goal, on a timeline you can trust." },
    ],
  }),
  component: Goals,
});

type DBGoal = {
  id: string;
  name: string;
  category: string | null;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
};

function Goals() {
  const { user } = useAuth();
  const [rows, setRows] = useState<DBGoal[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: 0, saved_amount: 0, target_date: "", category: "🎯" });

  useEffect(() => {
    if (!user) { setRows(null); return; }
    supabase.from("goals").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows((data as DBGoal[]) ?? []);
    });
  }, [user]);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: form.name,
      category: form.category,
      target_amount: form.target_amount,
      saved_amount: form.saved_amount,
      target_date: form.target_date || null,
    }).select().single();
    if (error) return toast.error(error.message);
    setRows((r) => [data as DBGoal, ...(r ?? [])]);
    setOpen(false);
    setForm({ name: "", target_amount: 0, saved_amount: 0, target_date: "", category: "🎯" });
    toast.success("Goal saved");
  }

  async function removeGoal(id: string) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => (r ?? []).filter((g) => g.id !== id));
  }

  const showList = user
    ? (rows ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        emoji: g.category ?? "🎯",
        target: Number(g.target_amount),
        saved: Number(g.saved_amount),
        targetDate: g.target_date ?? "—",
        monthly: g.target_date ? Math.max(0, Math.round((Number(g.target_amount) - Number(g.saved_amount)) / Math.max(1, monthsUntil(g.target_date)))) : 0,
        _db: true,
      }))
    : mockGoals.map((g) => ({ ...g, _db: false }));

  return (
    <PageShell>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <SectionLabel>Goals</SectionLabel>
          <h1 className="font-headline text-4xl md:text-5xl">Dreams with <Marker>deadlines</Marker>.</h1>
          {!user && <p className="hand text-sm mt-2 text-muted-foreground">Sign in to save your own goals.</p>}
        </div>
        {user && (
          <button className="sketch-btn" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add a goal</button>
        )}
      </div>

      {open && user && (
        <SketchCard className="mt-6" hoverable={false}>
          <SectionLabel>New goal</SectionLabel>
          <form className="grid gap-4 md:grid-cols-5 mt-3" onSubmit={addGoal}>
            <input required placeholder="Goal name" className="sketch-input md:col-span-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Emoji" className="sketch-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input type="number" placeholder="Target ₹" className="sketch-input" value={form.target_amount || ""} onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })} />
            <input type="number" placeholder="Saved ₹" className="sketch-input" value={form.saved_amount || ""} onChange={(e) => setForm({ ...form, saved_amount: Number(e.target.value) })} />
            <input type="date" className="sketch-input md:col-span-2" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button type="button" className="sketch-btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="sketch-btn bg-ink text-paper">Save goal</button>
            </div>
          </form>
        </SketchCard>
      )}

      <div className="grid gap-5 md:grid-cols-2 mt-8">
        {showList.map((g) => {
          const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
          return (
            <SketchCard key={g.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 grid place-items-center rounded-xl border-2 border-ink bg-butter text-2xl">{g.emoji}</div>
                  <div>
                    <div className="font-headline text-xl">{g.name}</div>
                    <div className="hand text-sm text-muted-foreground">by {g.targetDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip tone={pct >= 50 ? "good" : pct >= 25 ? "warn" : "risk"}>{pct}%</StatusChip>
                  {"_db" in g && g._db && (
                    <button onClick={() => removeGoal(g.id)} className="p-1 rounded-md hover:bg-muted" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full border-2 border-ink overflow-hidden bg-card">
                <div className="h-full bg-mint" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <Cell label="Saved" value={inr(g.saved)} />
                <Cell label="Target" value={inr(g.target)} />
                <Cell label="Monthly" value={inr(g.monthly)} />
              </div>
            </SketchCard>
          );
        })}
        {user && rows && rows.length === 0 && (
          <SketchCard hoverable={false}>
            <div className="hand text-lg">No goals yet — add your first one above.</div>
          </SketchCard>
        )}
      </div>

      <SketchCard className="mt-8" hoverable={false}>
        <SectionLabel>Projected timeline · Emergency Fund</SectionLabel>
        <h3 className="font-headline text-2xl">On track to hit <Marker>₹5L</Marker> by early 2027.</h3>
        <ProjectionChart />
      </SketchCard>
    </PageShell>
  );
}

function monthsUntil(date: string) {
  const d = new Date(date);
  const now = new Date();
  return Math.max(1, (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()));
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-card p-3 text-center">
      <div className="mini-label">{label}</div>
      <div className="font-headline text-lg">{value}</div>
    </div>
  );
}

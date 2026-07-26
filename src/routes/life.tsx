import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionLabel, Marker, SketchCard, StatusChip } from "@/components/fintwin/ui";
import { inr, lifeEvents } from "@/lib/fintwin-data";
import { Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/life")({
  head: () => ({
    meta: [
      { title: "Life Event Simulator — Fin Twin" },
      { name: "description", content: "Wedding, kid, sabbatical, MBA — see if your money can carry the life you're imagining." },
      { property: "og:title", content: "Life Event Simulator" },
      { property: "og:description", content: "Play out the big moments before they arrive." },
    ],
  }),
  component: Life,
});

function Life() {
  const { user } = useAuth();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function save(e: typeof lifeEvents[number]) {
    if (!user) return toast.error("Sign in to save scenarios");
    setSavingId(e.id);
    const { error } = await supabase.from("life_simulations").insert({
      user_id: user.id,
      event_type: e.id,
      title: e.title,
      inputs: { cost: e.cost, monthly: e.monthly },
      result: { feasible: e.feasible },
    });
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Scenario saved");
  }

  return (
    <PageShell>
      <SectionLabel>Life Advisor</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl">Rehearse the <Marker>big moments</Marker>.</h1>
      <p className="hand text-lg mt-2 text-muted-foreground">Pick a life event. We'll show you if the money math holds.</p>

      <div className="grid gap-5 md:grid-cols-2 mt-8">
        {lifeEvents.map((e) => (
          <SketchCard key={e.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <SectionLabel>Life Event</SectionLabel>
              </div>
              <StatusChip tone={e.feasible ? "good" : "risk"}>{e.feasible ? "Feasible" : "Stretch"}</StatusChip>
            </div>
            <div className="font-headline text-2xl mt-2">{e.title}</div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Cell label="Total cost" value={inr(e.cost)} />
              <Cell label="Save per month" value={e.monthly ? inr(e.monthly) : "—"} />
            </div>
            <div className="mt-4 dashed-card p-3 hand text-sm">
              {e.feasible
                ? "Doable if you keep your surplus consistent and don't add new EMIs."
                : "You'd need to boost income ~30% or delay by a year. Consider a shorter version first."}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="sketch-btn text-sm" onClick={() => save(e)} disabled={savingId === e.id}>
                <Save className="h-4 w-4" /> {savingId === e.id ? "Saving..." : "Save scenario"}
              </button>
            </div>
          </SketchCard>
        ))}
      </div>
    </PageShell>
  );
}
function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-ink bg-card p-3">
      <div className="mini-label">{label}</div>
      <div className="font-headline text-lg">{value}</div>
    </div>
  );
}

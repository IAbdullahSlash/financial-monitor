import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SketchCard, SectionLabel, Marker, DashedCard } from "@/components/fintwin/ui";
import { ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Fin Twin" },
      { name: "description", content: "Log back into your Fin Twin to keep simulating money decisions with confidence." },
      { property: "og:title", content: "Login — Fin Twin" },
      { property: "og:description", content: "Welcome back to your money co-pilot." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <div className="chip bg-butter mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Welcome back
          </div>
          <h1 className="font-headline text-5xl md:text-6xl leading-[0.95]">
            Log in to your <Marker>Fin Twin</Marker>.
          </h1>
          <p className="hand text-xl mt-5 text-foreground/80 max-w-md">
            Your future self is waiting with a very strong opinion.
          </p>
          <DashedCard className="mt-8 hidden lg:block">
            <SectionLabel>Zero pressure</SectionLabel>
            <p className="text-sm">No bank connections. No screen-scraping. Just you and your money brain, together.</p>
          </DashedCard>
        </div>

        <SketchCard className="animate-scale-in" hoverable={false}>
          <SectionLabel>Sign in</SectionLabel>
          <h2 className="font-headline text-2xl">Enter your details</h2>
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
            <label className="block">
              <span className="mini-label flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="sketch-input mt-1"
              />
            </label>
            <label className="block">
              <span className="mini-label flex items-center gap-1"><Lock className="h-3 w-3" /> Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="sketch-input mt-1"
              />
            </label>
            {error && <div className="chip bg-coral text-white text-xs">{error}</div>}
            <button type="submit" disabled={busy} className="sketch-btn mt-2 w-full justify-center disabled:opacity-60">
              {busy ? "Logging in..." : "Log in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-5 text-center text-sm">
            New here?{" "}
            <Link to="/register" className="hand text-base underline">Create an account</Link>
          </div>
        </SketchCard>
      </div>
    </PageShell>
  );
}

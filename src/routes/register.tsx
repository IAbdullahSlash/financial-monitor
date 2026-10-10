import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SketchCard, SectionLabel, Marker, DashedCard } from "@/components/fintwin/ui";
import { ArrowRight, Mail, Lock, User, Sparkles } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Fin Twin" },
      {
        name: "description",
        content: "Create a free account to keep your loan tracker synced across devices.",
      },
      { property: "og:title", content: "Register — Fin Twin" },
      {
        property: "og:description",
        content: "Track every EMI. No bank connection required.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(credential.user, { displayName: form.name });
      navigate({ to: "/" });
    } catch (err) {
      setError(friendlyError(err, "Unable to create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <div className="chip bg-mint mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Free · 60 seconds
          </div>
          <h1 className="font-headline text-5xl md:text-6xl leading-[0.95]">
            Meet your <Marker>Fin Twin</Marker>.
          </h1>
          <p className="hand text-xl mt-5 text-foreground/80 max-w-md">
            An account is optional — it just keeps your loans synced across devices. Anything you
            added on this device moves in automatically.
          </p>
          <DashedCard className="mt-8 hidden lg:block">
            <SectionLabel>What you get</SectionLabel>
            <ul className="text-sm space-y-1 mt-1">
              <li>· Your loans on every device</li>
              <li>· Paid vs remaining for every EMI</li>
              <li>· Your debt-free date, and how to reach it sooner</li>
            </ul>
          </DashedCard>
        </div>

        <SketchCard className="animate-scale-in" hoverable={false}>
          <SectionLabel>Create account</SectionLabel>
          <h2 className="font-headline text-2xl">Let's get you set up</h2>
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
            <label className="block">
              <span className="mini-label flex items-center gap-1">
                <User className="h-3 w-3" /> Name
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ananya Sharma"
                className="sketch-input mt-1"
              />
            </label>
            <label className="block">
              <span className="mini-label flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="sketch-input mt-1"
              />
            </label>
            <label className="block">
              <span className="mini-label flex items-center gap-1">
                <Lock className="h-3 w-3" /> Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="sketch-input mt-1"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              No spam. We only store the loan numbers you type in.
            </p>
            {error && <div className="chip bg-coral text-white text-xs">{error}</div>}
            <button
              type="submit"
              disabled={busy}
              className="sketch-btn mt-2 w-full justify-center disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-5 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="hand text-base underline">
              Log in
            </Link>
          </div>
        </SketchCard>
      </div>
    </PageShell>
  );
}

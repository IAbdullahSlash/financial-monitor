import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Marker } from "@/components/fintwin/ui";
import { AuthError, AuthField, AuthLayout } from "@/components/fintwin/auth-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Fin Twin" },
      {
        name: "description",
        content: "Create a free account to keep your financial twin synced across devices.",
      },
      { property: "og:title", content: "Register — Fin Twin" },
      {
        property: "og:description",
        content: "Test money decisions on your twin first. No bank connection required.",
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
    <AuthLayout
      badge={
        <>
          <Sparkles /> Free · optional
        </>
      }
      title={
        <>
          Keep your <Marker>twin</Marker> everywhere.
        </>
      }
      intro="An account is optional — it just keeps your twin synced across devices. Anything you added on this device moves in automatically."
      aside={
        <ul className="grid gap-1">
          <li>· Your twin on every device</li>
          <li>· Saved what-if scenarios</li>
          <li>· A backup if you clear your browser</li>
        </ul>
      }
      formTitle="Create an account"
      form={
        <form onSubmit={onSubmit} className="grid gap-4">
          <AuthField
            label="Name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ananya Sharma"
          />
          <AuthField
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          <AuthField
            label="Password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
          <p className="text-xs text-foreground/70">
            No spam. We only store the numbers you type in.
          </p>
          {error && <AuthError>{error}</AuthError>}
          <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
            {busy ? "Creating…" : "Create account"} <ArrowRight />
          </Button>
        </form>
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-heading text-foreground underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    />
  );
}

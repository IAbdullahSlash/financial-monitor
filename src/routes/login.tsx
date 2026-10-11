import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Marker } from "@/components/fintwin/ui";
import { AuthError, AuthField, AuthLayout } from "@/components/fintwin/auth-layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Fin Twin" },
      {
        name: "description",
        content: "Log in to see your financial twin on any device.",
      },
      { property: "og:title", content: "Login — Fin Twin" },
      { property: "og:description", content: "Your twin, synced to every device." },
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(friendlyError(err, "Unable to log in. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      badge={
        <>
          <Sparkles /> Welcome back
        </>
      }
      title={
        <>
          Log in to your <Marker>Fin Twin</Marker>.
        </>
      }
      intro="Your twin, synced to every device you log in from."
      aside="No bank connection, ever. You type in a few numbers; your twin does the maths."
      formTitle="Log in"
      form={
        <form onSubmit={onSubmit} className="grid gap-4">
          <AuthField
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <AuthField
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <AuthError>{error}</AuthError>}
          <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
            {busy ? "Logging in…" : "Log in"} <ArrowRight />
          </Button>
        </form>
      }
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-heading text-foreground underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    />
  );
}

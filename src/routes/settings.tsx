import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteUser } from "firebase/auth";
import { Download, Lock, Trash2 } from "lucide-react";
import { PageShell, SketchCard, SectionLabel, Marker } from "@/components/fintwin/ui";
import { useDeleteAllData, useLoans, useSaveSettings, useSettings } from "@/hooks/use-loans";
import { auth } from "@/integrations/firebase/client";
import { downloadFile } from "@/lib/calendar";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Fin Twin" }] }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const { settings, user, loading } = useSettings();
  const { loans } = useLoans();
  const saveSettings = useSaveSettings();
  const wipe = useDeleteAllData();
  const [takeHome, setTakeHome] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading) setTakeHome(settings.takeHome ? String(settings.takeHome) : "");
  }, [loading, settings.takeHome]);

  function saveTakeHome(e: React.FormEvent) {
    e.preventDefault();
    const value = takeHome.trim() === "" ? null : Math.max(0, Number(takeHome));
    saveSettings.mutate(
      { takeHome: value },
      {
        onSuccess: () => toast.success("Saved"),
        onError: (err) => toast.error(friendlyError(err, err.message || "Couldn't save.")),
      },
    );
  }

  async function deleteEverything(alsoAccount: boolean) {
    const what = alsoAccount ? "your account and all your loans" : "all your loans and settings";
    if (!window.confirm(`Permanently delete ${what}? This can't be undone.`)) return;
    setBusy(true);
    try {
      await wipe.mutateAsync();
      if (alsoAccount && auth.currentUser) await deleteUser(auth.currentUser);
      toast.success(alsoAccount ? "Account and data deleted" : "All data deleted");
      navigate({ to: "/" });
    } catch (err) {
      const code = (err as { code?: string }).code;
      toast.error(
        code === "auth/requires-recent-login"
          ? "Your data is deleted. To delete the account too, log out, log back in, and try again."
          : friendlyError(err, "Couldn't delete everything. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="max-w-3xl">
        <SectionLabel>Settings</SectionLabel>
        <h1 className="font-headline text-4xl md:text-5xl">
          Your data, <Marker>your call</Marker>.
        </h1>

        <SketchCard className="mt-8" hoverable={false}>
          <SectionLabel>Take-home pay</SectionLabel>
          <p className="text-sm">
            Optional. Used only to show what share of your salary goes to EMIs.
          </p>
          <form onSubmit={saveTakeHome} className="flex flex-wrap gap-3 mt-3">
            <input
              type="number"
              min={0}
              className="sketch-input max-w-xs"
              placeholder="Monthly, after tax (₹)"
              value={takeHome}
              onChange={(e) => setTakeHome(e.target.value)}
              aria-label="Monthly take-home pay"
            />
            <button className="sketch-btn" disabled={saveSettings.isPending}>
              Save
            </button>
          </form>
        </SketchCard>

        <SketchCard className="mt-5" hoverable={false}>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <SectionLabel>Where your data lives</SectionLabel>
          </div>
          {user ? (
            <p className="text-sm">
              Signed in as <span className="font-semibold">{user.email}</span>. Your loans are saved
              to your account so they sync across devices. Only you can read them.
            </p>
          ) : (
            <>
              <p className="text-sm">
                Only in this browser. Nothing is sent to us. Clearing your browser data will erase
                it, so create an account if you want a backup or to use another device.
              </p>
              <Link to="/register" className="sketch-btn-ghost text-sm mt-3">
                Create an account
              </Link>
            </>
          )}
          <p className="text-sm mt-3">
            We never connect to your bank and never ask for account numbers. We store only the loan
            details you type in.
          </p>
          <button
            className="sketch-btn-ghost text-sm mt-4"
            disabled={!loans.length}
            onClick={() =>
              downloadFile(
                "fintwin-loans.json",
                JSON.stringify({ exportedAt: new Date().toISOString(), settings, loans }, null, 2),
                "application/json",
              )
            }
          >
            <Download className="h-4 w-4" /> Download my data
          </button>
        </SketchCard>

        <SketchCard className="mt-5 border-coral" hoverable={false}>
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <SectionLabel>Delete</SectionLabel>
          </div>
          <p className="text-sm">
            Permanently removes every loan and setting
            {user ? " from your account and this browser" : " from this browser"}.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              className="sketch-btn-ghost text-sm"
              disabled={busy}
              onClick={() => deleteEverything(false)}
            >
              Delete all my data
            </button>
            {user && (
              <button
                className="sketch-btn text-sm bg-coral text-white"
                disabled={busy}
                onClick={() => deleteEverything(true)}
              >
                Delete my account too
              </button>
            )}
          </div>
        </SketchCard>
      </div>
    </PageShell>
  );
}

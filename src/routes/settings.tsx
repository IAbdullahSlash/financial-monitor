import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { deleteUser } from "firebase/auth";
import { Download, Lock, Trash2 } from "lucide-react";
import { Marker, PageHeading, PageShell } from "@/components/fintwin/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteAllData, useExport } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/integrations/firebase/client";
import { downloadFile } from "@/lib/calendar";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Fin Twin" }] }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useExport();
  const wipe = useDeleteAllData();
  const [busy, setBusy] = useState(false);

  async function deleteEverything(alsoAccount: boolean) {
    const what = alsoAccount
      ? "your account and everything in it"
      : "your twin, loans and scenarios";
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

  function exportData() {
    downloadFile(
      "fintwin-data.json",
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          twin: data.twin,
          loans: data.loans,
          scenarios: data.scenarios,
        },
        null,
        2,
      ),
      "application/json",
    );
  }

  return (
    <PageShell>
      <div className="grid max-w-3xl gap-6">
        <PageHeading eyebrow="Settings">
          Your data, <Marker>your call</Marker>.
        </PageHeading>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="size-5" /> Where your data lives
            </CardTitle>
            <CardDescription>
              {user ? (
                <>
                  Signed in as <span className="font-heading">{user.email}</span>. Your twin is
                  saved to your account so it syncs across devices. Only you can read it.
                </>
              ) : (
                <>
                  Only in this browser. Nothing is sent to us. Clearing your browser data will erase
                  it, so create an account if you want a backup or to use another device.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              We never connect to your bank and never ask for account numbers. We store only the
              numbers you type in.
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-3">
            <Button variant="neutral" disabled={!data.hasData} onClick={exportData}>
              <Download /> Download my data
            </Button>
            {!user && (
              <Link to="/register" className={buttonVariants()}>
                Create an account
              </Link>
            )}
          </CardFooter>
        </Card>

        <Card className="bg-bad">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="size-5" /> Delete
            </CardTitle>
            <CardDescription>
              Permanently removes your twin, loans and scenarios
              {user ? " from your account and this browser" : " from this browser"}.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-wrap gap-3">
            <Button variant="neutral" disabled={busy} onClick={() => deleteEverything(false)}>
              Delete all my data
            </Button>
            {user && (
              <Button variant="neutral" disabled={busy} onClick={() => deleteEverything(true)}>
                Delete my account too
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}

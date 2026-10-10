import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell, SectionLabel, Marker } from "@/components/fintwin/ui";
import { LoanForm } from "@/components/fintwin/LoanForm";
import { useLoan, useSaveLoan } from "@/hooks/use-loans";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/loans/$id_/edit")({
  head: () => ({ meta: [{ title: "Edit loan — Fin Twin" }] }),
  component: EditLoan,
});

function EditLoan() {
  const { id } = Route.useParams();
  const { loan, loading } = useLoan(id);
  const navigate = useNavigate();
  const save = useSaveLoan();

  if (loading) {
    return (
      <PageShell>
        <div className="hand text-lg">Loading…</div>
      </PageShell>
    );
  }
  if (!loan) {
    return (
      <PageShell>
        <p className="hand text-lg">That loan doesn't exist any more.</p>
        <Link to="/" className="sketch-btn mt-4">
          Back to my loans
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionLabel>Edit loan</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl mb-8">
        Update <Marker>{loan.name}</Marker>.
      </h1>
      <LoanForm
        existing={loan}
        submitLabel="Save changes"
        saving={save.isPending}
        onSubmit={(updated) =>
          save.mutate(updated, {
            onSuccess: () => {
              toast.success("Saved");
              navigate({ to: "/loans/$id", params: { id: loan.id } });
            },
            onError: (err) =>
              toast.error(friendlyError(err, err.message || "Couldn't save the loan.")),
          })
        }
      />
    </PageShell>
  );
}

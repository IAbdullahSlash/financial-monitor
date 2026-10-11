import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loading, Marker, PageHeading, PageShell } from "@/components/fintwin/ui";
import { buttonVariants } from "@/components/ui/button";
import { LoanForm } from "@/components/fintwin/LoanForm";
import { useLoan, useSaveLoan } from "@/hooks/use-store";
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
    return <Loading>Loading…</Loading>;
  }
  if (!loan) {
    return (
      <PageShell>
        <p className="font-heading text-lg">That loan doesn't exist any more.</p>
        <Link to="/setup" className={buttonVariants({ className: "mt-4" })}>
          Back to my twin
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-8">
        <PageHeading eyebrow="Edit loan">
          Update <Marker>{loan.name}</Marker>.
        </PageHeading>
      </div>
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

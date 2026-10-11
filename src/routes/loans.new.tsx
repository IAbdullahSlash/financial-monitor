import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Marker, PageHeading, PageShell } from "@/components/fintwin/ui";
import { LoanForm } from "@/components/fintwin/LoanForm";
import { useSaveLoan } from "@/hooks/use-store";
import { friendlyError } from "@/lib/auth-errors";

export const Route = createFileRoute("/loans/new")({
  head: () => ({ meta: [{ title: "Add a loan — Fin Twin" }] }),
  component: NewLoan,
});

function NewLoan() {
  const navigate = useNavigate();
  const save = useSaveLoan();
  return (
    <PageShell>
      <div className="mb-8">
        <PageHeading eyebrow="Add a loan">
          Tell us about <Marker>one loan</Marker>.
        </PageHeading>
      </div>
      <LoanForm
        submitLabel="Add loan"
        saving={save.isPending}
        onSubmit={(loan) =>
          save.mutate(loan, {
            onSuccess: () => {
              toast.success(`${loan.name} added`);
              navigate({ to: "/setup", hash: "loans" });
            },
            onError: (err) =>
              toast.error(friendlyError(err, err.message || "Couldn't save the loan.")),
          })
        }
      />
    </PageShell>
  );
}

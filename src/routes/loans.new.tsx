import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell, SectionLabel, Marker } from "@/components/fintwin/ui";
import { LoanForm } from "@/components/fintwin/LoanForm";
import { useSaveLoan } from "@/hooks/use-loans";
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
      <SectionLabel>Add a loan</SectionLabel>
      <h1 className="font-headline text-4xl md:text-5xl mb-8">
        Tell us about <Marker>one loan</Marker>.
      </h1>
      <LoanForm
        submitLabel="Add loan"
        saving={save.isPending}
        onSubmit={(loan) =>
          save.mutate(loan, {
            onSuccess: () => {
              toast.success(`${loan.name} added`);
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

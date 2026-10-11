import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { PageShell, ToneBadge } from "@/components/fintwin/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Shared two-column layout for the login and register pages. */
export function AuthLayout({
  badge,
  title,
  intro,
  aside,
  formTitle,
  form,
  footer,
}: {
  badge: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  aside: ReactNode;
  formTitle: string;
  form: ReactNode;
  footer: ReactNode;
}) {
  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div>
          <ToneBadge tone="warn" className="mb-4">
            {badge}
          </ToneBadge>
          <h1 className="font-display text-5xl leading-tight md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-md text-xl text-foreground/80">{intro}</p>
          <Card className="mt-8 hidden bg-secondary-background lg:flex">
            <CardContent className="text-sm">{aside}</CardContent>
          </Card>
        </div>
        <Card className="bg-secondary-background">
          <CardHeader>
            <CardTitle className="font-display text-2xl">{formTitle}</CardTitle>
          </CardHeader>
          <CardContent>{form}</CardContent>
          <CardFooter className="justify-center text-sm">
            <CardDescription>{footer}</CardDescription>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}

export function AuthField({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof Input>) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <Alert className="bg-bad">
      <AlertCircle />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

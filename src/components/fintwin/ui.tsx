// App-level building blocks, composed from the shadcn (neobrutalism) components in components/ui.
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import {
  Compass,
  FlaskConical,
  LineChart,
  LogIn,
  LogOut,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toneBg, type Tone } from "@/components/fintwin/tones";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/integrations/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Your future", icon: LineChart },
  { to: "/what-if", label: "What if…", icon: FlaskConical },
  { to: "/setup", label: "My twin", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function useIsActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return async () => {
    await signOut(auth);
    // Drop the previous user's cached data.
    queryClient.clear();
    navigate({ to: "/" });
  };
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-base border-2 border-border bg-main font-display text-lg shadow-shadow">
        F
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg">Fin Twin</span>
        <span className="block text-xs text-foreground/70">test decisions first</span>
      </span>
    </Link>
  );
}

function NavBar() {
  const isActive = useIsActive();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-secondary-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Logo />
        </div>
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={buttonVariants({
                variant: isActive(n.to) ? "default" : "neutral",
                size: "sm",
              })}
            >
              <n.icon /> {n.label}
            </Link>
          ))}
        </nav>
        <AuthActions />
      </div>
    </header>
  );
}

function AuthActions() {
  const { user, loading } = useAuth();
  const handleSignOut = useSignOut();
  if (loading) return <div className="w-24" />;
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-40 truncate text-sm text-foreground/70 xl:inline">
          {user.email}
        </span>
        <Button variant="neutral" size="sm" onClick={handleSignOut}>
          <LogOut /> Sign out
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link to="/login" className={buttonVariants({ variant: "neutral", size: "sm" })}>
        Log in
      </Link>
      <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
        Sync across devices
      </Link>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const handleSignOut = useSignOut();
  const isActive = useIsActive();
  const item = (active: boolean) =>
    cn(buttonVariants({ variant: active ? "default" : "neutral" }), "w-full justify-start");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="neutral" size="icon" aria-label="Open menu" className="lg:hidden" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-secondary-background">
        <SheetHeader className="border-b-2 border-border">
          <SheetTitle className="font-display text-lg">Fin Twin</SheetTitle>
          <SheetDescription>No bank connection, ever.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-3 px-4" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={item(isActive(n.to))}
            >
              <n.icon /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t-2 border-border p-4">
          {user ? (
            <Button
              variant="neutral"
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                void handleSignOut();
              }}
            >
              <LogOut /> Sign out
            </Button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={item(isActive("/login"))}>
                <LogIn /> Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className={item(isActive("/register"))}
              >
                <Compass /> Create an account
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className={cn("mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6", className)}>
        {children}
      </main>
      <footer className="border-t-2 border-border bg-secondary-background py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 text-sm sm:px-6">
          <span>No bank connection, ever · your numbers stay yours</span>
          <span className="font-heading">Fin Twin © 2026</span>
        </div>
      </footer>
    </div>
  );
}

/** Small uppercase eyebrow above a heading or inside a card. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-2 text-xs font-heading uppercase tracking-widest text-foreground/70",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Highlighted words inside a headline. */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-base border-2 border-border bg-main px-1.5 box-decoration-clone">
      {children}
    </span>
  );
}

export function ToneBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <Badge className={cn("font-heading", toneBg[tone], className)}>{children}</Badge>;
}

/** Page heading with an optional eyebrow and supporting line. */
export function PageHeading({
  eyebrow,
  children,
  description,
}: {
  eyebrow?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div>
      {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
      <h1 className="font-display text-4xl leading-tight md:text-5xl">{children}</h1>
      {description && <p className="mt-2 text-lg text-foreground/80">{description}</p>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Card size="sm" className={cn("gap-1", toneBg[tone])}>
      <CardContent>
        <SectionLabel className="mb-1 text-foreground/80">{label}</SectionLabel>
        <div className="font-display text-2xl md:text-3xl">{value}</div>
        {hint && <div className="mt-1 text-xs">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export function Loading({ children }: { children: ReactNode }) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 8_000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <PageShell>
      {timedOut ? (
        <div className="grid max-w-md gap-4">
          <div>
            <p className="font-heading text-lg">This is taking longer than expected.</p>
            <p className="mt-2 text-foreground/70">
              Check your connection, then try loading Fin Twin again.
            </p>
          </div>
          <Button
            type="button"
            variant="neutral"
            className="w-fit"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <p className="font-heading text-lg">{children}</p>
      )}
    </PageShell>
  );
}

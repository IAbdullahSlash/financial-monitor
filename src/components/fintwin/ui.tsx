import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { Menu, X, Compass, LayoutDashboard, User, Target, HeartPulse, PieChart, Receipt, Sparkles, Play, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Simulator", icon: Play },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/health", label: "Health", icon: HeartPulse },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/tax", label: "Tax", icon: Receipt },
  { to: "/life", label: "Life", icon: Sparkles },
];

export function NavBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="sketch-btn-ghost !p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-marker shadow-[2px_2px_0_0_var(--ink)]">
              <span className="font-headline text-lg">F</span>
            </div>
            <div className="leading-tight">
              <div className="font-headline text-lg">Fin Twin</div>
              <div className="hand text-xs text-muted-foreground -mt-1">your money co-pilot</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <AuthHeaderActions />
        </div>
      </div>
    </header>
  );
}

function AuthHeaderActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (user) {
    return (
      <>
        <span className="hand text-sm hidden md:inline text-muted-foreground truncate max-w-[160px]">{user.email}</span>
        <Link to="/dashboard" className="sketch-btn text-sm">Dashboard</Link>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
          className="sketch-btn-ghost text-sm"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </>
    );
  }
  return (
    <>
      <Link to="/login" className="sketch-btn-ghost text-sm hidden sm:inline-flex">Login / Register</Link>
      <Link to="/register" className="sketch-btn text-sm">Get Started</Link>
    </>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 animate-fade-in"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-paper border-r-2 border-ink shadow-[6px_0_0_0_var(--ink)] transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-marker shadow-[2px_2px_0_0_var(--ink)]">
              <span className="font-headline text-lg">F</span>
            </div>
            <div className="font-headline text-lg">Fin Twin</div>
          </div>
          <button onClick={onClose} className="sketch-btn-ghost !p-2" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          <div className="mini-label px-3 pt-2 pb-1">Sections</div>
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:border-ink"
              activeProps={{ className: "bg-ink text-primary-foreground border-ink hover:bg-ink hover:text-primary-foreground" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
          <div className="mini-label px-3 pt-4 pb-1">Account</div>
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:border-ink"
            activeProps={{ className: "bg-ink text-primary-foreground border-ink" }}
          >
            <User className="h-4 w-4" />
            Login
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:border-ink"
            activeProps={{ className: "bg-ink text-primary-foreground border-ink" }}
          >
            <Compass className="h-4 w-4" />
            Register
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-ink bg-butter">
          <div className="hand text-sm">made with pencils, not APIs</div>
          <div className="mini-label mt-1">Fin Twin © 2026</div>
        </div>
      </aside>
    </>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <NavBar onOpenSidebar={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className={cn("mx-auto max-w-7xl px-6 py-10 animate-fade-in", className)}>{children}</main>
      <footer className="border-t-2 border-ink py-8 mt-16">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between text-sm">
          <span className="hand text-base">made with pencils, not APIs · V1</span>
          <span className="mini-label">Fin Twin © 2026</span>
        </div>
      </footer>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mini-label mb-2">{children}</div>;
}

export function Marker({ children }: { children: ReactNode }) {
  return <span className="marker-hl">{children}</span>;
}

export function StatusChip({
  tone = "neutral",
  children,
}: {
  tone?: "good" | "warn" | "risk" | "neutral" | "info";
  children: ReactNode;
}) {
  const bg: Record<string, string> = {
    good: "bg-mint",
    warn: "bg-butter",
    risk: "bg-coral text-white",
    neutral: "bg-card",
    info: "bg-sky",
  };
  return <span className={cn("chip", bg[tone])}>{children}</span>;
}

export function SketchCard({
  children,
  className,
  hoverable = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  as?: any;
}) {
  return (
    <Tag className={cn("sketch-card p-6", hoverable && "sketch-card-hover", className)}>{children}</Tag>
  );
}

export function DashedCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("dashed-card p-6", className)}>{children}</div>;
}

export function StatTile({
  label,
  value,
  hint,
  tone = "card",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "card" | "mint" | "sky" | "butter" | "coral";
}) {
  const bg: Record<string, string> = {
    card: "bg-card",
    mint: "bg-mint",
    sky: "bg-sky",
    butter: "bg-butter",
    coral: "bg-coral text-white",
  };
  return (
    <div className={cn("sketch-card p-5", bg[tone])}>
      <div className="mini-label">{label}</div>
      <div className="font-headline text-3xl mt-1">{value}</div>
      {hint && <div className="text-xs mt-1 opacity-80">{hint}</div>}
    </div>
  );
}

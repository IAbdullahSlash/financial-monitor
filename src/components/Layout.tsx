import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleUser, Menu, X } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Planner", path: "/planner" },
    { name: "Invest", path: "/invest" },
    { name: "FIRE", path: "/fire-planner" },
    { name: "Health", path: "/health-score" },
    { name: "Advisor", path: "/life-advisor" },
    { name: "Tax", path: "/tax-wizard" },
    { name: "Couples", path: "/couples-planner" },
    { name: "X-Ray", path: "/portfolio-xray" },
    { name: "Academy", path: "/academy" },
  ];

  return (
    <div className="min-h-screen bg-surface font-body text-primary">
      {/* Top Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 px-4 md:px-8 h-20 bg-white/95 backdrop-blur-sm sketch-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-3xl font-black text-primary italic font-headline marker-highlight">Fin-Win</Link>
        </div>

        <div className="hidden lg:flex items-center gap-1 font-headline text-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-pill hover:rotate-1 ${
                location.pathname === link.path
                  ? "nav-pill-active text-primary"
                  : "text-primary hover:text-secondary hover:bg-primary/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden sketch-button px-3 py-1.5 text-base"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <CircleUser className="hidden sm:block text-primary w-10 h-10 cursor-pointer hover:rotate-12 transition-transform" />
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-28 left-4 right-4 z-40 sketch-card bg-white/95 backdrop-blur-sm p-4">
          <div className="grid grid-cols-2 gap-2 font-headline text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-pill text-center ${
                  location.pathname === link.path
                    ? "nav-pill-active text-primary"
                    : "text-primary hover:text-secondary hover:bg-primary/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="pt-36 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="page-stack">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 flex flex-col items-center gap-6 mt-20 pt-12 pb-8 border-t-2 border-dashed border-primary/20 font-body text-lg">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold font-headline marker-highlight">Fin-Win India</span>
          <p className="text-primary/60 text-center italic">Growth for all. Hand-drawn with care.</p>
        </div>
        <div className="flex gap-8 text-primary/80 font-headline">
          <a className="hover:text-secondary transition-colors hover:underline decoration-wavy" href="#">Privacy</a>
          <a className="hover:text-secondary transition-colors hover:underline decoration-wavy" href="#">Terms</a>
          <a className="hover:text-secondary transition-colors hover:underline decoration-wavy" href="#">Support</a>
          <a className="hover:text-secondary transition-colors hover:underline decoration-wavy" href="#">Careers</a>
        </div>
        <p className="text-primary/40 mt-4 font-accent">© 2026 Fin-Win India. All rights reserved.</p>
      </footer>
    </div>
  );
}

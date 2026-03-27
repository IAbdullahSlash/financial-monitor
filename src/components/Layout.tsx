import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleUser } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const navLinks = [
    { name: "Dashboard", path: "/" },
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
      <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center px-8 h-20 bg-white sketch-border">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-3xl font-black text-primary italic font-headline marker-highlight">Fin-Win</Link>
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline text-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-all duration-300 hover:rotate-2 ${
                location.pathname === link.path
                  ? "text-secondary underline decoration-wavy decoration-accent underline-offset-8"
                  : "text-primary hover:text-secondary"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <CircleUser className="text-primary w-10 h-10 cursor-pointer hover:rotate-12 transition-transform" />
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full px-8 flex flex-col items-center gap-6 mt-20 pt-12 pb-8 border-t-2 border-dashed border-primary/20 font-body text-lg">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold font-headline marker-highlight">Fin-Win India</span>
          <p className="text-primary/60 text-center italic">Growth for All. Hand-drawn with ❤️</p>
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

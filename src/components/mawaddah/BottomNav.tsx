import { Link } from "@tanstack/react-router";
import { Compass, Home, MessageCircle, Sparkles, User } from "lucide-react";

export function BottomNav({ active }: { active: "home" | "discover" }) {
  const soon = "Coming soon";
  return (
    <nav className="sticky bottom-0 z-30 flex h-16 shrink-0 items-center justify-between border-t border-border bg-card px-5 shadow-[0_-4px_16px_-8px_var(--color-border)]">
      <Link to="/" className="nav-tab" data-active={active === "home"} aria-label="Home feed">
        <Home className="h-5 w-5" />
      </Link>
      <Link to="/discover" className="nav-tab" data-active={active === "discover"} aria-label="Discover by values">
        <Compass className="h-5 w-5" />
      </Link>
      <button className="nav-tab" aria-label="Matches" title={soon}><Sparkles className="h-5 w-5" /></button>
      <button className="nav-tab" aria-label="Messages" title={soon}><MessageCircle className="h-5 w-5" /></button>
      <button className="nav-tab" aria-label="My profile" title={soon}><User className="h-5 w-5" /></button>
    </nav>
  );
}

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas sm:py-6">
      <div className="mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-card sm:min-h-[calc(100vh-3rem)] sm:rounded-[2.5rem] sm:shadow-card">
        {children}
      </div>
    </div>
  );
}

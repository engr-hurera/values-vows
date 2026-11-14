import { Link } from "@tanstack/react-router";
import { Compass, Home, MessageCircle, Sparkles, User } from "lucide-react";

export type NavTab = "home" | "discover" | "matches" | "messages" | "settings";

export function BottomNav({ active }: { active: NavTab }) {
  return (
    <nav className="sticky bottom-0 z-30 flex h-16 shrink-0 items-center justify-between border-t border-border bg-card px-5 shadow-[0_-4px_16px_-8px_var(--color-border)]">
      <Link to="/feed" className="nav-tab" data-active={active === "home"} aria-label="Home feed">
        <Home className="h-5 w-5" />
      </Link>
      <Link to="/discover" className="nav-tab" data-active={active === "discover"} aria-label="Discover by values">
        <Compass className="h-5 w-5" />
      </Link>
      <Link to="/matches" className="nav-tab" data-active={active === "matches"} aria-label="Matches">
        <Sparkles className="h-5 w-5" />
      </Link>
      <Link to="/messages" className="nav-tab" data-active={active === "messages"} aria-label="Messages">
        <MessageCircle className="h-5 w-5" />
      </Link>
      <Link to="/settings" className="nav-tab" data-active={active === "settings"} aria-label="My profile & settings"><User className="h-5 w-5" /></Link>
    </nav>
  );
}

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas min-[421px]:py-6">
      {/* Same fixed 375 x 812 phone as the sign-up screens. */}
      <div className="relative mx-auto flex w-full max-w-[375px] min-h-[812px] flex-col overflow-hidden bg-card min-[421px]:rounded-[2.5rem] min-[421px]:shadow-card">
        {children}
      </div>
    </div>
  );
}

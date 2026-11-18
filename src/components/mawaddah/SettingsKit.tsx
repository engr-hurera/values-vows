import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { getAccount, updateAccount, useAccount, useRequireAccount, type Account } from "@/lib/session";

/** Reads the signed-in account; null while redirecting. */
export function useSettingsAccount(): Account | null {
  const ready = useRequireAccount();
  const raw = useAccount();
  return ready && raw ? (JSON.parse(raw) as Account) : null;
}

export function pref(a: Account, key: string, def: boolean) {
  return a.prefs?.[key] ?? def;
}
export function setPref(key: string, value: boolean) {
  updateAccount({ prefs: { ...(getAccount()?.prefs ?? {}), [key]: value } });
}

export function SettingsPage({ title, badge, back = "/settings/menu", children }: { title: string; badge?: string | undefined; back?: "/settings" | "/settings/menu"; children: React.ReactNode }) {
  return (
    <PhoneShell>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Link to={back} aria-label="Back" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary"><ChevronLeft className="h-4 w-4" /></Link>
          <h1 className="text-base font-extrabold text-primary">{title}</h1>
        </div>
        {badge && <span className="rounded-full bg-trust-light px-2.5 py-1 text-[10px] font-bold text-trust">{badge}</span>}
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto px-5 py-5">{children}</main>
      <BottomNav active="settings" />
    </PhoneShell>
  );
}

export function Card({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "accent" | "trust" }) {
  const t = tone === "accent" ? "bg-accent-light border-accent-border" : tone === "trust" ? "bg-trust-light border-border" : "bg-card border-border";
  return <div className={`space-y-3 rounded-3xl border p-4 ${t}`}>{children}</div>;
}

export function ToggleRow({ a, k, label, sub, def = true }: { a: Account; k: string; label: string; sub?: string; def?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3">
      <div>
        <span className="block text-xs font-bold text-primary">{label}</span>
        {sub && <span className="block text-[11px] text-muted-foreground">{sub}</span>}
      </div>
      <Switch className="filter-toggle" aria-label={label} checked={pref(a, k, def)} onCheckedChange={(v) => setPref(k, v)} />
    </div>
  );
}

export function PrimaryAction({ children, onClick, tone = "primary" }: { children: React.ReactNode; onClick: () => void; tone?: "primary" | "danger" | "soft" }) {
  const t = tone === "danger" ? "border border-destructive/30 text-destructive" : tone === "soft" ? "bg-secondary text-primary" : "bg-primary text-primary-foreground";
  return <button type="button" onClick={onClick} className={`w-full rounded-full py-3.5 text-sm font-bold ${t}`}>{children}</button>;
}

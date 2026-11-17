import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, CreditCard, EyeOff, ShieldCheck, Users } from "lucide-react";
import { SettingsPage, useSettingsAccount } from "@/components/mawaddah/SettingsKit";

export const Route = createFileRoute("/settings_/menu")({
  head: () => ({ meta: [
    { title: "Settings & Privacy — Mawaddah" },
    { name: "description", content: "Modesty, Wali, Salah quiet hours, security and billing settings." },
    { property: "og:title", content: "Settings & Privacy — Mawaddah" },
    { property: "og:description", content: "Modesty, Wali, Salah quiet hours, security and billing settings." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Menu,
});

const ITEMS = [
  { to: "/settings/privacy", icon: EyeOff, t: "1. Modesty & Photo Privacy", s: "Blur vault, watermark, revoke viewers" },
  { to: "/settings/wali", icon: Users, t: "2. Wali & Chaperone Rules", s: "Guardian WhatsApp alerts & permissions" },
  { to: "/settings/salah", icon: Bell, t: "3. Salah Quiet Hours & Alerts", s: "Auto-mute for prayer, discreet lock screen" },
  { to: "/settings/security", icon: ShieldCheck, t: "4. Security & Contact Block List", s: "Block phonebook contacts, 2FA, ID status" },
  { to: "/settings/billing", icon: CreditCard, t: "5. Billing & Istikhara Pause", s: "Manage plan, snooze profile, delete account" },
] as const;

function Menu() {
  const a = useSettingsAccount();
  if (!a) return null;
  return (
    <SettingsPage title="Settings & Privacy" badge="v2.4 Halal" back="/settings">
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {ITEMS.map(({ to, icon: Icon, t, s }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/60">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent"><Icon className="h-4 w-4" /></span>
            <span className="flex-1"><span className="block text-sm font-bold text-primary">{t}</span><span className="block text-[11px] text-muted-foreground">{s}</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </SettingsPage>
  );
}

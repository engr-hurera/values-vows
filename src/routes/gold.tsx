import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SettingsPage, useSettingsAccount } from "@/components/mawaddah/SettingsKit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gold")({
  head: () => ({ meta: [
    { title: "Barakah Gold — Mawaddah" },
    { name: "description", content: "Unlock precision filters and Incognito Mode with transparent pricing and 1-tap cancel." },
    { property: "og:title", content: "Barakah Gold — Mawaddah" },
    { property: "og:description", content: "Unlock precision filters and Incognito Mode with transparent pricing and 1-tap cancel." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Gold,
});

const PLANS = [
  { id: "1m", t: "1 Month", p: "$18", n: "billed monthly" },
  { id: "3m", t: "3 Months", p: "$11/mo", n: "$33 every 3 months", best: true },
  { id: "6m", t: "6 Months", p: "$8/mo", n: "$48 every 6 months" },
];
const FEATURES = ["Visa sponsorship & relocation filters", "Living after Nikah & financial / Riba filters", "Polygamy stance filter", "Wali-supervised & Verified ID only filters", "Incognito Mode until you propose"];

function Gold() {
  const a = useSettingsAccount();
  const [plan, setPlan] = useState("3m");
  if (!a) return null;
  return (
    <SettingsPage title="Mawaddah Barakah Gold" back="/settings/menu">
      <div className="grid grid-cols-3 gap-2">
        {PLANS.map((p) => (
          <button key={p.id} type="button" aria-pressed={plan === p.id} onClick={() => setPlan(p.id)} className={cn("relative rounded-3xl border p-3 pt-5 text-center", plan === p.id ? "border-accent bg-accent-light" : "border-border bg-card")}>
            {p.best && <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-accent-foreground">Best Value</span>}
            <span className="block text-[11px] font-bold text-muted-foreground">{p.t}</span>
            <span className="block text-base font-extrabold text-primary">{p.p}</span>
            <span className="block text-[9px] text-muted-foreground">{p.n}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2.5 rounded-3xl border border-border bg-card p-4">
        <h2 className="text-xs font-extrabold text-primary">What you unlock</h2>
        {FEATURES.map((f) => <p key={f} className="flex items-center gap-2 text-xs text-primary"><Check className="h-4 w-4 shrink-0 text-trust" />{f}</p>)}
      </div>
      <div className="rounded-3xl bg-trust-light p-4 text-[11px] leading-relaxed text-trust">🤝 Our pledge: we remind you 3 days before every renewal, and you can pause or cancel anytime in one tap.</div>
      <button type="button" onClick={() => toast("Payments are coming soon, in shaa Allah")} className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground">Continue with {PLANS.find((p) => p.id === plan)!.t}</button>
    </SettingsPage>
  );
}

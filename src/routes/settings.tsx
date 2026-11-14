import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { resetOnboarding, updateAccount, guardianUpdatesDefault, useAccount, useRequireAccount, type Account } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "My Profile & Settings — Mawaddah" },
      { name: "description", content: "Manage your Mawaddah profile, privacy and account." },
      { property: "og:title", content: "My Profile & Settings — Mawaddah" },
      { property: "og:description", content: "Manage your Mawaddah profile, privacy and account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const raw = useAccount();
  const ready = useRequireAccount();
  if (!ready || !raw) return null;
  const a: Account = JSON.parse(raw);
  const rows: [string, string][] = [
    ["Location", [a.city, a.country].filter(Boolean).join(", ")],
    ["Date of Birth", a.dob],
    ["Sect", a.sect],
    ["Marriage Timeline", a.timeline],
    ["Guardian", a.guardianName ? `${a.guardianName} · ${a.guardianWhatsapp ?? ""}` : "Not added"],
    a.phone ? ["Phone", a.phone] : ["Email", a.email],
  ];
  if (a.gender === "woman") rows.push(["Modesty Blur", a.privacyBlur ? "On" : "Off"]);
  rows.push(["Anti-Screenshot Watermark", a.antiScreenshot === false ? "Off" : "On"]);

  return (
    <PhoneShell>
      <main className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary ring-4 ring-accent-light">
            {a.photo && <img src={a.photo} alt="My photo" className={cn("h-full w-full object-cover", a.gender === "woman" && a.privacyBlur && "blur-md")} />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{a.firstName}</h1>
            <p className="text-xs text-muted-foreground">{a.gender === "man" ? "Man" : "Woman"}</p>
          </div>
        </div>
        <dl className="divide-y divide-border rounded-3xl border border-border bg-secondary px-4">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt><dd className="text-right font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <section className="space-y-3">
          <h2 className="text-sm font-bold">Guardian WhatsApp</h2>
          <label className="block text-xs text-muted-foreground">Guardian Name<input value={a.guardianName ?? ""} onChange={e => updateAccount({guardianName: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-sm text-primary"/></label>
          <label className="block text-xs text-muted-foreground">WhatsApp Number<input type="tel" value={a.guardianWhatsapp ?? ""} onChange={e => {const v = e.target.value; updateAccount({guardianWhatsapp: v, guardianUpdates: !a.guardianWhatsapp?.trim() || !v.trim() ? guardianUpdatesDefault(v) : a.guardianUpdates});}} className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-sm text-primary"/></label>
          <div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold">Send chat messages &amp; updates to Guardian on WhatsApp</span><Switch aria-label="Send chat messages & updates to Guardian on WhatsApp" checked={!!a.guardianUpdates} disabled={!a.guardianWhatsapp?.trim()} onCheckedChange={v => updateAccount({guardianUpdates: v})}/></div>
        </section>
        <Button variant="reference" size="reference" asChild className="w-full justify-between border-y border-border py-4 text-sm font-bold"><Link to="/security"><ShieldCheck className="h-4 w-4"/>Security &amp; Verification<ChevronRight className="h-4 w-4"/></Link></Button>
        <Button variant="reference" size="reference"
          onClick={() => { resetOnboarding(); navigate({ to: "/", replace: true }); }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 py-4 text-sm font-bold text-destructive"
        >
          <LogOut className="h-4 w-4" />Log Out / Reset Onboarding
        </Button>
      </main>
      <BottomNav active="settings" />
    </PhoneShell>
  );
}

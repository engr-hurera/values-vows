import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, ChevronRight, FileText, Settings2 } from "lucide-react";
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
        {(() => {
          const pillars: [string, boolean][] = [
            ["Identity", !!(a.fullName || a.firstName) && !!a.dob],
            ["Visa", !!a.country],
            ["Deen", !!a.sect],
            ["Wali", !!a.guardianWhatsapp?.trim()],
            ["Photos", !!(a.photo || a.photos?.some(Boolean))],
            ["Prompts", !!a.voiceIntro],
          ];
          const done = pillars.filter(([, ok]) => ok).length;
          return (
            <section className="space-y-3 rounded-3xl border border-accent-border bg-accent-light p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-primary">🕌 Nikkah Readiness: {done} of 6 Pillars Done</h2>
                {done < 6 && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">+{(6 - done) * 4}% Boost</span>}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.round((done / 6) * 100)}%` }} /></div>
              <div className="flex flex-wrap gap-1.5">
                {pillars.map(([k, ok]) => <span key={k} className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", ok ? "bg-trust-light text-trust" : "bg-card text-accent")}>{ok ? "✓" : "!"} {k}</span>)}
              </div>
              {done < 6 && <p className="text-[11px] leading-relaxed text-muted-foreground">Complete the missing pillars below so families see 100% compatibility.</p>}
            </section>
          );
        })()}
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
        <button type="button" onClick={() => printBiodata(a)} className="flex w-full items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent"><FileText className="h-4 w-4" /></span>
          <span className="flex-1"><span className="block text-sm font-bold text-primary">📄 Family Rishta Biodata PDF</span><span className="block text-[11px] text-muted-foreground">For parents on WhatsApp · save as PDF</span></span>
          <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">Export</span>
        </button>
        <Button variant="reference" size="reference" asChild className="w-full justify-between border-t border-border py-4 text-sm font-bold"><Link to="/settings/menu"><Settings2 className="h-4 w-4"/>Settings &amp; Privacy<ChevronRight className="h-4 w-4"/></Link></Button>
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

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
/** Opens a printable biodata so the browser can save it as a PDF. */
function printBiodata(a: Account) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows: [string, unknown][] = [["Name", a.fullName || a.firstName], ["Gender", a.gender === "man" ? "Man" : "Woman"], ["Date of Birth", a.dob], ["Height", a.height], ["Marital Status", a.maritalStatus], ["Lives in", [a.city, a.country].filter(Boolean).join(", ")], ["Born in", a.bornCountry], ["Ethnicity", a.ethnicity], ["Languages", a.languages?.join(", ")], ["Sect", a.sect], ["Nikah Timeline", a.timeline], ["Guardian", a.guardianName]];
  w.document.write(`<html><head><title>Rishta Biodata — ${esc(a.firstName)}</title><style>body{font-family:'Plus Jakarta Sans',sans-serif;padding:32px;color:#1C1917}h1{font-size:22px}td{padding:6px 12px;border-bottom:1px solid #E4DDD5}td:first-child{color:#7A6E6A}</style></head><body><h1>Family Rishta Biodata</h1><table>${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join("")}</table><p style="margin-top:24px;font-size:11px;color:#7A6E6A">Shared from Mawaddah</p></body></html>`);
  w.document.close();
  w.print();
}

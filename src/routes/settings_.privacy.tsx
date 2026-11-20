import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, PrimaryAction, SettingsPage, ToggleRow, useSettingsAccount } from "@/components/mawaddah/SettingsKit";
import { PROFILES } from "@/lib/profiles";
import { updateAccount } from "@/lib/session";

export const Route = createFileRoute("/settings_/privacy")({
  head: () => ({ meta: [
    { title: "Modesty & Photo Privacy — Mawaddah" },
    { name: "description", content: "Control photo blur, forensic watermark, incognito mode and who can see your photos." },
    { property: "og:title", content: "Modesty & Photo Privacy — Mawaddah" },
    { property: "og:description", content: "Control photo blur, forensic watermark, incognito mode and who can see your photos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Privacy,
});

function Privacy() {
  const a = useSettingsAccount();
  if (!a) return null;
  const viewers = a.approvedViewers ?? PROFILES.filter((p) => p.gender === "man").slice(0, 2).map((p) => p.id);
  const people = viewers.map((id) => PROFILES.find((p) => p.id === id)).filter((p) => !!p);
  return (
    <SettingsPage title="Modesty & Photo Privacy" badge="Protected">
      {a.gender === "woman" && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3">
          <div><span className="block text-xs font-bold text-primary">Blur Photos to Public Feed</span><span className="block text-[11px] text-muted-foreground">Only approved matches see clear photos</span></div>
          <input type="checkbox" className="sr-only" readOnly checked={a.privacyBlur} />
          <button type="button" role="switch" aria-checked={a.privacyBlur} aria-label="Blur Photos to Public Feed" onClick={() => updateAccount({ privacyBlur: !a.privacyBlur })} data-state={a.privacyBlur ? "checked" : "unchecked"} className="filter-toggle inline-flex shrink-0 items-center rounded-full bg-input"><span className="block rounded-full bg-card shadow transition-transform" /></button>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3">
        <div><span className="block text-xs font-bold text-primary">Forensic Viewer-ID Watermark</span><span className="block text-[11px] text-muted-foreground">Stamps viewer name &amp; blocks screenshots</span></div>
        <button type="button" role="switch" aria-checked={a.antiScreenshot !== false} aria-label="Forensic Viewer-ID Watermark" onClick={() => updateAccount({ antiScreenshot: a.antiScreenshot === false })} data-state={a.antiScreenshot !== false ? "checked" : "unchecked"} className="filter-toggle inline-flex shrink-0 items-center rounded-full bg-input"><span className="block rounded-full bg-card shadow transition-transform" /></button>
      </div>
      <ToggleRow a={a} k="incognito" label="Incognito Browse Mode 👑" sub="Invisible until you send a proposal" def={false} />
      {a.gender === "woman" && (
        <Card>
          <h2 className="text-xs font-extrabold text-primary">Who Can See My Unblurred Photos ({people.length})</h2>
          {people.length === 0 && <p className="text-[11px] text-muted-foreground">Nobody yet. Your photos are blurred for everyone.</p>}
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.photo} alt={p.name} className="aspect-square h-10 w-10 shrink-0 rounded-full object-cover object-top" />
              <div className="flex-1"><span className="block text-xs font-bold text-primary">{p.name}</span><span className="block text-[10px] text-muted-foreground">Approved viewer</span></div>
              <button type="button" onClick={() => { updateAccount({ approvedViewers: viewers.filter((v) => v !== p.id) }); toast(`Photos blurred again for ${p.name}`); }} className="rounded-full border border-accent-border bg-accent-light px-3 py-1.5 text-[10px] font-bold text-accent">Revoke Blur</button>
            </div>
          ))}
        </Card>
      )}
      {a.gender === "woman" && <PrimaryAction onClick={() => { updateAccount({ approvedViewers: [], privacyBlur: true }); toast("Photos re-blurred for everyone"); }}>Re-Blur Photos for Everyone Now</PrimaryAction>}
      {a.gender === "man" && <p className="text-[11px] text-muted-foreground">Photo blur is only offered on women's profiles. Men's photos are always shown clearly.</p>}
    </SettingsPage>
  );
}

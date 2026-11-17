import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PrimaryAction, SettingsPage, ToggleRow, useSettingsAccount } from "@/components/mawaddah/SettingsKit";
import { updateAccount } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings_/wali")({
  head: () => ({ meta: [
    { title: "Wali & Chaperone Rules — Mawaddah" },
    { name: "description", content: "Set how your guardian is kept informed and involved on Mawaddah." },
    { property: "og:title", content: "Wali & Chaperone Rules — Mawaddah" },
    { property: "og:description", content: "Set how your guardian is kept informed and involved on Mawaddah." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Wali,
});

function Wali() {
  const a = useSettingsAccount();
  if (!a) return null;
  const linked = !!a.guardianWhatsapp?.trim();
  const digest = a.waliDigest ?? "realtime";
  const test = () => {
    const n = (a.guardianWhatsapp ?? "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Assalamu alaikum ${a.guardianName || ""}, this is a test alert from Mawaddah. ${a.firstName} has linked you as their Wali.`);
    window.open(`https://wa.me/${n}?text=${msg}`, "_blank", "noopener");
  };
  return (
    <SettingsPage title="Wali & Chaperone Rules" badge={linked ? "Wali Linked" : undefined}>
      <Card tone="trust">
        <span className="text-[10px] font-bold uppercase tracking-wider text-trust">Linked Guardian (Wali)</span>
        {linked ? (
          <div><p className="text-sm font-extrabold text-primary">{a.guardianName || "Guardian"}</p><p className="text-[11px] text-muted-foreground">WhatsApp: {a.guardianWhatsapp}</p></div>
        ) : (
          <p className="text-[11px] text-muted-foreground">No guardian linked yet. Add one on your <Link to="/settings" className="font-bold text-accent underline">profile page</Link>.</p>
        )}
      </Card>
      <Card>
        <h2 className="text-xs font-extrabold text-primary">Wali Notification Frequency</h2>
        {([["realtime", "Real-Time Chat & Match Alerts"], ["weekly", "Weekly Digest Summary Only"]] as const).map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={digest === v} onClick={() => updateAccount({ waliDigest: v })} className={cn("flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left text-xs font-bold", digest === v ? "border-accent-border bg-accent-light text-accent" : "border-border text-primary")}>
            {l}<span>{digest === v ? "●" : "○"}</span>
          </button>
        ))}
      </Card>
      <ToggleRow a={a} k="waliUnblur" label="Require Wali to Unblur Photos" sub="Wali taps approve on WhatsApp first" />
      <ToggleRow a={a} k="waliVideo" label="Invite Wali to Video Calls" sub="Auto-sends 3-way video link to Wali" />
      {linked ? <PrimaryAction onClick={test}>Send Test WhatsApp Alert to Wali</PrimaryAction> : <PrimaryAction tone="soft" onClick={() => {}}>Link a Wali to send a test alert</PrimaryAction>}
    </SettingsPage>
  );
}

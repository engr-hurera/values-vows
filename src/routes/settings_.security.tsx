import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, PrimaryAction, SettingsPage, ToggleRow, useSettingsAccount } from "@/components/mawaddah/SettingsKit";
import { updateAccount } from "@/lib/session";

export const Route = createFileRoute("/settings_/security")({
  head: () => ({ meta: [
    { title: "Security & Contact Block — Mawaddah" },
    { name: "description", content: "Block phonebook contacts, lock the app and manage your sessions." },
    { property: "og:title", content: "Security & Contact Block — Mawaddah" },
    { property: "og:description", content: "Block phonebook contacts, lock the app and manage your sessions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Security,
});

function Security() {
  const a = useSettingsAccount();
  const [num, setNum] = useState("");
  if (!a) return null;
  const blocked = a.blockedNumbers ?? [];
  const add = () => {
    const v = num.trim();
    if (v.replace(/\D/g, "").length < 7) return toast("Enter a valid phone number");
    if (!blocked.includes(v)) updateAccount({ blockedNumbers: [...blocked, v] });
    setNum("");
  };
  return (
    <SettingsPage title="Security & Block List">
      <Card tone="accent">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-primary">🚫 Block Phonebook Contacts</h2><span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-accent">{blocked.length} Blocked</span></div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">Hide your profile from coworkers, relatives, or specific phone numbers before they ever see you.</p>
        <div className="flex gap-2">
          <input type="tel" value={num} onChange={(e) => setNum(e.target.value)} aria-label="Phone number to block" placeholder="+ Add Phone Number" className="min-w-0 flex-1 rounded-full border border-border bg-card px-3.5 py-2 text-xs text-primary" />
          <button type="button" onClick={add} className="rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground">Add</button>
        </div>
        {blocked.map((n) => (
          <div key={n} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-xs font-semibold text-primary">{n}<button type="button" onClick={() => updateAccount({ blockedNumbers: blocked.filter((b) => b !== n) })} className="text-[10px] font-bold text-accent">Unblock</button></div>
        ))}
      </Card>
      <ToggleRow a={a} k="biometric" label="FaceID / Biometric App Lock" sub="Require FaceID when opening Mawaddah" def={false} />
      <Link to="/security" className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div><span className="block text-xs font-bold text-primary">Govt ID &amp; Liveness Record</span><span className="block text-[11px] text-muted-foreground">Not verified · Optional</span></div>
        <span className="text-[10px] font-bold text-accent">Open</span>
      </Link>
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div><span className="block text-xs font-bold text-primary">Active Sessions (1 Device)</span><span className="block text-[11px] text-muted-foreground">This browser</span></div>
        <button type="button" onClick={() => toast("Other devices signed out")} className="text-[10px] font-bold text-destructive">Sign Out All</button>
      </div>
      <PrimaryAction onClick={() => toast("Security settings updated")}>Update Security Settings</PrimaryAction>
    </SettingsPage>
  );
}

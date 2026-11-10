import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ScanFace } from "lucide-react";
import { ReferenceShell } from "@/components/mawaddah/ReferenceShell";
import { Button } from "@/components/ui/button";
import { useAccount, useRequireAccount, type Account } from "@/lib/session";

export const Route = createFileRoute("/security")({
  head: () => ({meta: [
    {title: "Security & Verification — Mawaddah"},
    {name: "description", content: "Manage optional identity and liveness verification for your Mawaddah profile."},
    {property: "og:title", content: "Security & Verification — Mawaddah"},
    {property: "og:description", content: "Optional identity verification for sincere marriage connections."},
    {property: "og:type", content: "website"}, {name: "twitter:card", content: "summary"},
  ]}),
  component: Security,
});

function Security() {
  const ready = useRequireAccount(); const raw = useAccount();
  if (!ready || !raw) return null;
  const account: Account = JSON.parse(raw);
  return <ReferenceShell><div className="flex-1 bg-card px-4 py-3 flex flex-col justify-between">
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2"><Button variant="reference" size="reference" asChild className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Link to="/settings" aria-label="Back to Settings"><ChevronLeft className="w-3.5 h-3.5"/></Link></Button><h1 className="text-xs font-extrabold text-primary">Security &amp; Verification</h1></div>
      <div className="p-3 rounded-2xl bg-accent-light border border-accent-border space-y-2">
        <div className="flex items-center justify-between"><span className="text-[8.5px] font-extrabold text-primary flex items-center gap-1"><ScanFace className="w-3.5 h-3.5 text-accent"/>3D Selfie Liveness Check</span><span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[7px] font-bold">Not Verified</span></div>
        <div className="flex items-center gap-2.5">{account.photo ? <img src={account.photo} className="w-10 h-10 rounded-xl object-cover ring-2 ring-card" alt="Your photo"/> : <ScanFace className="w-10 h-10 text-accent"/>}<p className="text-[7.5px] text-muted-foreground leading-relaxed">Confirms you are a real person. Reviewed by human moderators—never shared publicly.</p></div>
      </div>
      <p className="text-[8px] text-muted-foreground leading-relaxed">Optional verification is not connected yet. No Verified Badge will be issued until a real identity check is completed.</p>
    </div>
    <Button variant="reference" size="reference" disabled className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px]">Verification unavailable</Button>
  </div></ReferenceShell>;
}
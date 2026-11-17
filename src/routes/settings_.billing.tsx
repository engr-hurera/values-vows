import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, SettingsPage, useSettingsAccount, pref, setPref } from "@/components/mawaddah/SettingsKit";
import { Switch } from "@/components/ui/switch";
import { resetOnboarding } from "@/lib/session";

export const Route = createFileRoute("/settings_/billing")({
  head: () => ({ meta: [
    { title: "Billing & Istikhara Pause — Mawaddah" },
    { name: "description", content: "Pause your profile for Istikhara, manage Barakah Gold and your account." },
    { property: "og:title", content: "Billing & Istikhara Pause — Mawaddah" },
    { property: "og:description", content: "Pause your profile for Istikhara, manage Barakah Gold and your account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Billing,
});

function Billing() {
  const navigate = useNavigate();
  const a = useSettingsAccount();
  if (!a) return null;
  const leave = (msg: string) => { resetOnboarding(); toast(msg); navigate({ to: "/", replace: true }); };
  return (
    <SettingsPage title="Billing & Account Status" badge="Account">
      <Card tone="accent">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-primary">🤲 Istikhara / Courtship Pause</h2><Switch className="filter-toggle" aria-label="Istikhara / Courtship Pause" checked={pref(a, "istikhara", false)} onCheckedChange={(v) => { setPref("istikhara", v); toast(v ? "Profile paused from discovery" : "Profile visible again"); }} /></div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">Talking seriously with 1 match? Pause your profile from public discovery while keeping your current chat active.</p>
      </Card>
      <Card>
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-primary">👑 Barakah Gold</h2><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Free plan</span></div>
        <p className="text-[11px] text-muted-foreground">No active subscription. Renewal reminders arrive 3 days before any charge, and you can pause or cancel in one tap.</p>
        <Link to="/gold" className="block rounded-full bg-primary py-3 text-center text-xs font-bold text-primary-foreground">See Barakah Gold plans</Link>
      </Card>
      <button type="button" onClick={() => leave("Alhamdulillah! May Allah bless your marriage.")} className="w-full rounded-full border border-trust/30 bg-trust-light py-3.5 text-sm font-bold text-trust">💍 Alhamdulillah, I Found My Spouse!</button>
      <AlertDialog>
        <AlertDialogTrigger asChild><button type="button" className="w-full rounded-full border border-destructive/30 py-3.5 text-sm font-bold text-destructive">Permanently Delete Account &amp; Data</button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription>Your profile, photos and chats are removed from this device. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => leave("Account deleted")}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-center text-[10px] text-muted-foreground">GDPR &amp; Sharia Privacy Compliant • Zero Data Selling</p>
    </SettingsPage>
  );
}

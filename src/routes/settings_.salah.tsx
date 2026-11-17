import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, PrimaryAction, SettingsPage, ToggleRow, useSettingsAccount, pref, setPref } from "@/components/mawaddah/SettingsKit";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings_/salah")({
  head: () => ({ meta: [
    { title: "Salah Quiet Hours & Alerts — Mawaddah" },
    { name: "description", content: "Auto-mute notifications during the five daily prayers and keep alerts discreet." },
    { property: "og:title", content: "Salah Quiet Hours & Alerts — Mawaddah" },
    { property: "og:description", content: "Auto-mute notifications during the five daily prayers and keep alerts discreet." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Salah,
});

function Salah() {
  const a = useSettingsAccount();
  if (!a) return null;
  return (
    <SettingsPage title="Notifications & Salah" badge={`🕌 ${a.city || "Local"} Adhan`}>
      <Card tone="accent">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-primary">🕌 Auto-Mute During 5x Salah</h2><Switch className="filter-toggle" aria-label="Auto-Mute During 5x Salah" checked={pref(a, "salahMute", true)} onCheckedChange={(v) => setPref("salahMute", v)} /></div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">Pauses notifications for 25 minutes during Fajr, Dhuhr, Asr, Maghrib, and Isha in {a.city || "your city"}.</p>
      </Card>
      <ToggleRow a={a} k="discreetLock" label="Discreet Lock Screen Preview" sub='Shows "New Update" instead of sender name' />
      <ToggleRow a={a} k="dailyBatch" label="Daily 15 Batch Ready Alert" sub="Notify at 7:00 PM after Maghrib" />
      <ToggleRow a={a} k="adabTimer" label="72-Hour Adab Timer Reminder" sub="Gentle nudge before a match expires" />
      <PrimaryAction onClick={() => toast("Notification preferences saved")}>Save Notification Preferences</PrimaryAction>
    </SettingsPage>
  );
}

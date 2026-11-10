import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { resetOnboarding, useAccount, useRequireAccount, type Account } from "@/lib/session";
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
    ["Location", `${a.city}, ${a.country}`],
    ["Date of Birth", a.dob],
    ["Sect", a.sect],
    ["Marriage Timeline", a.timeline],
    ["Guardian", a.guardianName ? `${a.guardianName} · ${a.guardianWhatsapp ?? ""}` : "Not added"],
    ["Email", a.email],
  ];
  if (a.gender === "woman") rows.push(["Modesty Blur", a.privacyBlur ? "On" : "Off"]);

  return (
    <PhoneShell>
      <main className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary ring-4 ring-accent-light">
            {a.photo && <img src={a.photo} alt="My photo" className={cn("h-full w-full object-cover", a.privacyBlur && "blur-md")} />}
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
        <button
          onClick={() => { resetOnboarding(); navigate({ to: "/", replace: true }); }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 py-4 text-sm font-bold text-destructive"
        >
          <LogOut className="h-4 w-4" />Log Out / Reset Onboarding
        </button>
      </main>
      <BottomNav active="settings" />
    </PhoneShell>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { isSignedIn } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mawaddah — Where sincere intentions meet tranquility" },
      { name: "description", content: "A halal matrimonial community for Muslims seeking Nikah with honesty and respect." },
      { property: "og:title", content: "Mawaddah — Halal Matrimonial Community" },
      { property: "og:description", content: "A halal matrimonial community for Muslims seeking Nikah with honesty and respect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [pledged, setPledged] = useState(false);
  useEffect(() => { if (isSignedIn()) navigate({ to: "/feed", replace: true }); }, [navigate]);

  return (
    <div className="min-h-screen bg-canvas sm:py-6">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-between overflow-hidden bg-primary px-6 py-8 text-center text-primary-foreground sm:min-h-[calc(100vh-3rem)] sm:rounded-[2.5rem] sm:shadow-card">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-primary-foreground/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full border border-primary-foreground/10" />
        <div>
          <span className="rounded-full bg-primary-foreground/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest">Halal Matrimonial Community</span>
        </div>
        <div className="relative z-10 my-auto space-y-6 py-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-3xl font-extrabold text-accent-foreground shadow-float">M</div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Mawaddah</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">Where sincere intentions meet tranquility</p>
          </div>
          <figure className="space-y-3 rounded-3xl border border-primary-foreground/10 bg-primary-foreground/10 p-5">
            <p dir="rtl" className="font-arabic text-xl leading-loose text-accent-border">
              وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
            </p>
            <p className="text-sm italic leading-relaxed text-primary-foreground/90">
              "And among His signs is that He created for you mates that you may find tranquility in them, and He placed between you love and mercy."
            </p>
            <figcaption className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Surah Ar-Rum • 30:21</figcaption>
          </figure>
          <button
            type="button"
            role="checkbox"
            aria-checked={pledged}
            onClick={() => setPledged(!pledged)}
            className="flex w-full items-start gap-3 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-left"
          >
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition", pledged ? "border-accent bg-accent" : "border-primary-foreground/40")}>
              {pledged && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="text-xs leading-relaxed text-primary-foreground/85">
              <strong>Sincere Niyyah Pledge:</strong> I join solely for lawful marriage (Nikah), with honesty and respect.
            </span>
          </button>
        </div>
        <div className="relative z-10 space-y-3">
          <button
            disabled={!pledged}
            onClick={() => navigate({ to: "/onboarding" })}
            className="w-full rounded-full bg-accent py-4 text-sm font-bold text-accent-foreground shadow-float transition disabled:opacity-40"
          >
            Continue with Bismillah
          </button>
          {!pledged && <p className="text-[11px] text-primary-foreground/60">Tick the Niyyah pledge to continue</p>}
          <Link to="/signin" className="block w-full rounded-full bg-primary-foreground/10 py-3.5 text-sm font-semibold">
            Sign In to Existing Account
          </Link>
        </div>
      </div>
    </div>
  );
}

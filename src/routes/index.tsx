import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, RotateCcw, Star, X } from "lucide-react";
import { useState } from "react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { FiltersDrawer } from "@/components/mawaddah/FiltersDrawer";
import { ProfilePhoto } from "@/components/mawaddah/ProfilePhoto";
import { actions, useDiscovery } from "@/lib/discovery-store";
import { applyFilters, badgesFor, PROFILES } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Partners — Mawaddah" },
      { name: "description", content: "Browse values-aligned Muslim marriage profiles with modesty-first privacy." },
      { property: "og:title", content: "Discover Partners — Mawaddah" },
      { property: "og:description", content: "Browse values-aligned Muslim marriage profiles with modesty-first privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { filters, dismissed, bookmarked } = useDiscovery();
  const [tab, setTab] = useState<"daily" | "search">("search");
  const [liked, setLiked] = useState<string | null>(null);
  const list = applyFilters(PROFILES, filters).filter((p) => !dismissed.includes(p.id));
  const p = list[0];

  return (
    <PhoneShell>
      <header className="space-y-3 px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-arabic text-lg leading-none text-accent">مودّة</p>
            <h1 className="text-lg font-extrabold">Discover Partners</h1>
          </div>
          <FiltersDrawer />
        </div>
        <div className="flex rounded-full bg-secondary p-1 text-xs font-bold">
          {(["daily", "search"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-full py-2 transition", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              {t === "daily" ? "Daily Curated (15)" : "Search Partners"}
            </button>
          ))}
        </div>
      </header>

      <main className="relative flex flex-1 flex-col px-5 pb-4">
        {p ? (
          <>
            <Link to="/profile/$id" params={{ id: p.id }} className="relative block min-h-[480px] flex-1 overflow-hidden rounded-[2rem] bg-primary shadow-card">
              <ProfilePhoto profile={p} />
              <div className="pointer-events-none absolute inset-0 bg-photo-fade" />
              <div className="absolute inset-x-4 top-4 flex items-center justify-between text-on-photo">
                <span className="glass-dark flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"><MapPin className="h-3 w-3" />{p.distanceKm} km away</span>
                <span className="glass-dark flex h-12 w-12 items-center justify-center rounded-full border border-on-photo/30 text-xs font-extrabold">{p.match}%</span>
              </div>
              <div className="pointer-events-none absolute inset-x-4 bottom-10 space-y-2 text-center text-on-photo">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {badgesFor(p).map((b) => (
                    <span key={b} className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">{b}</span>
                  ))}
                </div>
                <h2 className="text-2xl font-extrabold">{p.name}, {p.age}</h2>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80">{p.city} • {p.profession}</p>
              </div>
            </Link>
            <div className="relative z-10 -mt-8 flex items-center justify-center gap-5">
              <button aria-label="Pass" onClick={() => actions.dismiss(p.id)} className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-float transition hover:scale-105">
                <X className="h-6 w-6" />
              </button>
              <button aria-label="Bookmark" aria-pressed={bookmarked.includes(p.id)} onClick={() => actions.bookmark(p.id)} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition hover:scale-105">
                <Star className={cn("h-6 w-6", bookmarked.includes(p.id) && "fill-current text-accent")} />
              </button>
              <button aria-label="Connect" onClick={() => { setLiked(p.name); actions.dismiss(p.id); setTimeout(() => setLiked(null), 1800); }} className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-float transition hover:scale-105">
                <Heart className="h-6 w-6 fill-current" />
              </button>
            </div>
            {liked && <p className="mt-3 text-center text-xs font-bold text-trust">Connection request sent to {liked} 💌</p>}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[2rem] bg-secondary p-8 text-center">
            <p className="text-sm font-bold">No more profiles match right now</p>
            <p className="text-xs text-muted-foreground">Try loosening your filters or start over.</p>
            <button onClick={actions.resetDismissed} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"><RotateCcw className="h-3.5 w-3.5" />Start over</button>
          </div>
        )}
      </main>
      <BottomNav active="home" />
    </PhoneShell>
  );
}

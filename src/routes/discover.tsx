import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { FiltersDrawer } from "@/components/mawaddah/FiltersDrawer";
import { actions, useDiscovery } from "@/lib/discovery-store";
import { PROFILES, shouldBlur, type Filters } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover by Values — Mawaddah" },
      { name: "description", content: "Find candidates aligned on separate home, 5x daily Salah, and Quran & Tafsir." },
      { property: "og:title", content: "Discover by Values — Mawaddah" },
      { property: "og:description", content: "Find candidates aligned on separate home, 5x daily Salah, and Quran & Tafsir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

const VALUES: { key: NonNullable<Filters["value"]>; pre: string; label: string; icon: string; count: string }[] = [
  { key: "separateHome", pre: "Aligned on", label: "Separate Home", icon: "🏡", count: "1.8k candidates" },
  { key: "salah5x", pre: "Committed to", label: "5x Daily Salah", icon: "🕌", count: "3.4k candidates" },
  { key: "quranTafsir", pre: "Interested in", label: "Quran & Tafsir", icon: "📖", count: "920 candidates" },
];

function Discover() {
  const { filters } = useDiscovery();
  const navigate = useNavigate();
  return (
    <PhoneShell>
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <p className="text-xs font-bold text-muted-foreground">📍 Near you</p>
          <h1 className="text-xl font-extrabold">Discover by Values</h1>
        </div>
        <FiltersDrawer
          trigger={
            <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />Filters
            </button>
          }
        />
      </header>
      <main className="flex-1 space-y-1 px-5 py-2">
        {VALUES.map((v) => {
          const people = PROFILES.filter((p) => p[v.key]).slice(0, 3);
          const on = filters.value === v.key;
          return (
            <button
              key={v.key}
              onClick={() => { actions.setFilters({ ...filters, value: on ? null : v.key }); if (!on) navigate({ to: "/" }); }}
              className={cn("flex w-full items-center justify-between gap-3 rounded-2xl border-b border-border px-2 py-4 text-left transition hover:bg-secondary", on && "bg-accent-light")}
            >
              <div className="space-y-2">
                <span className="block text-sm font-bold">{v.pre} <span className="text-accent">{v.label}</span></span>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {people.map((p) => (
                      <img key={p.id} src={p.photo.replace("w=700", "w=80")} alt="" className={cn("h-7 w-7 rounded-full object-cover ring-2 ring-card", shouldBlur(p) && "blur-[3px]")} />
                    ))}
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-light text-[9px] font-extrabold text-accent ring-2 ring-card">+42</span>
                  </div>
                  <span className="ml-3 text-xs text-muted-foreground">{v.count}</span>
                </div>
              </div>
              <span className="flex items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary text-2xl">{v.icon}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </span>
            </button>
          );
        })}
        <div className="pt-4">
          <h2 className="mb-2 text-sm font-extrabold">Around me</h2>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-canvas p-4">
            <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full border border-card/70" />
            <span className="relative inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">📍 Connect with 18 practicing singles nearby</span>
            <p className="relative mt-6 text-xs font-bold">City-level privacy · exact location always hidden</p>
          </div>
        </div>
      </main>
      <BottomNav active="discover" />
    </PhoneShell>
  );
}

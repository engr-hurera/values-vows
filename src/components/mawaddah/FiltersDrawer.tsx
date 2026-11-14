import * as SliderPrimitive from "@radix-ui/react-slider";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CustomPicker, type PickerRequest } from "@/components/mawaddah/CustomPicker";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { candidatesFor, useChatSession } from "@/lib/chat-store";
import { actions, useDiscovery } from "@/lib/discovery-store";
import type { PickerType } from "@/lib/picker-options";
import { AGE_LIMITS, applyFilters, DISTANCE_MAX_KM, EMPTY_FILTERS, type Filters } from "@/lib/profiles";

type PickField = "currentCountry" | "bornCountry" | "ethnicity" | "sect" | "living" | "marital";
const PICKS: Record<PickField, { type: PickerType; title: string }> = {
  currentCountry: { type: "country", title: "Filter: Current Country" },
  bornCountry: { type: "country", title: "Filter: Born Country" },
  ethnicity: { type: "ethnicity", title: "Filter: Ethnicity" },
  sect: { type: "sect", title: "Filter: Sect & Practice" },
  living: { type: "living", title: "Living After Marriage" },
  marital: { type: "marital", title: "Filter: Marital History" },
};

/** Showcase Screen 10 row: muted label left, bold value + terracotta chevron right (scaled 276px -> 375px). */
function PickRow({ label, value, onClick, gold }: { label: string; value: string; onClick: () => void; gold?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center justify-between gap-3 px-4 py-[11px] text-left transition ${gold ? "hover:bg-card" : "hover:bg-secondary/60"}`}>
      <span className="shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 font-bold text-primary">
        <span className="truncate">{value || "Any"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-accent" />
      </span>
    </button>
  );
}

function RangeCard({ label, display, children }: { label: string; display: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-secondary p-[11px]">
      <div className="flex justify-between gap-1 text-[9.5px] font-bold">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{display}</span>
      </div>
      {children}
    </div>
  );
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number[]; min: number; max: number; step: number; onChange: (v: number[]) => void }) {
  return (
    <SliderPrimitive.Root aria-label={label} min={min} max={max} step={step} value={value} minStepsBetweenThumbs={1} onValueChange={onChange} className="relative flex h-5 w-full touch-none select-none items-center">
      <SliderPrimitive.Track className="relative h-[5px] w-full grow rounded-full bg-border">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      {value.map((_, i) => (
        <SliderPrimitive.Thumb key={i} aria-label={value.length > 1 ? (i === 0 ? "Minimum age" : "Maximum age") : label} className="block h-[19px] w-[19px] rounded-full border-[4px] border-accent bg-card shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      ))}
    </SliderPrimitive.Root>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-[11px]">
      <span className="font-semibold text-primary">{label}</span>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} className="filter-toggle shrink-0" />
    </div>
  );
}

export function FiltersDrawer({ trigger }: { trigger?: React.ReactNode }) {
  const { filters, dismissed } = useDiscovery();
  const session = useChatSession();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const [picker, setPicker] = useState<PickerRequest | null>(null);
  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  const pool = session ? candidatesFor(session.account.gender).filter((p) => !dismissed.includes(p.id) && !session.state.matches.includes(p.id)) : [];
  const count = applyFilters(pool, draft).length;
  const active = (["currentCountry", "bornCountry", "ethnicity", "sect", "living", "marital"] as const).filter((k) => filters[k]).length
    + (filters.waliOnly ? 1 : 0) + (filters.verifiedOnly ? 1 : 0)
    + (filters.maxDistanceKm < DISTANCE_MAX_KM ? 1 : 0)
    + (filters.ageRange[0] !== EMPTY_FILTERS.ageRange[0] || filters.ageRange[1] !== EMPTY_FILTERS.ageRange[1] ? 1 : 0);

  const pick = (field: PickField) => setPicker({ ...PICKS[field], value: draft[field], allowAny: true, onSelect: (v) => set({ [field]: v }) });

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters); }}>
      <SheetTrigger asChild>
        {trigger ?? (
          <button aria-label="Search filters" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
            <SlidersHorizontal className="h-4 w-4" />
            {active > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold text-accent-foreground">{active}</span>}
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" aria-describedby={undefined} className="mx-auto flex h-[min(812px,100svh)] w-full max-w-[375px] flex-col gap-0 overflow-hidden border-0 bg-primary-soft p-0 font-sans min-[421px]:rounded-t-[2.5rem] [&>button]:hidden">
        {/* Dimmed top backdrop: "Discover Feed · N matches" (tap to close) */}
        <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 shrink-0 items-center justify-between px-[22px] pb-1 text-[12px] font-semibold text-primary-foreground/60">
          <span>Discover Feed</span>
          <span>{count} {count === 1 ? "match" : "matches"}</span>
        </button>

        <div className="relative z-10 -mt-3.5 flex min-h-0 flex-1 flex-col justify-between gap-3 rounded-t-[2rem] bg-card px-[22px] pb-5 pt-4">
          <div className="min-h-0 space-y-3.5 overflow-y-auto">
            <div>
              <div className="mx-auto mb-2 h-[5px] w-11 rounded-full bg-border" />
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base font-extrabold text-primary">Filters</SheetTitle>
                <button type="button" onClick={() => setPicker({ type: "country", title: "Select Country (A–Z)", value: draft.currentCountry, allowAny: true, onSelect: (v) => set({ currentCountry: v }) })} className="text-[9.5px] font-bold text-accent hover:underline">A–Z Country Picker</button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="block px-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Basic Filters (Free)</span>
              <div className="divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-card text-[11px]">
                <PickRow label="Current country" value={draft.currentCountry} onClick={() => pick("currentCountry")} />
                <PickRow label="Born country" value={draft.bornCountry} onClick={() => pick("bornCountry")} />
                <PickRow label="Ethnicity" value={draft.ethnicity} onClick={() => pick("ethnicity")} />
                <PickRow label="Sect & prayer" value={draft.sect} onClick={() => pick("sect")} />
              </div>
              <div className="grid grid-cols-2 gap-[11px] pt-0.5">
                <RangeCard label="Distance" display={draft.maxDistanceKm >= DISTANCE_MAX_KM ? "Any distance" : `Within ${draft.maxDistanceKm} km`}>
                  <Range label="Distance" min={5} max={DISTANCE_MAX_KM} step={5} value={[draft.maxDistanceKm]} onChange={([v]) => set({ maxDistanceKm: v ?? DISTANCE_MAX_KM })} />
                </RangeCard>
                <RangeCard label="Age range" display={`${draft.ageRange[0]} – ${draft.ageRange[1]}`}>
                  <Range label="Age range" min={AGE_LIMITS[0]} max={AGE_LIMITS[1]} step={1} value={draft.ageRange} onChange={([a, b]) => set({ ageRange: [a ?? AGE_LIMITS[0], b ?? AGE_LIMITS[1]] })} />
                </RangeCard>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-accent">Barakah Gold Filters</span>
                <span className="rounded border border-accent-border bg-accent-light px-2 py-px text-[8px] font-bold text-accent">Subscription</span>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-[22px] border border-border bg-secondary/70 text-[11px]">
                <PickRow gold label="Living after marriage" value={draft.living} onClick={() => pick("living")} />
                <PickRow gold label="Marital history" value={draft.marital} onClick={() => pick("marital")} />
                <ToggleRow label="Wali-supervised profiles only" checked={draft.waliOnly} onChange={(v) => set({ waliOnly: v })} />
                <ToggleRow label="Verified Government ID only" checked={draft.verifiedOnly} onChange={(v) => set({ verifiedOnly: v })} />
              </div>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3.5 pt-1.5">
            <button type="button" onClick={() => setDraft({ ...EMPTY_FILTERS, value: draft.value })} className="rounded-full bg-secondary py-[11px] text-[11.5px] font-bold text-muted-foreground">Reset</button>
            <button type="button" onClick={() => { actions.setFilters(draft); setOpen(false); }} className="rounded-full bg-primary py-[11px] text-[11.5px] font-bold text-primary-foreground shadow-sm">Apply ({count})</button>
          </div>
        </div>
        <CustomPicker request={picker} onClose={() => setPicker(null)} />
      </SheetContent>
    </Sheet>
  );
}

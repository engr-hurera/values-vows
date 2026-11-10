import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES, TRIBES, EMPTY_FILTERS, type Filters } from "@/lib/profiles";
import { actions, useDiscovery } from "@/lib/discovery-store";
import { cn } from "@/lib/utils";

function Pill({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
        on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground hover:border-accent-border",
      )}
    >
      {children}
    </button>
  );
}

const toggle = (a: string[], v: string) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);

export function FiltersDrawer({ trigger }: { trigger?: React.ReactNode }) {
  const { filters } = useDiscovery();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const count = filters.languages.length + filters.tribes.length + (filters.willingToRelocate ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters); }}>
      <SheetTrigger asChild>
        {trigger ?? (
          <button aria-label="Search filters" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
            <SlidersHorizontal className="h-4 w-4" />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-extrabold text-accent-foreground">{count}</span>}
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto flex h-[88vh] max-w-md flex-col gap-0 overflow-hidden rounded-t-[2rem] border-0 bg-primary p-0 [&>button]:hidden">
        <div className="flex h-16 shrink-0 items-center justify-between px-5 text-primary-foreground/70">
          <span className="text-sm font-bold">Discover</span>
          <button onClick={() => setOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden rounded-t-[2rem] bg-card">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-4 pt-3">
            <div className="mx-auto h-1 w-10 rounded-full bg-border" />
            <SheetTitle className="text-center text-base font-extrabold text-foreground">Filters</SheetTitle>

            <section className="space-y-2.5">
              <h4 className="text-sm font-bold">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <Pill key={l} on={draft.languages.includes(l)} onClick={() => setDraft({ ...draft, languages: toggle(draft.languages, l) })}>{l}</Pill>
                ))}
              </div>
            </section>

            <section className="space-y-2.5">
              <h4 className="text-sm font-bold">Tribe / Ethnicity</h4>
              <div className="flex flex-wrap gap-2">
                {TRIBES.map((t) => (
                  <Pill key={t} on={draft.tribes.includes(t)} onClick={() => setDraft({ ...draft, tribes: toggle(draft.tribes, t) })}>{t}</Pill>
                ))}
              </div>
            </section>

            <label className="flex items-center justify-between rounded-2xl border border-border bg-secondary p-4">
              <span>
                <span className="block text-sm font-bold">✈️ Willing to Relocate</span>
                <span className="text-xs text-muted-foreground">Only show people open to moving</span>
              </span>
              <Switch checked={draft.willingToRelocate} onCheckedChange={(v) => setDraft({ ...draft, willingToRelocate: v })} className="data-[state=checked]:bg-accent" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
            <button onClick={() => setDraft({ ...EMPTY_FILTERS, value: draft.value })} className="rounded-full bg-secondary py-3 text-sm font-bold text-muted-foreground">Reset</button>
            <button onClick={() => { actions.setFilters(draft); setOpen(false); }} className="rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Apply Filters</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

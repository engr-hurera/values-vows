import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ANY, ANY_OPTION, PICKER_DATASETS, filterOptions, lettersFor, usesAlphabet, type PickerType } from "@/lib/picker-options";
import { cn } from "@/lib/utils";

export interface PickerRequest { type: PickerType; title: string; value: string; allowAny?: boolean; onSelect: (label: string) => void }

/**
 * Showcase "Custom Dropdown Picker": search + A–Z letter pills + radio rows + Cancel / Done.
 * Shared by Step 1 (Basic Details) and the Search Filters sheet. Rendered at phone scale on top of any screen.
 */
export function CustomPicker({ request, onClose }: { request: PickerRequest | null; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("ALL");
  const [picked, setPicked] = useState("");

  useEffect(() => {
    if (!request) return;
    setQuery(""); setLetter("ALL");
    setPicked(request.value || (request.allowAny ? ANY : ""));
  }, [request]);

  const base = request ? PICKER_DATASETS[request.type] : [];
  const items = useMemo(() => (request?.allowAny ? [ANY_OPTION, ...base] : base), [request, base]);
  const showAlpha = usesAlphabet(base.length);
  const options = filterOptions(items, query, showAlpha ? letter : "ALL");

  const done = () => {
    if (request && picked) request.onSelect(picked === ANY ? "" : picked);
    onClose();
  };

  return (
    <DialogPrimitive.Root open={!!request} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-overlay/70 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-[343px] -translate-x-1/2 -translate-y-1/2 space-y-3.5 rounded-3xl border border-border bg-card p-5 font-sans text-primary shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Custom Dropdown Picker</span>
              <DialogPrimitive.Title className="text-base font-extrabold text-primary">{request?.title}</DialogPrimitive.Title>
            </div>
            <button type="button" onClick={onClose} aria-label="Close picker" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search options"
              placeholder={showAlpha ? "Type to search or tap a letter below..." : "Type to search..."}
              className="w-full bg-transparent text-xs font-semibold text-primary placeholder:text-muted-foreground focus:outline-none"
            />
            <button type="button" onClick={() => setQuery("")} className="text-[10px] font-bold text-muted-foreground hover:text-primary">Clear</button>
          </div>

          {showAlpha && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Filter by first letter (A–Z):</span>
                <button type="button" onClick={() => setLetter("ALL")} className="font-bold text-accent hover:underline">Show All</button>
              </div>
              <div className="flex flex-wrap gap-1">
                <button type="button" aria-pressed={letter === "ALL"} onClick={() => setLetter("ALL")} className={cn("rounded-lg px-2 py-1 text-[10px] font-bold", letter === "ALL" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>All</button>
                {lettersFor(items).map((l) => (
                  <button key={l} type="button" aria-pressed={letter === l} onClick={() => setLetter(l)} className={cn("h-6 w-6 rounded-lg text-[10px] font-bold", letter === l ? "bg-accent text-accent-foreground" : "bg-secondary text-primary hover:bg-border")}>{l}</button>
                ))}
              </div>
            </div>
          )}

          <div role="radiogroup" aria-label={request?.title} className="max-h-60 divide-y divide-border overflow-y-auto rounded-2xl border border-border bg-card">
            {options.map((item) => {
              const on = item.label === picked;
              return (
                <button key={item.label} type="button" role="radio" aria-checked={on} onClick={() => setPicked(item.label)} className={cn("flex w-full items-center justify-between px-3.5 py-2.5 text-left transition hover:bg-secondary/60", on && "bg-accent-light/60")}>
                  <div>
                    <span className="block text-xs font-bold text-primary">{item.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{item.sub}</span>
                  </div>
                  {on
                    ? <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">✓</span>
                    : <span className="h-5 w-5 shrink-0 rounded-full border border-border" />}
                </button>
              );
            })}
            {options.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No matching options found.</div>}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-primary">Cancel</button>
            <button type="button" onClick={done} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">Done</button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

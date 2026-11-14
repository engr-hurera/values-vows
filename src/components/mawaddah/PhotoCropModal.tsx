import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clampPan, coverScale, rotate, type Pan, type Rotation } from "@/lib/photo-crop";
import { cn } from "@/lib/utils";

const FRAME_W = 260;
const OUT_W = 720;
const ASPECTS = { portrait: { label: "Portrait 4:5", ratio: 5 / 4 }, square: { label: "Square 1:1", ratio: 1 } } as const;
type Aspect = keyof typeof ASPECTS;

/** Opens before a device photo enters a slot: rotate 90°, zoom, drag to crop, then "Apply & Save Photo". */
export function PhotoCropModal({ src, onCancel, onApply }: { src: string | null; onCancel: () => void; onApply: (dataUrl: string) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [aspect, setAspect] = useState<Aspect>("portrait");
  const [failed, setFailed] = useState(false);
  const drag = useRef<{ x: number; y: number; pan: Pan } | null>(null);
  const frameH = Math.round(FRAME_W * ASPECTS[aspect].ratio);

  useEffect(() => {
    setImg(null); setRotation(0); setZoom(1); setPan({ x: 0, y: 0 }); setAspect("portrait"); setFailed(false);
    if (!src) return;
    const el = new Image();
    el.onload = () => setImg(el);
    el.onerror = () => setFailed(true);
    el.src = src;
  }, [src]);

  const fit = (p: Pan, r = rotation, z = zoom, h = frameH) => (img ? clampPan(p, img.naturalWidth, img.naturalHeight, FRAME_W, h, r, z) : p);
  useEffect(() => { setPan((p) => fit(p)); }, [rotation, zoom, frameH, img]); // eslint-disable-line react-hooks/exhaustive-deps

  const scale = img ? coverScale(img.naturalWidth, img.naturalHeight, FRAME_W, frameH, rotation) * zoom : 1;

  const apply = () => {
    if (!img) return;
    const outH = Math.round(OUT_W * ASPECTS[aspect].ratio);
    const k = OUT_W / FRAME_W;
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W; canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(OUT_W / 2 + pan.x * k, outH / 2 + pan.y * k);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * k, scale * k);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    onApply(canvas.toDataURL("image/jpeg", 0.86));
  };

  return (
    <DialogPrimitive.Root open={!!src} onOpenChange={(o) => !o && onCancel()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-overlay/70 backdrop-blur-[2px]" />
        <DialogPrimitive.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-[60] max-h-[calc(100svh-1rem)] w-[calc(100%-2rem)] max-w-[343px] -translate-x-1/2 -translate-y-1/2 space-y-3 overflow-y-auto rounded-3xl border border-border bg-card p-5 font-sans text-primary shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Photo Editor</span>
              <DialogPrimitive.Title className="text-base font-extrabold text-primary">Crop &amp; Rotate Photo</DialogPrimitive.Title>
            </div>
            <button type="button" onClick={onCancel} aria-label="Close photo editor" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary hover:opacity-80"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary p-1">
            {(Object.keys(ASPECTS) as Aspect[]).map((a) => (
              <button key={a} type="button" aria-pressed={aspect === a} onClick={() => setAspect(a)} className={cn("rounded-lg py-1.5 text-[11px] font-bold transition", aspect === a ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{ASPECTS[a].label}</button>
            ))}
          </div>

          <div
            className="relative mx-auto cursor-grab touch-none overflow-hidden rounded-2xl bg-overlay active:cursor-grabbing"
            style={{ width: FRAME_W, height: frameH }}
            aria-label="Drag to position your photo"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, pan }; }}
            onPointerMove={(e) => { const d = drag.current; if (d) setPan(fit({ x: d.pan.x + e.clientX - d.x, y: d.pan.y + e.clientY - d.y })); }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
          >
            {img && (
              <img
                src={img.src}
                alt="Photo being cropped"
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{ width: img.naturalWidth, height: img.naturalHeight, transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${scale})` }}
              />
            )}
            {!img && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs font-semibold text-on-photo/80">{failed ? "This photo couldn't be opened. Please choose another image." : "Loading photo…"}</p>}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => <span key={i} className="border border-on-photo/25" />)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-1">
            <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SliderPrimitive.Root aria-label="Zoom" min={1} max={3} step={0.01} value={[zoom]} onValueChange={([z]) => setZoom(z ?? 1)} className="relative flex h-5 w-full touch-none select-none items-center">
              <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-border"><SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" /></SliderPrimitive.Track>
              <SliderPrimitive.Thumb aria-label="Zoom" className="block h-4 w-4 rounded-full border-[3px] border-accent bg-card shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </SliderPrimitive.Root>
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRotation((r) => rotate(r, -1))} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary py-2 text-xs font-bold text-primary"><RotateCcw className="h-3.5 w-3.5" />Rotate left</button>
            <button type="button" onClick={() => setRotation((r) => rotate(r, 1))} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary py-2 text-xs font-bold text-primary"><RotateCw className="h-3.5 w-3.5" />Rotate right</button>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onCancel} className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-primary">Cancel</button>
            <button type="button" onClick={apply} disabled={!img} className="flex-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">Apply &amp; Save Photo</button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

export function ReferenceShell({ children, step, dark = false }: { children: ReactNode; step?: number; dark?: boolean }) {
  return <div className="reference-stage"><div className={`reference-phone ${dark ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>
    <div className="ios-statusbar"><span>9:41</span>{step ? <span className={`text-[8px] ${step === 1 ? "font-semibold text-muted-foreground" : step === 4 ? "font-bold text-primary" : "font-bold text-accent"}`}>Step {step} of 4</span> : <div className="flex items-center gap-1"><Signal className="h-2.5 w-2.5"/><Wifi className="h-2.5 w-2.5"/><BatteryFull className="h-2.5 w-3"/></div>}</div>
    {children}
  </div></div>;
}

/** Compact labelled input card used across the reference sign-up screens. */
export function RefField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block p-2.5 rounded-xl bg-secondary border border-border"><span className="text-[7px] font-semibold text-muted-foreground block">{label}</span>{children}</label>;
}

/** Google's official multicolor "G" (brand colors are fixed by Google's guidelines). */
export function GoogleMark() {
  return <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;
}

/** Light-theme Google button classes per Google's branding guidelines. */
export const googleButton = "w-full py-2.5 rounded-full bg-google text-google-foreground border border-google-border font-semibold text-[9.5px] flex items-center justify-center gap-2";

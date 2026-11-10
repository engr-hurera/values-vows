import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

export function ReferenceShell({ children, step, dark = false }: { children: ReactNode; step?: number; dark?: boolean }) {
  return <div className="reference-stage"><div className={`reference-phone ${dark ? "bg-primary text-primary-foreground" : "bg-card text-primary"}`}>
    <div className="ios-statusbar"><span>9:41</span>{step ? <span className={`text-[8px] font-bold ${step === 4 ? "text-trust" : "text-accent"}`}>Step {step} of 4</span> : <div className="flex items-center gap-1"><Signal className="h-2.5 w-2.5"/><Wifi className="h-2.5 w-2.5"/><BatteryFull className="h-2.5 w-3"/></div>}</div>
    {children}
  </div></div>;
}
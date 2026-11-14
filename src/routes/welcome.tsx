import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Heart, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleMark, googleButton, RefField, ReferenceShell } from "@/components/mawaddah/ReferenceShell";
import { getProfile } from "@/lib/profiles";
import { savePendingAuth, validateSignup, type AuthMethod } from "@/lib/session";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Meet marriage-minded Muslims around you — Mawaddah" },
      { name: "description", content: "Create your Mawaddah account and meet Muslims near you who share your intention for Nikah." },
      { property: "og:title", content: "Meet marriage-minded Muslims around you — Mawaddah" },
      { property: "og:description", content: "Create your Mawaddah account and meet Muslims near you who share your intention for Nikah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Radar,
});

/** Portrait nodes use only sample members without modesty blur, so the woman-only blur rule is never bypassed. */
const NODES = [
  { id: "maryam", pos: "top-1 left-1/2 -translate-x-1/2", size: "w-9 h-9" },
  { id: "omar", pos: "top-[3.75rem] right-0", size: "w-8 h-8" },
  { id: "khadija", pos: "bottom-4 right-7", size: "w-8 h-8" },
  { id: "hamza", pos: "bottom-8 left-1", size: "w-9 h-9" },
  { id: "fatima", pos: "top-[4.25rem] left-5", size: "w-7 h-7" },
  { id: "yusuf", pos: "bottom-0 left-1/2 -translate-x-1/2", size: "w-7 h-7" },
] as const;

const SHEET: Record<AuthMethod, { title: string; note: string }> = {
  phone: { title: "Continue with Phone", note: "Text-message codes aren't connected yet. You'll sign in later with this number and password." },
  google: { title: "Continue with Google", note: "Google sign-in isn't connected yet. Enter your Google email and choose a Mawaddah password." },
  email: { title: "Sign Up with Email", note: "You'll use this email and password to sign in next time." },
};

function Radar() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<AuthMethod | null>(null);
  const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const open = (m: AuthMethod) => { setMethod(m); setError(""); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return;
    const auth = { method, email, phone, password };
    const problem = validateSignup(auth);
    if (problem) { setError(problem); return; }
    savePendingAuth(auth);
    navigate({ to: "/onboarding" });
  };

  return <ReferenceShell>
    <div className="flex-1 bg-card px-5 pt-2 pb-4 flex flex-col justify-between text-center gap-3">
      <div className="flex items-center justify-between">
        <Button variant="reference" size="reference" asChild className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Link to="/" aria-label="Back"><ChevronLeft className="w-3.5 h-3.5"/></Link></Button>
        <span className="px-2.5 py-1 rounded-full bg-accent-light border border-accent-border text-accent text-[7px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"/>Nearby • 25 km</span>
        <span className="w-6"/>
      </div>

      <div className="relative mx-auto w-56 h-56 shrink-0" aria-hidden>
        <div className="absolute inset-0 rounded-full border border-dashed border-accent-border"/>
        <div className="absolute inset-6 rounded-full border border-accent-border bg-accent-light/30"/>
        <div className="absolute inset-12 rounded-full border border-accent-border bg-accent-light/60"/>
        <div className="absolute inset-[4.5rem] rounded-full bg-accent-light border border-accent-border"/>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="absolute w-14 h-14 rounded-full bg-accent/20 animate-ping"/>
          <span className="relative w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-md">M</span>
        </div>
        {NODES.map(n => { const p = getProfile(n.id); return p && <img key={n.id} src={p.photo.replace("w=700", "w=120")} alt="" className={`absolute ${n.pos} ${n.size} rounded-full object-cover border-2 border-card shadow-float`}/>; })}
        <span className="absolute top-9 right-10 w-5 h-5 rounded-full bg-accent text-accent-foreground border-2 border-card flex items-center justify-center"><Heart className="w-2.5 h-2.5 fill-current"/></span>
      </div>

      <div className="space-y-1">
        <h1 className="text-base font-extrabold leading-tight text-primary">Meet marriage-minded Muslims around you</h1>
        <p className="text-[8.5px] leading-relaxed text-muted-foreground">Men and women nearby who share your intention for Nikah, matched on values, with your Wali beside you.</p>
      </div>

      <div className="space-y-2">
        <Button variant="reference" size="reference" onClick={() => open("phone")} className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px] flex items-center justify-center gap-1.5"><Phone className="w-3 h-3"/>Continue with Phone OTP</Button>
        <Button variant="reference" size="reference" onClick={() => open("google")} className={googleButton}><GoogleMark/>Continue with Google</Button>
        <Button variant="reference" size="reference" onClick={() => open("email")} className="w-full py-2 rounded-full bg-accent-light text-accent font-bold text-[9px]">Sign Up with Email</Button>
        <p className="text-[8px] text-muted-foreground">Already a member? <Link to="/signin" className="font-bold text-accent">Sign In</Link></p>
      </div>
    </div>

    {method && <div className="absolute inset-0 z-30 bg-overlay/50 flex items-end" onClick={() => setMethod(null)}>
      <form role="dialog" aria-modal="true" aria-label={SHEET[method].title} onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full bg-card rounded-t-3xl px-4 pt-3 pb-5 space-y-2.5 text-left">
        <div className="flex items-center justify-between"><h2 className="text-xs font-extrabold text-primary flex items-center gap-1.5">{method === "google" && <GoogleMark/>}{SHEET[method].title}</h2><Button variant="reference" size="reference" type="button" onClick={() => setMethod(null)} aria-label="Close" className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><X className="w-3 h-3"/></Button></div>
        <p className="text-[7px] leading-relaxed text-muted-foreground">{SHEET[method].note}</p>
        {method === "phone"
          ? <RefField label="Phone Number"><input type="tel" autoFocus className="text-[9px] font-bold mt-1" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="+234 800 000 0000"/></RefField>
          : <RefField label={method === "google" ? "Google Email" : "Email"}><input type="email" autoFocus className="text-[9px] font-bold mt-1" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/></RefField>}
        <RefField label="Create Password"><input type="password" className="text-[9px] font-bold mt-1" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" placeholder="6+ characters"/></RefField>
        {error && <p role="alert" className="text-[8px] font-semibold text-destructive">{error}</p>}
        <Button variant="reference" size="reference" type="submit" className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px]">Continue to Step 1</Button>
      </form>
    </div>}
  </ReferenceShell>;
}

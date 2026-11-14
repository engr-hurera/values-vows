import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleMark, googleButton, RefField, ReferenceShell } from "@/components/mawaddah/ReferenceShell";
import { signIn } from "@/lib/session";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Mawaddah" },
      { name: "description", content: "Sign in to your Mawaddah account and return to your Discover feed." },
      { property: "og:title", content: "Sign in — Mawaddah" },
      { property: "og:description", content: "Sign in to your Mawaddah account and return to your Discover feed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signIn(email, password)) navigate({ to: "/feed", replace: true });
    else setError("Email/phone or password doesn't match an account on this device.");
  };
  return <ReferenceShell>
    <form onSubmit={submit} className="flex-1 bg-card px-4 py-3 flex flex-col justify-between gap-4">
      <div className="space-y-4">
        <Button variant="reference" size="reference" asChild className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><Link to="/" aria-label="Back"><ChevronLeft className="w-3.5 h-3.5"/></Link></Button>
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground mx-auto flex items-center justify-center font-extrabold text-base shadow-md">M</div>
          <p className="font-arabic text-sm text-accent">مودّة</p>
          <h1 className="text-sm font-extrabold text-primary">Welcome back</h1>
          <p className="text-[7.5px] text-muted-foreground">Sign in to continue to your Discover feed.</p>
        </div>
        <div className="p-3 rounded-2xl bg-card border border-border shadow-card space-y-2">
          <RefField label="Email or Phone"><input required className="text-[9px] font-bold mt-1" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username"/></RefField>
          <RefField label="Password"><input type="password" required className="text-[9px] font-bold mt-1" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/></RefField>
          {error && <p role="alert" className="text-[8px] font-bold text-destructive">{error}</p>}
          <Button variant="reference" size="reference" type="submit" className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px]">Sign In</Button>
          <div className="flex items-center gap-2 text-[7px] font-bold uppercase text-muted-foreground"><span className="h-px flex-1 bg-border"/>or<span className="h-px flex-1 bg-border"/></div>
          <Button variant="reference" size="reference" type="button" onClick={() => setError("Google sign-in isn't connected yet. Please use the email and password you chose.")} className={googleButton}><GoogleMark/>Continue with Google</Button>
        </div>
      </div>
      <p className="text-center text-[8px] text-muted-foreground">New here? <Link to="/welcome" className="font-bold text-accent">Create an account</Link></p>
    </form>
  </ReferenceShell>;
}

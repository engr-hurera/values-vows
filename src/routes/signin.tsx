import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/mawaddah/BottomNav";
import { signIn } from "@/lib/session";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Mawaddah" },
      { name: "description", content: "Sign in to your Mawaddah account." },
      { property: "og:title", content: "Sign in — Mawaddah" },
      { property: "og:description", content: "Sign in to your Mawaddah account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

const inputCls = "w-full rounded-2xl border border-border bg-secondary px-4 py-3.5 text-sm outline-none focus:border-accent";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <PhoneShell>
      <form
        className="flex flex-1 flex-col gap-5 px-6 py-6"
        onSubmit={(e) => { e.preventDefault(); if (signIn(email, password)) navigate({ to: "/feed", replace: true }); else setError("Email or password doesn't match an account on this device."); }}
      >
        <Link to="/" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <p className="font-arabic text-lg text-accent">مودّة</p>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
        </div>
        <input type="email" required placeholder="Email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-xs font-bold text-destructive">{error}</p>}
        <button className="mt-auto w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground">Sign In</button>
        <Link to="/onboarding" className="text-center text-sm font-semibold text-muted-foreground">New here? Create an account</Link>
      </form>
    </PhoneShell>
  );
}

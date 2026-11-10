import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Lock } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/mawaddah/BottomNav";
import { Switch } from "@/components/ui/switch";
import { defaultBlurFor, register, type Gender } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Create your profile — Mawaddah" },
      { name: "description", content: "Four short steps to join Mawaddah with sincerity and privacy." },
      { property: "og:title", content: "Create your profile — Mawaddah" },
      { property: "og:description", content: "Four short steps to join Mawaddah with sincerity and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const SECTS = ["Sunni", "Shia", "Just Muslim", "Prefer not to say"];
const TIMELINES = ["Within 6 Months", "6–12 Months", "1–2 Years", "Not sure yet"];
const TITLES = ["Introduce yourself", "Add a guardian (Wali)", "Your photo", "Deen & account"];

const inputCls = "w-full rounded-2xl border border-border bg-secondary px-4 py-3.5 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold text-muted-foreground">{label}</span>{children}</label>;
}
function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition", on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary")}>
      {children}
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [firstName, setFirstName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianWhatsapp, setGuardianWhatsapp] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [blur, setBlur] = useState(true);
  const [sect, setSect] = useState("");
  const [timeline, setTimeline] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const pickGender = (g: Gender) => { setGender(g); setBlur(defaultBlurFor(g)); };

  const valid = [
    !!gender && firstName.trim() && dob && city.trim() && country.trim(),
    true,
    !!photo,
    sect && timeline && /^\S+@\S+\.\S+$/.test(email) && password.length >= 6,
  ][step];

  const next = () => {
    setError("");
    if (!valid) { setError(["Please fill in every field.", "", "Please upload a photo from your device.", "Choose sect & timeline, a valid email and a password of 6+ characters."][step] ?? ""); return; }
    if (step < 3) return setStep(step + 1);
    register({ gender: gender!, firstName: firstName.trim(), dob, city: city.trim(), country: country.trim(), guardianName: guardianName || undefined, guardianWhatsapp: guardianWhatsapp || undefined, photo, privacyBlur: gender === "woman" && blur, sect, timeline, email: email.trim(), password });
    navigate({ to: "/feed", replace: true });
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(String(r.result));
    r.readAsDataURL(f);
  };

  return (
    <PhoneShell>
      <header className="space-y-4 px-6 pb-2 pt-6">
        <div className="flex items-center justify-between">
          <button aria-label="Back" onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><ArrowLeft className="h-4 w-4" /></button>
          <span className="text-xs font-bold text-accent">Step {step + 1} of 4</span>
        </div>
        <div className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-accent" : "bg-border")} />)}</div>
        <h1 className="text-2xl font-extrabold">{TITLES[step]}</h1>
      </header>

      <main className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
        {step === 0 && (
          <>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">I am a</span>
              <div className="grid grid-cols-2 gap-3">
                {(["man", "woman"] as const).map((g) => (
                  <button key={g} type="button" aria-pressed={gender === g} onClick={() => pickGender(g)} className={cn("rounded-2xl border py-4 text-sm font-bold transition", gender === g ? "border-accent bg-accent-light text-accent" : "border-border bg-secondary")}>
                    {g === "man" ? "Man" : "Woman"}
                  </button>
                ))}
              </div>
            </div>
            <Field label="First Name"><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Amina" /></Field>
            <Field label="Date of Birth"><input type="date" className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kano" /></Field>
              <Field label="Country"><input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Nigeria" /></Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="rounded-2xl border border-accent-border bg-accent-light p-4 text-xs leading-relaxed">🛡️ Optional: a guardian can be kept informed of your conversations for added barakah and safety.</p>
            <Field label="Guardian Name"><input className={inputCls} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="e.g. Ibrahim Bello" /></Field>
            <Field label="WhatsApp Number"><input type="tel" className={inputCls} value={guardianWhatsapp} onChange={(e) => setGuardianWhatsapp(e.target.value)} placeholder="+234 800 000 0000" /></Field>
          </>
        )}

        {step === 2 && (
          <>
            <label className="relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] border-2 border-dashed border-accent-border bg-accent-light text-accent">
              {photo ? (
                <>
                  <img src={photo} alt="Your upload" className={cn("absolute inset-0 h-full w-full object-cover transition", gender === "woman" && blur && "scale-110 blur-2xl")} />
                  {gender === "woman" && blur && <span className="relative flex items-center gap-2 rounded-full bg-card/85 px-4 py-2 text-xs font-bold text-primary"><Lock className="h-3.5 w-3.5" />Blurred for others</span>}
                </>
              ) : (
                <><Camera className="h-8 w-8" /><span className="text-sm font-bold">Upload from your device</span><span className="text-xs text-muted-foreground">JPG or PNG</span></>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {photo && <p className="text-center text-xs text-muted-foreground">Tap the photo to change it</p>}
            {gender === "woman" && (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary p-4">
                <span>
                  <span className="block text-sm font-bold">🔒 Modesty Blur</span>
                  <span className="text-xs text-muted-foreground">Others must request to see your photo</span>
                </span>
                <Switch aria-label="Modesty blur" checked={blur} onCheckedChange={setBlur} className="data-[state=checked]:bg-accent" />
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2"><span className="text-xs font-bold text-muted-foreground">Sect</span><div className="flex flex-wrap gap-2">{SECTS.map((s) => <Pill key={s} on={sect === s} onClick={() => setSect(s)}>{s}</Pill>)}</div></div>
            <div className="space-y-2"><span className="text-xs font-bold text-muted-foreground">Marriage Timeline</span><div className="flex flex-wrap gap-2">{TIMELINES.map((t) => <Pill key={t} on={timeline === t} onClick={() => setTimeline(t)}>{t}</Pill>)}</div></div>
            <Field label="Email"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Password"><input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></Field>
          </>
        )}
        {error && <p className="text-xs font-bold text-destructive">{error}</p>}
      </main>

      <footer className="space-y-2 px-6 pb-6 pt-2">
        <button onClick={next} className="w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground">{step === 3 ? "Create Account" : "Continue"}</button>
        {step === 1 && <button onClick={() => { setGuardianName(""); setGuardianWhatsapp(""); setStep(2); }} className="w-full py-2 text-sm font-semibold text-muted-foreground">Skip for now</button>}
      </footer>
    </PhoneShell>
  );
}

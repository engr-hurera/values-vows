import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Camera, Image as ImageIcon, Mic, Square, User, UserCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PhoneShell } from "@/components/mawaddah/BottomNav";
import { ReferenceShell } from "@/components/mawaddah/ReferenceShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { canAdvance } from "@/lib/onboarding";
import { defaultBlurFor, guardianUpdatesDefault, register, type Gender } from "@/lib/session";
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

const SECTS = ["Sunni • Hanafi", "Shia", "Just Muslim", "Prefer not to say"];
const TIMELINES = ["3–6 Mos", "6–12 Mos", "1–2 Yrs"];
function Field({label, children}: {label: string; children: ReactNode}) {
  return <label className="block p-2.5 rounded-xl bg-secondary border border-border"><span className="text-[7px] font-semibold text-muted-foreground block">{label}</span>{children}</label>;
}
function Pill({on, onClick, children}: {on: boolean; onClick: () => void; children: ReactNode}) {
  return <Button variant="reference" size="reference" type="button" aria-pressed={on} onClick={onClick} className={cn("px-2.5 py-1 rounded-full text-[7.5px] font-bold border", on ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-primary")}>{children}</Button>;
}
function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [firstName, setFirstName] = useState(""); const [dob, setDob] = useState("");
  const [city, setCity] = useState(""); const [country, setCountry] = useState("");
  const [guardianName, setGuardianName] = useState(""); const [guardianWhatsapp, setGuardianWhatsapp] = useState("");
  const [guardianUpdates, setGuardianUpdates] = useState(false);
  const [photos, setPhotos] = useState<string[]>(Array(6).fill("")); const [blur, setBlur] = useState(true);
  const [sect, setSect] = useState(""); const [timeline, setTimeline] = useState("");
  const [practice, setPractice] = useState<string[]>([]); const [living, setLiving] = useState("Separate Home");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  const [voice, setVoice] = useState(""); const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); recorder.current?.stream.getTracks().forEach(t => t.stop()); }, []);
  const back = () => {setError(""); if(step === 0) navigate({to: "/"}); else setStep(step - 1);};
  const next = () => {
    if (!canAdvance(step, {gender, firstName, dob, city, country, photos, sect, timeline, email, password})) {setError(step === 2 ? "Please upload at least one photo from your device." : step === 3 ? "Choose a sect and timeline, enter a valid email and a password of 6+ characters." : "Please fill in every field."); return;}
    setError(""); if(step < 3) {setStep(step + 1);return;}
    if (!gender) return;
    register({gender, firstName: firstName.trim(), dob, city, country, guardianName, guardianWhatsapp, guardianUpdates: !!guardianWhatsapp.trim() && guardianUpdates, photo: photos.find(Boolean), photos: photos.filter(Boolean), privacyBlur: gender === "woman" && blur, sect, timeline, practice, living, voiceIntro: voice || undefined, email: email.trim(), password});
    navigate({to: "/feed", replace: true});
  };
  const upload = (slot: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {setError("Please choose an image.");return;}
    const reader = new FileReader(); reader.onload = () => { const value = String(reader.result); setPhotos(old => old.map((p,i) => i === slot ? value : p)); setError(""); }; reader.readAsDataURL(file);
  };
  const record = async () => {
    if(recording) {recorder.current?.stop(); return;}
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const r = new MediaRecorder(stream); recorder.current = r; const chunks: Blob[] = [];
      r.ondataavailable = e => chunks.push(e.data);
      r.onstop = () => {if(timer.current) clearTimeout(timer.current); stream.getTracks().forEach(t => t.stop()); setRecording(false); const f = new FileReader(); f.onload = () => setVoice(String(f.result)); f.readAsDataURL(new Blob(chunks, {type: r.mimeType}));};
      r.start(); setRecording(true); timer.current = setTimeout(() => {if(r.state === "recording") r.stop();}, 30000);
    } catch {setError("Microphone access is unavailable. You can finish without a voice intro.");}
  };
  const submit = <Button variant="reference" size="reference" onClick={next} className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px]">{step === 3 ? "Finish Setup & Start Discovering" : step === 0 ? "Next: Wali & Chaperone Setup" : "Next"}</Button>;
  // The Wali page intentionally retains the existing larger clean layout.
  if (step === 1) return <PhoneShell>
    <header className="space-y-4 px-6 pb-2 pt-6"><div className="flex items-center justify-between"><Button variant="reference" size="reference" aria-label="Back" onClick={back} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><ChevronLeft className="h-4 w-4"/></Button><span className="text-xs font-bold text-accent">Step 2 of 4</span></div><div className="flex gap-1.5">{[0,1,2,3].map(i => <span key={i} className={cn("h-1.5 flex-1 rounded-full",i <= 1 ? "bg-accent":"bg-border")}/>)}</div><h1 className="text-2xl font-extrabold">Add a guardian (Wali)</h1></header>
    <main className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
      <p className="rounded-2xl border border-accent-border bg-accent-light p-4 text-xs leading-relaxed">🛡️ Optional: a guardian can be kept informed of your conversations for added barakah and safety.</p>
      <label className="block space-y-1.5"><span className="text-xs font-bold text-muted-foreground">Guardian Name</span><input className="w-full rounded-2xl border border-border bg-secondary px-4 py-3.5 text-sm outline-none" value={guardianName} onChange={e=>setGuardianName(e.target.value)} placeholder="e.g. Ibrahim Bello"/></label>
      <label className="block space-y-1.5"><span className="text-xs font-bold text-muted-foreground">WhatsApp Number</span><input type="tel" className="w-full rounded-2xl border border-border bg-secondary px-4 py-3.5 text-sm outline-none" value={guardianWhatsapp} onChange={e=>{const v=e.target.value;if(!guardianWhatsapp.trim() || !v.trim())setGuardianUpdates(guardianUpdatesDefault(v));setGuardianWhatsapp(v);}} placeholder="+234 800 000 0000"/></label>
      <div><div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold">Send chat messages &amp; updates to Guardian on WhatsApp</span><Switch aria-label="Send chat messages & updates to Guardian on WhatsApp" checked={guardianUpdates} disabled={!guardianWhatsapp.trim()} onCheckedChange={setGuardianUpdates}/></div><p className="mt-2 text-[11px] text-muted-foreground">You can change or update this anytime later in Settings.</p></div>
    </main><footer className="space-y-2 px-6 pb-6 pt-2"><Button variant="reference" size="reference" onClick={next} className="w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground">Continue</Button><Button variant="reference" size="reference" onClick={()=>{setGuardianName("");setGuardianWhatsapp("");setGuardianUpdates(false);setStep(2);}} className="w-full py-2 text-sm font-semibold text-muted-foreground">Skip for now</Button></footer>
  </PhoneShell>;
  return <ReferenceShell step={step+1}><div className="flex-1 bg-card px-4 py-3 flex flex-col justify-between gap-4">
    <div className={step === 3 ? "space-y-2.5" : "space-y-3"}>
      {step !== 3 && <div className={cn("flex items-center gap-2",step === 2 && "justify-between")}><Button variant="reference" size="reference" onClick={back} aria-label="Back" className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><ChevronLeft className="w-3.5 h-3.5"/></Button><h1 className="text-xs font-extrabold text-primary">{step === 0 ? "Your Introduction" : "Upload your photos"}</h1>{step === 2 && <span className="w-6"/>}</div>}
      {step === 0 && <>
        <div><label className="text-[7.5px] font-bold text-muted-foreground uppercase block mb-1">I am a</label><div className="grid grid-cols-2 gap-2">{(["man","woman"] as const).map(g=><Button key={g} variant="reference" size="reference" aria-pressed={gender===g} onClick={()=>{setGender(g);setBlur(defaultBlurFor(g));}} className={cn("py-2 px-2.5 rounded-xl text-[8.5px] font-bold flex items-center justify-center gap-1.5 border",gender===g ? "bg-primary text-primary-foreground border-primary":"bg-secondary text-primary border-border")}>{g === "man" ? <UserCheck className="w-3 h-3"/> : <User className="w-3 h-3"/>}{g === "man" ? "Man":"Woman"}</Button>)}</div></div>
        <div className="space-y-2"><Field label="First Name"><input className="text-[9px] font-bold" value={firstName} onChange={e=>setFirstName(e.target.value)}/></Field><div className="grid grid-cols-2 gap-2"><Field label="Date of Birth"><input type="date" className="text-[8.5px] font-bold" value={dob} onChange={e=>setDob(e.target.value)}/></Field><div className="space-y-2"><Field label="City"><input className="text-[8.5px] font-bold" value={city} onChange={e=>setCity(e.target.value)}/></Field><Field label="Country"><input className="text-[8.5px] font-bold" value={country} onChange={e=>setCountry(e.target.value)}/></Field></div></div></div>
      </>}
      {step === 2 && <>
        <div className="grid grid-cols-3 grid-rows-3 gap-2 h-52">{photos.map((photo,i)=><label key={i} className={cn("relative cursor-pointer rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1", i===0 ? "col-span-2 row-span-2 border border-border bg-secondary" : "border border-dashed border-accent-border bg-accent-light/40")}>
          {photo && <img src={photo} alt={`Photo ${i+1}`} className={cn("absolute inset-0 w-full h-full object-cover",gender === "woman" && blur && "blur-2xl scale-110")}/>}
          {i===0 ? <span className="relative px-2.5 py-1 rounded-full bg-overlay/65 text-on-photo text-[7px] font-bold flex items-center gap-1"><Camera className="w-2.5 h-2.5"/>{photo ? "Change Photo":"Upload Photo"}</span> : <><span className="relative w-5 h-5 rounded-full bg-card flex items-center justify-center text-accent"><ImageIcon className="w-3 h-3"/></span><span className="relative px-2 py-0.5 rounded-full bg-accent text-primary-foreground text-[6.5px] font-bold">{photo ? "Change":"+ Add"}</span></>}
          <input type="file" accept="image/*" aria-label={`Upload photo ${i+1}`} className="sr-only" onChange={e=>upload(i,e.target.files?.[0])}/>
        </label>)}</div>
        {gender === "woman" && <div className="p-2.5 rounded-2xl bg-secondary border border-border space-y-2"><div className="flex items-center justify-between"><div><span className="text-[8px] font-bold text-primary block">Modesty Blur Shield</span><span className="text-[6.5px] text-muted-foreground">Keep photos blurred until you approve</span></div><Switch className="reference-toggle" aria-label="Modesty Blur Shield" checked={blur} onCheckedChange={setBlur}/></div></div>}
      </>}
      {step === 3 && <>
        <div className="text-center space-y-0.5"><span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-[7px] font-bold">100% Match Alignment</span><h1 className="text-xs font-extrabold text-primary">Set Your Marriage Dealbreakers</h1><p className="text-[7.5px] text-muted-foreground">Save months of small talk by aligning on essentials first.</p></div>
        <div className="space-y-1"><label className="text-[7px] font-bold uppercase text-muted-foreground block">Daily Salah &amp; Practice</label><div className="flex flex-wrap gap-1.5">{["🕌 5x Daily Salah","🌿 Strictly Halal"].map(p=><Pill key={p} on={practice.includes(p)} onClick={()=>setPractice(old=>old.includes(p)?old.filter(x=>x!==p):[...old,p])}>{p}</Pill>)}</div><div className="flex flex-wrap gap-1.5">{SECTS.map(s=><Pill key={s} on={sect===s} onClick={()=>setSect(s)}>{s}</Pill>)}</div></div>
        <div className="space-y-1"><label className="text-[7px] font-bold uppercase text-accent block">Post-Nikah Living Arrangement</label><div className="grid grid-cols-2 gap-1.5">{["Separate Home","Joint / Near Family"].map(l=><Button key={l} variant="reference" size="reference" aria-pressed={living===l} onClick={()=>setLiving(l)} className={cn("p-2 rounded-xl border text-[8px] font-bold text-center whitespace-normal",living===l?"bg-accent-light border-accent-border text-accent":"bg-secondary border-border text-muted-foreground")}>{l === "Separate Home" ? "🏡":"👨‍👩‍👧‍👦"} {l}{living===l && " ✓"}</Button>)}</div></div>
        <div className="space-y-1"><label className="text-[7px] font-bold uppercase text-muted-foreground block">Target Nikkah Timeline</label><div className="grid grid-cols-3 gap-1.5">{TIMELINES.map(t=><Button key={t} variant="reference" size="reference" aria-pressed={timeline===t} onClick={()=>setTimeline(t)} className={cn("py-1.5 rounded-xl border text-[7.5px] font-bold",timeline===t?"bg-primary border-primary text-primary-foreground":"bg-secondary border-border text-muted-foreground")}>{t}{timeline===t && " ✓"}</Button>)}</div></div>
        <div className="p-2.5 rounded-2xl bg-secondary border border-border flex items-center justify-between"><div className="flex items-center gap-2"><Button variant="reference" size="reference" onClick={record} aria-label={recording ? "Stop recording":"Record voice intro"} className="w-7 h-7 rounded-full bg-accent text-primary-foreground flex items-center justify-center">{recording ? <Square className="w-3.5 h-3.5"/>:<Mic className="w-3.5 h-3.5"/>}</Button><div><span className="text-[8px] font-bold text-primary block">{recording ? "Recording…" : voice ? "30s Voice Intro Recorded":"30s Voice Intro"}</span><span className="text-[6.5px] text-muted-foreground">"My vision of a tranquil Muslim home..."</span></div></div><span className="text-[7.5px] font-bold text-trust">{voice ? "✓":"0:30"}</span></div>
        {voice && <audio controls src={voice} className="h-8 w-full"/>}
        <div className="space-y-2"><Field label="Email"><input type="email" className="text-[9px] font-bold" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></Field><Field label="Password"><input type="password" className="text-[9px] font-bold" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></Field></div>
      </>}
      {error && <p role="alert" className="text-[9px] text-destructive">{error}</p>}
    </div>
    <div className="space-y-2">{step !== 3 && <><div className="flex items-center justify-between text-[8px] font-bold text-muted-foreground"><span>{step+1}/4</span><span>{(step+1)*25}% Complete</span></div><div className="w-full h-1 rounded-full bg-secondary overflow-hidden"><div className={cn("h-full bg-accent rounded-full",step===0?"w-1/4":"w-3/4")}/></div></>}{submit}</div>
  </div></ReferenceShell>;
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, ChevronDown, ChevronLeft, Image as ImageIcon, Mic, Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CustomPicker, type PickerRequest } from "@/components/mawaddah/CustomPicker";
import { PhotoCropModal } from "@/components/mawaddah/PhotoCropModal";
import { RefField as Field, ReferenceShell } from "@/components/mawaddah/ReferenceShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { canAdvance, MIN_AGE, ageFrom } from "@/lib/onboarding";
import { splitCountry, type PickerType } from "@/lib/picker-options";
import { clearPendingAuth, defaultBlurFor, getPendingAuth, guardianUpdatesDefault, register, type Gender, type PendingAuth } from "@/lib/session";
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

const SALAH = "🕌 5x Daily Salah";
const HALAL = "🌿 Strictly Halal";
const HANAFI = "Sunni • Hanafi";
const OTHER_SECTS = ["Shia", "Just Muslim", "Prefer not to say"];
const TIMELINES = ["3–6 Mos", "6–12 Mos", "1–2 Yrs"];
const TITLES = ["Basic Details", "Add a Guardian (Optional)", "Upload your photos"];
const CTA = ["Continue", "Continue", "Next", "Finish Setup & Start Discovering"];
const fmt = (s: number) => `0:${String(Math.max(0, Math.min(30, s))).padStart(2, "0")}`;

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <Button variant="reference" size="reference" type="button" aria-pressed={on} onClick={onClick} className={cn("px-2.5 py-1.5 rounded-full text-[7.5px] font-bold border whitespace-nowrap", on ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-primary")}>{children}</Button>;
}
/** Showcase Screen 03 grouped-card row: muted label left, bold value + chevron right; opens the Custom Dropdown Picker. */
function PickRow({ label, value, onClick, tight, accent }: { label: string; value: string; onClick: () => void; tight?: boolean; accent?: boolean }) {
  return <button type="button" onClick={onClick} className={cn("w-full px-3 flex items-center justify-between gap-2 hover:bg-secondary/50 transition text-left", tight ? "py-2 bg-card" : "py-2.5")}>
    <span className="text-muted-foreground font-medium shrink-0">{label}</span>
    <span className="font-bold text-primary flex items-center gap-1 min-w-0"><span className={cn("truncate", !value && "font-semibold text-muted-foreground")}>{value || "Select"}</span><ChevronDown className={cn("w-3 h-3 shrink-0", accent ? "text-accent" : "text-muted-foreground")}/></span>
  </button>;
}
function ToggleRow({ title, note, checked, onChange }: { title: string; note: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 [&+&]:pt-1 [&+&]:border-t [&+&]:border-border">
    <div><span className="text-[8px] font-bold text-primary block">{title}</span><span className="text-[6.5px] text-muted-foreground">{note}</span></div>
    <Switch className="reference-toggle shrink-0" aria-label={title} checked={checked} onCheckedChange={onChange}/>
  </div>;
}

function Onboarding() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<PendingAuth | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [fullName, setFullName] = useState(""); const [dob, setDob] = useState(""); const [height, setHeight] = useState(""); const [marital, setMarital] = useState("");
  const [currentCountry, setCurrentCountry] = useState(""); const [bornCountry, setBornCountry] = useState(""); const [ethnicity, setEthnicity] = useState(""); const [languages, setLanguages] = useState("");
  const [picker, setPicker] = useState<PickerRequest | null>(null);
  const [crop, setCrop] = useState<{ slot: number; src: string } | null>(null);
  const [guardianName, setGuardianName] = useState(""); const [guardianWhatsapp, setGuardianWhatsapp] = useState(""); const [guardianUpdates, setGuardianUpdates] = useState(false);
  const [photos, setPhotos] = useState<string[]>(Array(6).fill("")); const [blur, setBlur] = useState(true); const [watermark, setWatermark] = useState(true);
  const [practice, setPractice] = useState<string[]>([]); const [sect, setSect] = useState(""); const [showSects, setShowSects] = useState(false);
  const [living, setLiving] = useState("Separate Home"); const [timeline, setTimeline] = useState("");
  const [voice, setVoice] = useState(""); const [voiceSecs, setVoiceSecs] = useState(0); const [voiceSample, setVoiceSample] = useState(false);
  const [recording, setRecording] = useState(false); const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(""); const [note, setNote] = useState("");
  const recorder = useRef<MediaRecorder | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0); const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { const a = getPendingAuth(); if (a) setAuth(a); else navigate({ to: "/welcome", replace: true }); }, [navigate]);
  useEffect(() => () => { if (crop) URL.revokeObjectURL(crop.src); }, [crop]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); recorder.current?.stream.getTracks().forEach(t => t.stop()); audio.current?.pause(); }, []);
  if (!auth) return <ReferenceShell step={1}><div className="flex-1 bg-card"/></ReferenceShell>;

  const back = () => { setError(""); if (step === 0) navigate({ to: "/welcome" }); else setStep(step - 1); };
  const next = () => {
    if (!canAdvance(step, { gender, fullName, dob, marital, currentCountry, bornCountry, ethnicity, languages, photos, timeline })) {
      setError(step === 2 ? "Please upload at least one photo from your device." : step === 3 ? "Please choose your target Nikkah timeline."
        : !gender ? "Please choose Man or Woman." : dob && ageFrom(dob) < MIN_AGE ? `You must be at least ${MIN_AGE} to join.` : "Please fill in every detail (height is optional).");
      return;
    }
    setError("");
    if (step < 3) { setStep(step + 1); return; }
    if (!gender) return;
    const { city, country } = splitCountry(currentCountry);
    const name = fullName.trim();
    register({
      gender, firstName: name.split(/\s+/)[0] ?? name, fullName: name, dob, city, country,
      height: height || undefined, maritalStatus: marital, bornCountry, ethnicity, languages: languages.split(",").map(l => l.trim()).filter(Boolean),
      guardianName: guardianName.trim(), guardianWhatsapp: guardianWhatsapp.trim(), guardianUpdates: !!guardianWhatsapp.trim() && guardianUpdates,
      photo: photos.find(Boolean), photos: photos.filter(Boolean), privacyBlur: gender === "woman" && blur, antiScreenshot: watermark,
      sect, timeline, practice, living, voiceIntro: voice || undefined,
      email: auth.method === "phone" ? "" : auth.email.trim(), phone: auth.method === "phone" ? auth.phone.trim() : undefined, authMethod: auth.method, password: auth.password,
    });
    clearPendingAuth();
    navigate({ to: "/feed", replace: true });
  };
  const upload = (slot: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image."); return; }
    setError("");
    setCrop({ slot, src: URL.createObjectURL(file) });
  };
  const savePhoto = (value: string) => { if (!crop) return; const slot = crop.slot; setPhotos(old => old.map((p, i) => i === slot ? value : p)); setCrop(null); };
  const openPicker = (type: PickerType, title: string, value: string, onSelect: (v: string) => void) => setPicker({ type, title, value, onSelect });
  const clearVoice = () => { setNote(""); audio.current?.pause(); audio.current = null; setPlaying(false); setVoice(""); setVoiceSample(false); setVoiceSecs(0); };
  const record = async () => {
    if (recording) { recorder.current?.stop(); return; }
    if (voice || voiceSample) { clearVoice(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream); recorder.current = r; const chunks: Blob[] = [];
      r.ondataavailable = e => chunks.push(e.data);
      r.onstop = () => {
        if (timer.current) clearTimeout(timer.current);
        stream.getTracks().forEach(t => t.stop()); setRecording(false);
        setVoiceSecs(Math.round((Date.now() - startedAt.current) / 1000));
        const f = new FileReader(); f.onload = () => setVoice(String(f.result)); f.readAsDataURL(new Blob(chunks, { type: r.mimeType }));
      };
      startedAt.current = Date.now(); r.start(); setRecording(true); setError("");
      timer.current = setTimeout(() => { if (r.state === "recording") r.stop(); }, 30000);
    } catch {
      setVoiceSample(true); setVoiceSecs(28);
      setNote("Microphone unavailable, so the sample intro is selected. You can record your own later.");
    }
  };
  const togglePlay = () => {
    if (!voice) return;
    if (!audio.current) { audio.current = new Audio(voice); audio.current.onended = () => setPlaying(false); }
    if (playing) { audio.current.pause(); setPlaying(false); } else { void audio.current.play(); setPlaying(true); }
  };
  const recorded = !!voice || voiceSample;
  const togglePractice = (p: string) => setPractice(old => old.includes(p) ? old.filter(x => x !== p) : [...old, p]);
  const BackBtn = <Button variant="reference" size="reference" onClick={back} aria-label="Back" className="w-6 h-6 shrink-0 rounded-full bg-secondary flex items-center justify-center"><ChevronLeft className="w-3.5 h-3.5"/></Button>;

  return <ReferenceShell step={step + 1}>
    <div className="flex-1 bg-card px-4 pt-2 pb-4 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {step === 0 ? <div className="flex items-center justify-between"><div className="flex items-center gap-2">{BackBtn}<h1 className="text-xs font-extrabold text-primary">{TITLES[0]}</h1></div><span className="text-[7.5px] font-semibold text-muted-foreground">1 / 4</span></div>
          : step < 3 ? <div className={cn("flex items-center gap-2", step === 2 && "justify-between")}>{BackBtn}<h1 className="text-xs font-extrabold text-primary">{TITLES[step]}</h1>{step === 2 && <span className="w-6"/>}</div>
          : <div className="relative text-center space-y-1 pt-0.5"><div className="absolute left-0 top-0">{BackBtn}</div><span className="inline-block px-2 py-0.5 rounded-full bg-accent-light text-accent text-[6.5px] font-bold">100% Match Alignment</span><h1 className="text-xs font-extrabold text-primary">Set Your Marriage Dealbreakers</h1><p className="text-[7px] text-muted-foreground">Save months of small talk by aligning on essentials first.</p></div>}

        {step === 0 && <>
          <div role="radiogroup" aria-label="I am a" className="p-1 rounded-xl bg-secondary grid grid-cols-2 gap-1 border border-border">
            {(["man", "woman"] as const).map(g => <button key={g} type="button" role="radio" aria-checked={gender === g} onClick={() => { setGender(g); setBlur(defaultBlurFor(g)); }} className={cn("py-1.5 rounded-lg text-[8px] flex items-center justify-center gap-1 transition", gender === g ? "bg-primary text-primary-foreground font-bold shadow-2xs" : "text-muted-foreground font-semibold")}><span>{g === "man" ? "Man" : "Woman"}</span></button>)}
          </div>

          <div className="space-y-1">
            <span className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground px-1 block">Personal Information</span>
            <div className="rounded-2xl bg-secondary/60 border border-border divide-y divide-border overflow-hidden text-[8px]">
              <label className="px-3 py-2 flex items-center justify-between gap-2 bg-card">
                <span className="text-muted-foreground font-medium shrink-0">Full name</span>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" placeholder="e.g. Amina Bello" className="text-right font-bold text-primary placeholder:font-semibold placeholder:text-muted-foreground"/>
              </label>
              <div className="px-3 py-2 flex items-center justify-between gap-2 bg-card">
                <span className="text-muted-foreground font-medium shrink-0">Date of birth</span>
                <DobInput value={dob} onChange={setDob}/>
              </div>
              <PickRow tight label="Height" value={height} onClick={() => openPicker("height", "Select Height", height, setHeight)}/>
              <PickRow tight label="Marital status" value={marital} onClick={() => openPicker("marital", "Marital Status", marital, setMarital)}/>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground">Location &amp; Background</span>
              <button type="button" onClick={() => openPicker("country", "Select Country (A–Z)", currentCountry, setCurrentCountry)} className="text-[6.5px] font-bold text-accent hover:underline">Open A–Z Picker</button>
            </div>
            <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden text-[8px]">
              <PickRow accent label="Current country" value={currentCountry} onClick={() => openPicker("country", "Current Country", currentCountry, setCurrentCountry)}/>
              <PickRow accent label="Born country" value={bornCountry} onClick={() => openPicker("country", "Born Country", bornCountry, setBornCountry)}/>
              <PickRow accent label="Ethnicity" value={ethnicity} onClick={() => openPicker("ethnicity", "Select Ethnicity", ethnicity, setEthnicity)}/>
              <PickRow accent label="Languages" value={languages} onClick={() => setPicker({ type: "language", title: "Languages Spoken", value: languages, multi: true, onSelect: setLanguages })}/>
            </div>
          </div>
        </>}

        {step === 1 && <>
          <p className="p-2.5 rounded-2xl border border-accent-border bg-accent-light text-[8px] leading-relaxed text-primary">🛡️ Optional: a guardian can be kept informed of your conversations for added barakah and safety.</p>
          <div className="space-y-2">
            <Field label="Guardian Name"><input className="text-[9px] font-bold mt-1" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="e.g. Ibrahim Bello"/></Field>
            <Field label="WhatsApp Number"><input type="tel" className="text-[9px] font-bold mt-1" value={guardianWhatsapp} onChange={e => { const v = e.target.value; if (!guardianWhatsapp.trim() || !v.trim()) setGuardianUpdates(guardianUpdatesDefault(v)); setGuardianWhatsapp(v); }} placeholder="+234 800 000 0000"/></Field>
          </div>
          <div className="p-2.5 rounded-2xl bg-secondary border border-border space-y-1">
            <div className="flex items-center justify-between gap-3"><span className="text-[8px] font-bold text-primary">Send chat messages &amp; updates to Guardian on WhatsApp</span><Switch className="reference-toggle shrink-0" aria-label="Send chat messages & updates to Guardian on WhatsApp" checked={guardianUpdates} disabled={!guardianWhatsapp.trim()} onCheckedChange={setGuardianUpdates}/></div>
            <span className="text-[6.5px] text-muted-foreground block">You can change or update this anytime later in Settings.</span>
          </div>
        </>}

        {step === 2 && <>
          <div className="grid grid-cols-3 grid-rows-3 gap-2 h-52">{photos.map((photo, i) => <label key={i} className={cn("relative cursor-pointer rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1", i === 0 ? "col-span-2 row-span-2 border border-border bg-secondary" : photo ? "border border-border bg-secondary" : "border border-dashed border-accent-border bg-accent-light/40")}>
            {photo && <img src={photo} alt={`Photo ${i + 1}`} className={cn("absolute inset-0 w-full h-full object-cover transition", gender === "woman" && blur && "blur-[11px] scale-105")}/>}
            {i === 0 ? <span className={cn("px-2.5 py-1 rounded-full bg-overlay/65 text-on-photo text-[7px] font-bold flex items-center gap-1 whitespace-nowrap", photo ? "absolute bottom-2 left-1/2 -translate-x-1/2" : "relative")}><Camera className="w-2.5 h-2.5"/>{photo ? "Change Photo" : "Upload Photo"}</span>
              : photo ? <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-overlay/65 text-on-photo text-[6.5px] font-bold">Change</span>
              : <><span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-accent"><ImageIcon className="w-3 h-3"/></span><span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[6.5px] font-bold">+ Add</span></>}
            <input type="file" accept="image/*" aria-label={`Upload photo ${i + 1}`} className="sr-only" onChange={e => { upload(i, e.target.files?.[0]); e.target.value = ""; }}/>
          </label>)}</div>
          <div className="p-2.5 rounded-2xl bg-secondary border border-border space-y-2">
            {gender === "woman" && <ToggleRow title="Modesty Blur Shield" note="Keep photos blurred until you approve" checked={blur} onChange={setBlur}/>}
            <ToggleRow title="Anti-Screenshot Watermark" note="Stamps viewer ID & blocks OS capture" checked={watermark} onChange={setWatermark}/>
          </div>
        </>}

        {step === 3 && <>
          <div className="space-y-1.5"><span className="text-[7px] font-bold uppercase text-muted-foreground block">Daily Salah &amp; Practice</span>
            <div className="flex flex-nowrap gap-1.5">
              <Pill on={practice.includes(SALAH)} onClick={() => togglePractice(SALAH)}>{SALAH}</Pill>
              <Pill on={sect === HANAFI} onClick={() => setSect(sect === HANAFI ? "" : HANAFI)}>{HANAFI}</Pill>
              <Pill on={practice.includes(HALAL)} onClick={() => togglePractice(HALAL)}>{HALAL}</Pill>
            </div>
            <Button variant="reference" size="reference" type="button" aria-expanded={showSects} onClick={() => setShowSects(!showSects)} className="text-[6.5px] font-bold text-muted-foreground flex items-center gap-0.5">{sect && sect !== HANAFI ? `Sect: ${sect}` : "Different sect? (optional)"}<ChevronDown className={cn("w-2.5 h-2.5 transition-transform", showSects && "rotate-180")}/></Button>
            {showSects && <div className="flex flex-wrap gap-1.5">{OTHER_SECTS.map(s => <Pill key={s} on={sect === s} onClick={() => setSect(sect === s ? "" : s)}>{s}</Pill>)}</div>}
          </div>
          <div className="space-y-1.5"><span className="text-[7px] font-bold uppercase text-muted-foreground block">Post-Nikah Living Arrangement</span>
            <div className="grid grid-cols-2 gap-1.5">{["Separate Home", "Joint / Near Family"].map(l => <Button key={l} variant="reference" size="reference" aria-pressed={living === l} onClick={() => setLiving(l)} className={cn("h-8 px-2 rounded-xl border text-[7.5px] font-bold text-center whitespace-normal", living === l ? "bg-accent-light border-accent-border text-accent" : "bg-secondary border-border text-muted-foreground")}>{l === "Separate Home" ? "🏡" : "👨‍👩‍👧"} {l}{living === l && " ✓"}</Button>)}</div>
          </div>
          <div className="space-y-1.5"><span className="text-[7px] font-bold uppercase text-muted-foreground block">Target Nikkah Timeline</span>
            <div className="grid grid-cols-3 gap-1.5">{TIMELINES.map(t => <Button key={t} variant="reference" size="reference" aria-pressed={timeline === t} onClick={() => setTimeline(t)} className={cn("h-7 rounded-xl border text-[7.5px] font-bold", timeline === t ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-muted-foreground")}>{t}{timeline === t && " ✓"}</Button>)}</div>
          </div>
          <div className="p-3 rounded-2xl bg-secondary border border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Button variant="reference" size="reference" onClick={record} aria-label={recording ? "Stop recording" : recorded ? "Remove voice intro" : "Record voice intro"} className="w-8 h-8 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">{recording ? <Square className="w-3 h-3"/> : <Mic className="w-3.5 h-3.5"/>}</Button>
              <div className="min-w-0"><span className="text-[8px] font-bold text-primary block">{recording ? "Recording… tap to stop" : recorded ? "30s Voice Intro Recorded" : "30s Voice Intro"}</span><span className="text-[6.5px] text-muted-foreground">"My vision of a tranquil Muslim home..."</span></div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {voice && <Button variant="reference" size="reference" onClick={togglePlay} aria-label={playing ? "Pause voice intro" : "Play voice intro"} className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">{playing ? <Pause className="w-2.5 h-2.5"/> : <Play className="w-2.5 h-2.5"/>}</Button>}
              <span className={cn("text-[7.5px] font-bold", recorded ? "text-trust" : "text-muted-foreground")}>{recorded ? `${fmt(voiceSecs)} ✓` : "0:30"}</span>
            </div>
          </div>
        </>}
        {step === 3 && note && <p className="text-[7px] text-muted-foreground">{note}</p>}
        {error && <p role="alert" className="text-[8px] font-semibold text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        {step > 0 && step < 3 && <div className="flex items-center justify-between text-[7.5px] font-bold text-muted-foreground"><span>{step + 1}/4</span><span>{(step + 1) * 25}% Complete</span></div>}
        {step < 3 && <>
          <div className="w-full h-1 rounded-full bg-secondary overflow-hidden"><div className={cn("h-full bg-accent rounded-full", step === 0 ? "w-1/4" : step === 1 ? "w-1/2" : "w-3/4")}/></div></>}
        <Button variant="reference" size="reference" onClick={next} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold text-[9.5px]">{CTA[step]}</Button>
        {step === 1 && <Button variant="reference" size="reference" onClick={() => { setGuardianName(""); setGuardianWhatsapp(""); setGuardianUpdates(false); setError(""); setStep(2); }} className="w-full py-1 text-[8.5px] font-semibold text-muted-foreground">Skip for now</Button>}
      </div>
    </div>
    <CustomPicker request={picker} onClose={() => setPicker(null)}/>
    <PhotoCropModal src={crop?.src ?? null} onCancel={() => setCrop(null)} onApply={savePhoto}/>
  </ReferenceShell>;
}

/** Type DD / MM / YYYY; focus jumps to the next box automatically. */
function DobInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [y0 = "", m0 = "", d0 = ""] = value ? value.split("-") : [];
  const [d, setD] = useState(d0); const [m, setM] = useState(m0); const [y, setY] = useState(y0);
  const mRef = useRef<HTMLInputElement>(null); const yRef = useRef<HTMLInputElement>(null);
  const sync = (dd: string, mm: string, yy: string) => {
    const ok = yy.length === 4 && +mm >= 1 && +mm <= 12 && +dd >= 1 && +dd <= new Date(+yy, +mm, 0).getDate();
    onChange(ok ? `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` : "");
  };
  const box = "w-[18px] text-center font-bold text-primary placeholder:font-semibold placeholder:text-muted-foreground bg-secondary rounded";
  const num = (v: string, n: number) => v.replace(/\D/g, "").slice(0, n);
  return (
    <div className="flex items-center gap-0.5">
      <input inputMode="numeric" aria-label="Day of birth" placeholder="DD" value={d} className={box} onChange={e => { const v = num(e.target.value, 2); setD(v); sync(v, m, y); if (v.length === 2) mRef.current?.focus(); }}/>
      <span className="text-muted-foreground">/</span>
      <input ref={mRef} inputMode="numeric" aria-label="Month of birth" placeholder="MM" value={m} className={box} onChange={e => { const v = num(e.target.value, 2); setM(v); sync(d, v, y); if (v.length === 2) yRef.current?.focus(); }}/>
      <span className="text-muted-foreground">/</span>
      <input ref={yRef} inputMode="numeric" aria-label="Year of birth" placeholder="YYYY" value={y} className={cn(box, "w-[28px]")} onChange={e => { const v = num(e.target.value, 4); setY(v); sync(d, m, v); }}/>
      {value && <span className="ml-1 text-[7px] font-bold text-accent">({ageFrom(value)})</span>}
    </div>
  );
}

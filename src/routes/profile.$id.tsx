import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { ProfilePhoto } from "@/components/mawaddah/ProfilePhoto";
import { useRequireAccount } from "@/lib/session";
import { getProfile } from "@/lib/profiles";

export const Route = createFileRoute("/profile/$id")({
  loader: ({ params }) => {
    const p = getProfile(params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name.split(" ")[0]}, ${loaderData.age} — Mawaddah` : "Profile — Mawaddah";
    const d = loaderData ? `${loaderData.profession} in ${loaderData.city}. ${loaderData.match}% values match.` : "Candidate profile on Mawaddah.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProfileView,
});

const DURATION = 30;

function VoiceIntro() {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const ctx = useRef<AudioContext | null>(null);
  const osc = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setT((v) => (v + 0.1 >= DURATION ? (setPlaying(false), 0) : v + 0.1)), 100);
    return () => clearInterval(i);
  }, [playing]);

  useEffect(() => {
    if (!playing) { osc.current?.stop(); osc.current = null; return; }
    // Soft placeholder tone stands in for the recorded intro.
    ctx.current ??= new AudioContext();
    const o = ctx.current.createOscillator(); const g = ctx.current.createGain();
    o.frequency.value = 220; g.gain.value = 0.03; o.connect(g).connect(ctx.current.destination); o.start();
    osc.current = o;
    return () => { o.stop(); };
  }, [playing]);

  const left = Math.ceil(DURATION - t);
  return (
    <div className="flex items-center gap-3 rounded-full border border-accent-border bg-accent-light p-2 pr-4">
      <button aria-label={playing ? "Pause voice intro" : "Play voice intro"} onClick={() => setPlaying(!playing)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>
      <div className="flex-1 space-y-1.5">
        <span className="block text-xs font-bold">{playing ? "Playing 30s Voice Intro" : "Listen to 30s Voice Intro"}</span>
        <div className="h-1 overflow-hidden rounded-full bg-accent-border">
          <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${(t / DURATION) * 100}%` }} />
        </div>
      </div>
      <span className="font-mono text-xs font-bold text-accent">0:{String(left).padStart(2, "0")}</span>
    </div>
  );
}

function ProfileView() {
  const p = Route.useLoaderData();
  if (!useRequireAccount()) return null;
  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto">
        <div className="relative h-[26rem] shrink-0 bg-primary">
          <ProfilePhoto profile={p} />
          <div className="pointer-events-none absolute inset-0 bg-photo-fade" />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between text-on-photo">
            <Link to="/feed" aria-label="Back" className="glass-dark flex h-10 w-10 items-center justify-center rounded-full"><ArrowLeft className="h-4 w-4" /></Link>
            <span className="glass-dark flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"><MapPin className="h-3 w-3" />{p.distanceKm} km</span>
          </div>
          <div className="pointer-events-none absolute inset-x-4 bottom-8 space-y-1.5 text-center text-on-photo">
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold text-accent-foreground">{p.match}% Dealbreaker Match</span>
            <h1 className="pt-1 text-2xl font-extrabold">{p.name}, {p.age}</h1>
            <p className="text-xs uppercase tracking-widest opacity-80">{p.city} • {p.profession}</p>
          </div>
        </div>
        <div className="relative z-10 -mt-5 space-y-6 rounded-t-[2rem] bg-card px-5 pb-8 pt-6">
          <VoiceIntro />
          <section>
            <h3 className="mb-1 text-xs font-bold text-muted-foreground">About</h3>
            <p className="text-sm leading-relaxed">"{p.about}"</p>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground">Living & Marriage Timeline</h3>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-trust-light px-3 py-1.5 text-xs font-bold text-trust">🏡 {p.livingAfterNikkah}</span>
              <span className="rounded-full bg-trust-light px-3 py-1.5 text-xs font-bold text-trust">💍 {p.timeline}</span>
              {p.willingToRelocate && <span className="rounded-full bg-trust-light px-3 py-1.5 text-xs font-bold text-trust">✈️ Willing to Relocate</span>}
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground">Values & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {p.interests.map((i) => <span key={i} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-bold">{i}</span>)}
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground">Languages & Background</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...p.languages, p.tribe])].map((i, k) => <span key={k} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-bold">{i}</span>)}
            </div>
          </section>
        </div>
      </div>
      <BottomNav active="home" />
    </PhoneShell>
  );
}

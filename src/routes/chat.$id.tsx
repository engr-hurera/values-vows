import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Lock, Mic, Pause, Play, Send, ShieldAlert, ShieldCheck, Sparkles, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneShell } from "@/components/mawaddah/BottomNav";
import { MatchAvatar } from "@/components/mawaddah/MatchAvatar";
import { chats, findThread, guardianCC, ICEBREAKERS, type ChatMessage, useChatSession } from "@/lib/chat-store";
import { getProfile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$id")({
  loader: ({ params }) => {
    const p = getProfile(params.id);
    if (!p) throw notFound();
    return { name: p.name };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `Chat with ${loaderData.name.split(" ")[0]} — Mawaddah` : "Chat — Mawaddah";
    const d = "A chaperoned Mawaddah conversation with voice notes, icebreakers and Report & Freeze safety.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Chat,
});

const BARS = [6, 10, 14, 8, 16, 12, 18, 9, 13, 17, 7, 11, 15, 10, 6, 12, 16, 8, 11, 7];

function VoiceNote({ msg, mine }: { msg: ChatMessage; mine: boolean }) {
  const total = msg.seconds || 1;
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!playing || msg.audio) return;
    const i = setInterval(() => setT((v) => v + 0.1), 100);
    return () => clearInterval(i);
  }, [playing, msg.audio]);
  useEffect(() => { if (!msg.audio && t >= total) { setPlaying(false); setT(0); } }, [t, total, msg.audio]);
  const toggle = () => {
    if (msg.audio && audio.current) { if (playing) audio.current.pause(); else void audio.current.play(); return; }
    setPlaying((v) => !v);
  };
  const progress = Math.min(1, t / total);
  const left = Math.max(0, Math.ceil(total - t));
  return (
    <div className="flex items-center gap-2.5">
      {msg.audio && <audio ref={audio} src={msg.audio} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0); }} onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} className="hidden" />}
      <button onClick={toggle} aria-label={playing ? "Pause voice note" : "Play voice note"} className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", mine ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
      </button>
      <div className="flex h-5 items-center gap-[2px]" aria-hidden>
        {BARS.map((h, i) => <span key={i} style={{ height: h }} className={cn("w-[3px] rounded-full", i / BARS.length < progress ? "bg-accent" : mine ? "bg-primary-foreground/35" : "bg-primary/25")} />)}
      </div>
      <span className="text-[10px] font-bold tabular-nums">0:{String(playing || t > 0 ? left : total).padStart(2, "0")}</span>
    </div>
  );
}

function Chat() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useChatSession();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);
  const p = getProfile(id);
  const thread = session ? findThread(session.state, id) : undefined;
  const count = thread?.messages.length ?? 0;

  useEffect(() => { if (session && !thread) navigate({ to: "/match/$id", params: { id }, replace: true }); }, [session, thread, id, navigate]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [count]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); recorder.current?.stream.getTracks().forEach((t) => t.stop()); }, []);
  useEffect(() => { if (thread?.status !== "active" && recorder.current?.state === "recording") recorder.current.stop(); }, [thread?.status]);

  if (!session || !p || !thread) return null;
  const { account, state } = session;
  const first = p.name.split(" ")[0];
  const frozen = thread.status === "frozen";
  const locked = thread.status !== "active";
  const cc = guardianCC(account, p);
  const report = frozen ? [...state.reports].reverse().find((r) => r.profileId === id) : undefined;

  const send = (value: string) => {
    const v = value.trim();
    if (!v || locked) return;
    chats.send(id, { kind: "text", text: v });
    setText("");
  };
  const record = async () => {
    if (recording) { recorder.current?.stop(); return; }
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      recorder.current = r;
      const chunks: Blob[] = [];
      const started = Date.now();
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        if (timer.current) clearTimeout(timer.current);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const seconds = Math.max(1, Math.min(30, Math.round((Date.now() - started) / 1000)));
        const f = new FileReader();
        f.onload = () => chats.send(id, { kind: "voice", audio: String(f.result), seconds });
        f.readAsDataURL(new Blob(chunks, { type: r.mimeType }));
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => { if (r.state === "recording") r.stop(); }, 30000);
    } catch {
      setMicError("Microphone access is unavailable on this device.");
    }
  };

  return (
    <PhoneShell>
      <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-border bg-card px-4 py-3">
        <Link to="/messages" aria-label="Back to messages" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary"><ChevronLeft className="h-4 w-4" /></Link>
        <Link to="/profile/$id" params={{ id }} className="flex min-w-0 flex-1 items-center gap-2.5">
          <MatchAvatar profile={p} className="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{first}, {p.age}</p>
            {cc ? <p className="flex items-center gap-1 text-[10px] font-bold text-trust"><ShieldCheck className="h-3 w-3" />Guardian CC</p> : <p className="truncate text-[10px] text-muted-foreground">{p.profession}</p>}
          </div>
        </Link>
        <button
          onClick={() => chats.reportAndFreeze(id)}
          disabled={frozen}
          className="flex shrink-0 items-center gap-1 rounded-full bg-destructive px-3 py-2 text-[11px] font-bold text-destructive-foreground shadow-float transition hover:opacity-90 disabled:opacity-60"
        >
          <ShieldAlert className="h-3.5 w-3.5" />{frozen ? "Frozen" : "Report & Freeze"}
        </button>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4">
        <div className="mx-auto max-w-[85%] rounded-2xl border border-accent-border bg-accent-light px-3 py-2 text-center text-[10px] leading-relaxed text-accent">
          🤲 Chaperoned conversation · Speak with adab, honesty and good intention.
        </div>
        {thread.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] rounded-3xl px-3.5 py-2.5 text-[13px] leading-snug shadow-sm", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground")}>
                {m.kind === "voice" ? <VoiceNote msg={m} mine={mine} /> : m.text}
              </div>
            </div>
          );
        })}
        {frozen && (
          <div role="status" className="space-y-1 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-destructive"><Lock className="h-3.5 w-3.5" />Chat frozen for your safety</p>
            <p className="text-[11px] text-foreground/80">Safety report {report?.id ?? ""} was logged. Messaging with {first} is locked.</p>
          </div>
        )}
        {thread.status === "ended" && <p className="text-center text-[11px] font-semibold text-muted-foreground">This chat has ended.</p>}
        <div ref={bottom} />
      </main>

      <footer className="sticky bottom-0 space-y-2 border-t border-border bg-card px-3 pb-3 pt-2">
        {!locked && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="Icebreakers">
              {ICEBREAKERS.map((q) => (
                <button key={q} onClick={() => send(q)} className="flex shrink-0 items-center gap-1 rounded-full border border-accent-border bg-accent-light px-3 py-1.5 text-[11px] font-semibold text-accent">
                  <Sparkles className="h-3 w-3" />{q}
                </button>
              ))}
            </div>
            <button onClick={() => chats.end(id)} className="text-[10px] font-semibold text-muted-foreground underline-offset-2 hover:underline">End this chat (frees an active slot)</button>
          </>
        )}
        {micError && <p role="alert" className="text-[11px] text-destructive">{micError}</p>}
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={locked}
            aria-label="Message"
            placeholder={frozen ? "Chat locked after safety report" : locked ? "This chat has ended" : recording ? "Recording voice note…" : "Write with adab…"}
            className="h-11 min-w-0 flex-1 rounded-full border border-border bg-secondary px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button type="button" onClick={record} disabled={locked} aria-label={recording ? "Stop recording" : "Record voice note"} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50", recording ? "bg-destructive text-destructive-foreground" : "bg-secondary text-primary")}>
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button type="submit" disabled={locked || !text.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </footer>
    </PhoneShell>
  );
}

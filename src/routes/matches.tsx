import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Inbox, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { MatchAvatar } from "@/components/mawaddah/MatchAvatar";
import { ACTIVE_CHAT_CAP, activeCount, chats, findThread, useChatSession } from "@/lib/chat-store";
import { getProfile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Your Matches — Mawaddah" },
      { name: "description", content: "See your mutual matches and proposals, with a 3-chat cap that keeps every conversation sincere." },
      { property: "og:title", content: "Your Matches — Mawaddah" },
      { property: "og:description", content: "See your mutual matches and proposals, with a 3-chat cap that keeps every conversation sincere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Matches,
});

function Matches() {
  const navigate = useNavigate();
  const session = useChatSession();
  const [showProposals, setShowProposals] = useState(false);
  if (!session) return null;
  const { state } = session;
  const active = activeCount(state);
  const proposals = state.proposals.map(getProfile).filter((p) => !!p);
  const matches = state.matches.map(getProfile).filter((p) => !!p);

  return (
    <PhoneShell>
      <header className="space-y-4 px-5 pb-3 pt-6">
        <div>
          <p className="font-arabic text-lg leading-none text-accent">مودّة</p>
          <h1 className="text-xl font-extrabold">Matches</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowProposals((v) => !v)}
            aria-expanded={showProposals}
            className={cn("rounded-2xl border p-3.5 text-left transition", showProposals ? "border-accent-border bg-accent-light" : "border-border bg-secondary")}
          >
            <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Proposals <Inbox className="h-3.5 w-3.5 text-accent" /></span>
            <span className="mt-1 block text-2xl font-extrabold">{proposals.length}</span>
            <span className="text-[11px] font-semibold text-accent">{proposals.length ? "Awaiting your reply" : "No new proposals"}</span>
          </button>
          <Link to="/messages" className="rounded-2xl bg-primary p-3.5 text-primary-foreground shadow-float">
            <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-primary-foreground/70">Active <MessageCircle className="h-3.5 w-3.5 text-accent" /></span>
            <span className="mt-1 block text-2xl font-extrabold">{active}/{ACTIVE_CHAT_CAP} <span className="text-xs font-bold text-primary-foreground/70">Cap</span></span>
            <span className="mt-1 flex gap-1">{Array.from({ length: ACTIVE_CHAT_CAP }, (_, i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < active ? "bg-accent" : "bg-primary-foreground/20")} />)}</span>
          </Link>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">Up to {ACTIVE_CHAT_CAP} chats at once, so every conversation gets your sincere attention.</p>
      </header>

      <main className="flex-1 space-y-5 overflow-y-auto px-5 pb-6">
        {showProposals && (
          <section aria-label="Proposals" className="space-y-2">
            {proposals.length === 0 && <p className="rounded-2xl bg-secondary p-4 text-center text-xs text-muted-foreground">No proposals right now.</p>}
            {proposals.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <MatchAvatar profile={p} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name.split(" ")[0]}, {p.age}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{p.profession} • {p.match}% match</p>
                </div>
                <button aria-label={`Decline ${p.name}`} onClick={() => chats.decline(p.id)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary"><X className="h-4 w-4" /></button>
                <button aria-label={`Accept ${p.name}`} onClick={() => { if (chats.connect(p.id)) navigate({ to: "/match/$id", params: { id: p.id } }); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="h-4 w-4" /></button>
              </div>
            ))}
          </section>
        )}

        <section aria-label="Your matches" className="space-y-3">
          <h2 className="text-sm font-extrabold">Your Matches <span className="text-muted-foreground">({matches.length})</span></h2>
          <div className="grid grid-cols-2 gap-3">
            {matches.map((p) => {
              const thread = findThread(state, p.id);
              const card = (
                <>
                  <MatchAvatar profile={p} rounded="rounded-none" className="absolute inset-0 h-full w-full" />
                  <div className="pointer-events-none absolute inset-0 bg-photo-fade" />
                  <span className="glass-dark absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-extrabold text-on-photo">{p.match}%</span>
                  {thread?.status === "active" && <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-[9px] font-bold text-accent-foreground">Chatting</span>}
                  <div className="absolute inset-x-2.5 bottom-2.5 text-on-photo">
                    <p className="text-sm font-extrabold">{p.name.split(" ")[0]}, {p.age}</p>
                    <p className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide opacity-85">{p.profession}<ChevronRight className="h-3 w-3" /></p>
                  </div>
                </>
              );
              const cls = "relative block aspect-[3/4] overflow-hidden rounded-3xl bg-primary shadow-card";
              return thread ? (
                <Link key={p.id} to="/chat/$id" params={{ id: p.id }} className={cls}>{card}</Link>
              ) : (
                <Link key={p.id} to="/match/$id" params={{ id: p.id }} className={cls}>{card}</Link>
              );
            })}
          </div>
          {matches.length === 0 && <p className="rounded-2xl bg-secondary p-6 text-center text-xs text-muted-foreground">No matches yet. Keep discovering with sincerity.</p>}
        </section>
      </main>
      <BottomNav active="matches" />
    </PhoneShell>
  );
}

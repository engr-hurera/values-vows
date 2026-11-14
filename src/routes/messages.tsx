import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Mic, ShieldCheck } from "lucide-react";
import { BottomNav, PhoneShell } from "@/components/mawaddah/BottomNav";
import { MatchAvatar } from "@/components/mawaddah/MatchAvatar";
import { ACTIVE_CHAT_CAP, activeCount, findThread, guardianCC, timeAgo, useChatSession } from "@/lib/chat-store";
import { getProfile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Mawaddah" },
      { name: "description", content: "Chaperoned conversations with your matches, with Guardian CC and one-tap safety reporting." },
      { property: "og:title", content: "Messages — Mawaddah" },
      { property: "og:description", content: "Chaperoned conversations with your matches, with Guardian CC and one-tap safety reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Messages,
});

function Messages() {
  const session = useChatSession();
  if (!session) return null;
  const { account, state } = session;
  const recent = state.matches.filter((id) => findThread(state, id)?.status !== "active").map(getProfile).filter((p) => !!p);
  const threads = [...state.threads]
    .sort((a, b) => (b.messages.at(-1)?.at ?? b.startedAt) - (a.messages.at(-1)?.at ?? a.startedAt))
    .map((t) => ({ t, p: getProfile(t.profileId) }))
    .filter((x) => !!x.p);

  return (
    <PhoneShell>
      <header className="space-y-4 rounded-b-[2rem] bg-primary px-5 pb-5 pt-6 text-primary-foreground">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-arabic text-lg leading-none text-accent">مودّة</p>
            <h1 className="text-xl font-extrabold">Messages</h1>
          </div>
          <span className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-[11px] font-bold">Active {activeCount(state)}/{ACTIVE_CHAT_CAP}</span>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary-foreground/60">Recent Matches</p>
          {recent.length === 0 ? (
            <p className="text-xs text-primary-foreground/70">All your matches are already in a chat.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recent.map((p) => (
                <Link key={p.id} to="/match/$id" params={{ id: p.id }} className="flex w-14 shrink-0 flex-col items-center gap-1">
                  <MatchAvatar profile={p} className="h-14 w-14 ring-2 ring-accent" />
                  <span className="w-full truncate text-center text-[10px] font-semibold">{p.name.split(" ")[0]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3">
        {threads.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">No conversations yet. Open a match to start talking with adab.</p>}
        <ul className="space-y-1">
          {threads.map(({ t, p }) => {
            const last = t.messages.at(-1);
            const cc = guardianCC(account, p!);
            return (
              <li key={t.profileId}>
                <Link to="/chat/$id" params={{ id: t.profileId }} className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-secondary">
                  <MatchAvatar profile={p!} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold">{p!.name.split(" ")[0]}</span>
                      {cc && <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-trust-light px-1.5 py-0.5 text-[9px] font-bold text-trust"><ShieldCheck className="h-2.5 w-2.5" />Guardian CC</span>}
                      {t.status === "frozen" && <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold text-destructive"><Lock className="h-2.5 w-2.5" />Frozen</span>}
                      {t.status === "ended" && <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">Ended</span>}
                    </div>
                    <p className={cn("truncate text-xs", last?.from === "them" && t.status === "active" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {!last ? "Say salaam with adab…" : last.kind === "voice" ? <span className="inline-flex items-center gap-1"><Mic className="h-3 w-3" />Voice note · 0:{String(last.seconds ?? 0).padStart(2, "0")}</span> : `${last.from === "me" ? "You: " : ""}${last.text}`}
                    </p>
                  </div>
                  <span className="shrink-0 self-start pt-1 text-[10px] font-semibold text-muted-foreground">{last ? timeAgo(last.at) : ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <BottomNav active="messages" />
    </PhoneShell>
  );
}

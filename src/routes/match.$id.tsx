import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/mawaddah/BottomNav";
import { MatchAvatar } from "@/components/mawaddah/MatchAvatar";
import { ACTIVE_CHAT_CAP, chats, guardianCC, sharedValues, useChatSession } from "@/lib/chat-store";
import { getProfile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/match/$id")({
  loader: ({ params }) => {
    const p = getProfile(params.id);
    if (!p) throw notFound();
    return { id: p.id, name: p.name };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `Connected with ${loaderData.name.split(" ")[0]} — Mawaddah` : "Mutual Match — Mawaddah";
    const d = "A mutual match on Mawaddah. Begin your conversation with adab.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Bridge,
});

function Bridge() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useChatSession();
  const [blocked, setBlocked] = useState<"cap" | "frozen" | null>(null);
  const p = getProfile(id);
  if (!session || !p) return null;
  const { account, state } = session;
  const first = p.name.split(" ")[0];

  if (!state.matches.includes(id)) {
    return (
      <PhoneShell>
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm font-bold">You are not matched with {first} yet</p>
          <p className="text-xs text-muted-foreground">A connection appears here once you both show interest.</p>
          <Link to="/feed" className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">Back to Discover</Link>
        </main>
      </PhoneShell>
    );
  }

  const values = sharedValues(account, p);
  const cc = guardianCC(account, p);
  const myGuardian = !!account.guardianWhatsapp?.trim() && !!account.guardianUpdates;
  const talk = () => {
    const r = chats.start(id);
    if (!r) return;
    if (r.ok) navigate({ to: "/chat/$id", params: { id } });
    else if (r.reason !== "not-matched") setBlocked(r.reason);
  };

  return (
    <PhoneShell>
      <main className="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-background px-6 py-8 text-center">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-accent-border" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-accent-border/70" />
        <span className="relative flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent"><Sparkles className="h-3 w-3" />Mutual Match</span>

        <div className="relative w-full space-y-6">
          <div className="space-y-1">
            <p className="font-arabic text-2xl text-accent">مَا شَاءَ ٱللَّٰه</p>
            <h1 className="text-2xl font-extrabold">You are connected with {first}</h1>
            <p className="text-xs text-muted-foreground">You both expressed sincere interest. {p.match}% values match.</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary text-2xl font-extrabold text-accent ring-4 ring-card shadow-card">
                {!account.photo && account.firstName.charAt(0).toUpperCase()}
                {account.photo && <img src={account.photo} alt="You" className={cn("h-full w-full object-cover", account.gender === "woman" && account.privacyBlur && "scale-125 blur-md")} />}
              </div>
              <span className="text-[11px] font-bold">You</span>
            </div>
            <div className="relative -mt-6 flex w-20 items-center" aria-hidden>
              <span className="w-full border-t-2 border-dashed border-accent" />
              <span className="absolute left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-float"><Heart className="h-4 w-4 fill-current" /></span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <MatchAvatar profile={p} className="h-20 w-20 ring-4 ring-card shadow-card" />
              <span className="text-[11px] font-bold">{first}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Shared values</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {values.map((v) => <span key={v} className="rounded-full border border-accent-border bg-accent-light px-3 py-1.5 text-[11px] font-bold text-accent">{v}</span>)}
            </div>
          </div>

          {cc && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-trust/20 bg-trust-light p-3.5 text-left">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
              <p className="text-[11px] leading-relaxed text-trust">
                <strong>Guardian linked.</strong> {myGuardian ? `Your Wali${account.guardianName ? ` (${account.guardianName})` : ""}` : `${first}'s Wali`} is linked, so this chat is marked Guardian CC.
              </p>
            </div>
          )}
        </div>

        <div className="relative w-full space-y-2">
          {blocked && (
            <p role="alert" className="rounded-2xl bg-accent-light p-3 text-[11px] font-semibold text-accent">
              {blocked === "cap"
                ? <>You already have {ACTIVE_CHAT_CAP} active chats. End one in <Link to="/messages" className="underline">Messages</Link> to start a new one.</>
                : "This chat was frozen after a safety report."}
            </p>
          )}
          <button onClick={talk} className="w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-float transition hover:bg-primary-soft">Let's Talk with Adab</button>
          <Link to="/feed" className="block w-full py-2 text-xs font-semibold text-muted-foreground">Keep Discovering</Link>
        </div>
      </main>
    </PhoneShell>
  );
}

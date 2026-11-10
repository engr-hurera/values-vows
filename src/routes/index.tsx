import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReferenceShell } from "@/components/mawaddah/ReferenceShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mawaddah — Where sincere intentions meet tranquility" },
      { name: "description", content: "A halal matrimonial community for Muslims seeking Nikah with honesty and respect." },
      { property: "og:title", content: "Mawaddah — Halal Matrimonial Community" },
      { property: "og:description", content: "A halal matrimonial community for Muslims seeking Nikah with honesty and respect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [pledged, setPledged] = useState(false);
  return <ReferenceShell dark>
    <div className="flex-1 bg-primary text-primary-foreground px-5 py-5 flex flex-col justify-between text-center relative overflow-hidden">
      <div className="w-64 h-64 rounded-full border border-primary-foreground/5 absolute -top-20 -right-20 pointer-events-none" />
      <div className="w-48 h-48 rounded-full border border-primary-foreground/10 absolute -bottom-16 -left-16 pointer-events-none" />
      <div className="pt-1"><span className="px-3 py-1 rounded-full bg-primary-foreground/10 text-[8px] font-bold uppercase text-primary-foreground/90">Halal Matrimonial Community</span></div>
      <div className="space-y-3.5 my-auto relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-accent text-primary-foreground mx-auto flex items-center justify-center font-extrabold text-xl shadow-md">M</div>
        <div><h1 className="text-lg font-extrabold">Mawaddah</h1><p className="text-[9px] text-primary-foreground/70 mt-0.5">Where sincere intentions meet tranquility</p></div>
        <div className="bg-primary-foreground/10 backdrop-blur-xs rounded-2xl p-3.5 border border-primary-foreground/10 space-y-1.5">
          <p className="font-arabic text-sm leading-relaxed text-accent-border" dir="rtl">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</p>
          <p className="text-[8.5px] leading-relaxed text-primary-foreground/90 italic">"And among His signs is that He created for you mates that you may find tranquility in them, and He placed between you love and mercy."</p>
          <span className="block text-[7px] font-bold uppercase text-primary-foreground/60">Surah Ar-Rum • 30:21</span>
        </div>
        <label className="bg-primary-foreground/5 rounded-xl p-2.5 border border-primary-foreground/10 flex items-start gap-2 text-left cursor-pointer">
          <input type="checkbox" aria-label="Sincere Niyyah Pledge" checked={pledged} onChange={e => setPledged(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
          <p className="text-[7.5px] text-primary-foreground/85 leading-relaxed"><strong>Sincere Niyyah Pledge:</strong> I join solely for lawful marriage (Nikah), with honesty and respect.</p>
        </label>
      </div>
      <div className="space-y-2 relative z-10">
        <Button variant="reference" size="reference" disabled={!pledged} onClick={() => navigate({to: "/onboarding"})} className="w-full py-2.5 rounded-full bg-accent text-primary-foreground font-bold text-[10px] shadow-sm">Continue with Bismillah</Button>
        <Button variant="reference" size="reference" asChild className="w-full py-2 rounded-full bg-primary-foreground/10 text-primary-foreground font-semibold text-[9px]"><Link to="/signin">Sign In to Existing Account</Link></Button>
      </div>
    </div>
  </ReferenceShell>;
}

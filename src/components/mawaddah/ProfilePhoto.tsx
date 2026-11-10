import { Lock } from "lucide-react";
import { shouldBlur, type Profile } from "@/lib/profiles";
import { actions, useDiscovery } from "@/lib/discovery-store";
import { cn } from "@/lib/utils";

export function ProfilePhoto({ profile, className }: { profile: Profile; className?: string }) {
  const { unblurRequested } = useDiscovery();
  const blurred = shouldBlur(profile);
  const requested = unblurRequested.includes(profile.id);
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <img
        src={profile.photo}
        alt={blurred ? `${profile.name} (photo hidden for privacy)` : profile.name}
        className={cn("h-full w-full object-cover", blurred && "scale-110 blur-2xl")}
      />
      {blurred && (
        <div className="modesty-veil absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/80 text-primary"><Lock className="h-5 w-5" /></span>
          <p className="text-xs font-semibold text-primary">Photo protected by modesty blur</p>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); actions.requestUnblur(profile.id); }}
            className={cn("rounded-full px-5 py-2.5 text-xs font-bold shadow-float transition", requested ? "bg-trust-light text-trust" : "bg-primary text-primary-foreground hover:bg-primary-soft")}
          >
            {requested ? "✓ Unblur Requested" : "Request to Unblur"}
          </button>
        </div>
      )}
    </div>
  );
}

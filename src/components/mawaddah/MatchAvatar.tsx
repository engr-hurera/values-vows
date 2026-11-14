import { Lock } from "lucide-react";
import { shouldBlur, type Profile } from "@/lib/profiles";
import { cn } from "@/lib/utils";

/** Small photo that follows the woman-only blur rule, without the full unblur overlay. */
export function MatchAvatar({ profile, className, rounded = "rounded-full" }: { profile: Profile; className?: string; rounded?: string }) {
  const blurred = shouldBlur(profile);
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-secondary", rounded, className)}>
      <img
        src={profile.photo.replace("w=700", "w=300")}
        alt={blurred ? `${profile.name} (photo hidden for privacy)` : profile.name}
        className={cn("h-full w-full object-cover", blurred && "scale-125 blur-md")}
      />
      {blurred && (
        <span className="absolute inset-0 flex items-center justify-center bg-overlay/20 text-on-photo">
          <Lock className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

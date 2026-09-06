import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  /** Tailwind height classes for this usage (default = compact). The stretched
   *  wordmark is very wide, so big heights are only used where there is room
   *  (e.g. the top navbar), never in narrow columns like the footer. */
  heightClass?: string;
}

/**
 * Official Respak Express logo — emblem + "RESPAK EXPRESS" wordmark
 * (logo-header.png, stretched/wide). The square mark-only version is /logo.png.
 */
export default function Logo({
  variant = "dark",
  className,
  heightClass,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo-header.png"
        alt="Respak Express"
        width={4104}
        height={912}
        priority
        className={cn(
          heightClass ?? "h-9 w-auto sm:h-10",
          "w-auto rounded-lg",
          // over dark/transparent headers give the logo a soft edge
          variant === "light"
            ? "shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/30"
            : "shadow-sm"
        )}
      />
    </span>
  );
}

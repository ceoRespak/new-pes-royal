import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Official Respak Express logo.
 * The source PNG contains the full navy/orange emblem + wordmark.
 */
export default function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Respak Express"
        width={1024}
        height={1024}
        priority
        className={cn(
          "h-14 w-auto rounded-xl md:h-16",
          // over dark/transparent headers give the white logo a soft edge
          variant === "light"
            ? "shadow-[0_6px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/30"
            : "shadow-sm"
        )}
      />
    </span>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Official Pearl Electric Solutions logo — same artwork as pespeshawar.pk.
 * The source PNG already contains the full emblem + wordmark on white.
 */
export default function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Pearl Electric Solutions"
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

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}

export default function RatingStars({
  rating,
  size = "sm",
  className,
}: RatingStarsProps) {
  const starClass =
    size === "sm" ? "text-xs" : "text-sm";
  return (
    <div
      className={cn("flex items-center gap-0.5 text-accent", starClass, className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        if (rating >= i)
          return <FaStar key={i} aria-hidden />;
        if (rating >= i - 0.5)
          return <FaStarHalfAlt key={i} aria-hidden />;
        return (
          <FaRegStar key={i} aria-hidden className="text-slate-300" />
        );
      })}
    </div>
  );
}

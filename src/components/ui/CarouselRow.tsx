"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface CarouselRowProps {
  children: ReactNode;
  className?: string;
  /** Auto-advance the row (pause on hover/touch). */
  autoplay?: boolean;
  /** ms between auto-advances. */
  interval?: number;
  /** gap in px between cards (for consistent stepping). */
  gap?: number;
}

/**
 * Horizontal product carousel: auto-plays (advancing one card at a time) and
 * can also be driven manually with the left/right arrow buttons or by swiping.
 * If the content fits (nothing to scroll) the arrows and autoplay switch off.
 */
export default function CarouselRow({
  children,
  className,
  autoplay = true,
  interval = 4000,
  gap = 16,
}: CarouselRowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [canScroll, setCanScroll] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setCanScroll(el.scrollWidth > el.clientWidth + 8);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    // re-measure once images/layout settle
    const t = window.setTimeout(measure, 400);
    setReady(true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  const step = (): number => {
    const el = scroller.current;
    if (!el) return 0;
    const first = el.querySelector(":scope > *") as HTMLElement | null;
    if (first) return Math.max(80, first.getBoundingClientRect().width + gap);
    return Math.max(80, el.clientWidth * 0.8);
  };

  const scrollDir = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * step(), behavior: "smooth" });
  };

  // auto-play
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      const el = scroller.current;
      if (!el || paused.current || !canScroll) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step(), behavior: "smooth" });
      }
    }, interval);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, interval, canScroll, ready]);

  return (
    <div className={cn("group/car relative", className)}>
      {canScroll && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollDir(-1)}
          className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white sm:flex"
        >
          <FaChevronLeft />
        </button>
      )}
      {canScroll && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollDir(1)}
          className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white sm:flex"
        >
          <FaChevronRight />
        </button>
      )}

      <div
        ref={scroller}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-1 pb-2 scroll-smooth"
      >
        {children}
      </div>
    </div>
  );
}

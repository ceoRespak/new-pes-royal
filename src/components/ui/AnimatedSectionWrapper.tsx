"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSectionWrapperProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before the animation plays (used to stagger siblings). */
  delay?: number;
  /** Vertical offset to travel while fading in. */
  y?: number;
  duration?: number;
  id?: string;
}

/**
 * Fade + slide-in reveal wrapper powered by Framer Motion.
 * Elements animate the first time they scroll into view.
 */
export default function AnimatedSectionWrapper({
  children,
  className,
  delay = 0,
  y = 32,
  duration = 0.6,
  id,
}: AnimatedSectionWrapperProps) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Child stagger variant helper for grids of cards. */
export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Extra stagger delay in seconds for this item. */
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Fires a callback the first time the element scrolls into view. */
export function useOnScreen<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView) setOnScreen(true);
  }, [inView]);

  return { ref, onScreen };
}

export { cn };

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import type { Faq } from "@/types";
import { cn } from "@/lib/utils";

const filters = ["all", "warranty", "products", "orders", "support"] as const;
const filterLabel: Record<(typeof filters)[number], string> = {
  all: "All",
  warranty: "Warranty",
  products: "Products",
  orders: "Orders",
  support: "Support",
};

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [active, setActive] = useState<string | null>(faqs[0]?.id ?? null);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const visible = faqs.filter((f) => filter === "all" || f.category === filter);

  return (
    <div>
      {/* Filter chips */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
              filter === f
                ? "bg-primary-gradient text-white shadow-card"
                : "bg-light text-slate-600 hover:bg-primary/10 hover:text-primary"
            )}
          >
            {filterLabel[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.map((faq) => {
            const open = active === faq.id;
            return (
              <motion.div
                layout
                key={faq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-colors",
                  open
                    ? "border-accent/50 bg-white shadow-card"
                    : "border-slate-100 bg-white hover:border-primary/20"
                )}
              >
                <button
                  onClick={() => setActive(open ? null : faq.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left"
                >
                  <FaQuestionCircle
                    className={cn(
                      "shrink-0 text-lg transition-colors",
                      open ? "text-accent" : "text-primary/30"
                    )}
                  />
                  <span className="flex-1 font-display text-[0.95rem] font-semibold text-slate-700">
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-all duration-300",
                      open
                        ? "rotate-180 bg-accent text-primary"
                        : "bg-light text-slate-500"
                    )}
                  >
                    <FaChevronDown />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="border-t border-slate-100 px-6 py-5 pl-14 text-sm leading-relaxed text-slate-500">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

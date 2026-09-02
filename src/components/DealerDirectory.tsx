"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaStore,
  FaTools,
  FaTimes,
  FaDirections,
} from "react-icons/fa";
import { dealers } from "@/data/dealers";
import { cn } from "@/lib/utils";

type Mode = "all" | "service" | "head";

export default function DealerDirectory() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("all");

  const results = useMemo(() => {
    let list = dealers;
    if (mode === "service") list = list.filter((d) => d.isServiceCenter);
    if (mode === "head") list = list.filter((d) => d.isHeadOffice);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        `${d.name} ${d.city} ${d.area} ${d.address}`
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [query, mode]);

  const cities = useMemo(
    () => Array.from(new Set(dealers.map((d) => d.city))),
    []
  );

  const modeBtn = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
        mode === m
          ? "bg-primary-gradient text-white shadow-card"
          : "bg-white text-slate-600 shadow-sm hover:bg-primary/10 hover:text-primary"
      )}
    >
      {label}
    </button>
  );

  const directions = (d: (typeof dealers)[number]) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${d.name}, ${d.address}, ${d.city}`
    )}`;

  return (
    <div>
      {/* Controls */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {modeBtn("all", `All Outlets (${dealers.length})`)}
            {modeBtn(
              "service",
              `Service Centers (${dealers.filter((d) => d.isServiceCenter).length})`
            )}
            {modeBtn("head", "Head Office")}
          </div>
          <label className="relative w-full lg:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search by city or name (e.g. ${cities[1] ?? "Mardan"})...`}
              className="w-full rounded-full border border-slate-200 bg-light/50 py-3 pl-11 pr-10 text-sm transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
              >
                <FaTimes />
              </button>
            )}
          </label>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-primary">{results.length}</span>{" "}
          outlet{results.length !== 1 && "s"}
          {query && (
            <>
              {" "}
              matching <span className="font-bold text-accent">“{query}”</span>
            </>
          )}
        </p>
      </div>

      {/* Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((d) => (
            <motion.article
              layout
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
            >
              {/* top accent strip for head office */}
              {d.isHeadOffice && (
                <span className="absolute inset-x-0 top-0 h-1.5 bg-gold-gradient" />
              )}
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-xl text-primary transition group-hover:bg-primary-gradient group-hover:text-white">
                  {d.isHeadOffice ? <FaBuilding /> : <FaStore />}
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {d.isHeadOffice && (
                    <span className="rounded-full bg-gold-gradient px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-wider text-primary">
                      Head Office
                    </span>
                  )}
                  {d.isServiceCenter && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-emerald-600">
                      <FaTools /> Service
                    </span>
                  )}
                </div>
              </div>

              <h3 className="mt-4 font-display text-lg font-bold leading-snug text-primary">
                {d.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
                <FaMapMarkerAlt /> {d.city} — {d.area}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {d.address}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <FaPhoneAlt className="text-xs text-accent" />
                <a
                  href={`tel:${d.phone.replace(/\s/g, "")}`}
                  className="font-semibold hover:text-primary"
                >
                  {d.phone}
                </a>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <a
                  href={directions(d)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary !px-4 !py-2.5 text-xs"
                >
                  <FaDirections /> Directions
                </a>
                <span className="text-right text-[0.68rem] text-slate-400">
                  {d.timing}
                </span>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="font-display text-lg font-bold text-primary">
            No outlet found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different city, or contact us — we&apos;ll point you to the
            nearest stockist.
          </p>
        </div>
      )}
    </div>
  );
}

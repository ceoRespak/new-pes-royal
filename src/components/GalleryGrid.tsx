"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaMapMarkerAlt,
  FaTimes,
} from "react-icons/fa";
import { galleryFilters, galleryItems } from "@/data/gallery";
import { cn } from "@/lib/utils";

export default function GalleryGrid() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(
    () =>
      filter === "All"
        ? galleryItems
        : galleryItems.filter((g) => g.category === filter),
    [filter]
  );

  const activeItem = lightbox !== null ? items[lightbox] : null;

  const move = (dir: 1 | -1) => {
    if (lightbox === null) return;
    const next = (lightbox + dir + items.length) % items.length;
    setLightbox(next);
  };

  return (
    <div>
      {/* Filters */}
      <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1 lg:justify-center">
        {galleryFilters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setLightbox(null);
            }}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
              filter === f
                ? "bg-primary-gradient text-white shadow-card"
                : "bg-white text-slate-600 shadow-sm hover:bg-primary/10 hover:text-primary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.figure
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35 }}
              className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl shadow-card"
              onClick={() => setLightbox(i)}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

              <span className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-primary">
                {item.category}
              </span>
              <span className="absolute right-4 top-4 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <FaExpand />
              </span>

              <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 transition-transform duration-500 group-hover:translate-y-0">
                <p className="font-display text-base font-bold text-white">
                  {item.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
                  <FaMapMarkerAlt className="text-accent" /> {item.location}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              aria-label="Close"
              onClick={() => setLightbox(null)}
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white hover:text-primary"
            >
              <FaTimes />
            </button>

            <button
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                move(-1);
              }}
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-gold-gradient hover:text-primary"
            >
              <FaChevronLeft />
            </button>

            <motion.figure
              key={activeItem.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video overflow-hidden rounded-3xl bg-white/10">
                <Image
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-4 text-center text-white">
                <p className="font-display text-lg font-bold">{activeItem.title}</p>
                <p className="mt-1 text-sm text-white/70">
                  {activeItem.category} · {activeItem.location}
                </p>
              </figcaption>
            </motion.figure>

            <button
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                move(1);
              }}
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-gold-gradient hover:text-primary"
            >
              <FaChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

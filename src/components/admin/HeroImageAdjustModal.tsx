"use client";

import { useState } from "react";
import {
  FaCheck,
  FaCrop,
  FaImage,
  FaRedo,
  FaTimes,
} from "react-icons/fa";
import UploadButton from "@/components/admin/UploadButton";
import { resolveImage } from "@/lib/images";

/**
 * Pop-up banner image editor for hero slides.
 *
 * Flow: click "Upload & adjust image" → a modal opens showing a LIVE hero-sized
 * preview (the same wide crop + navy scrim the slide uses). Upload a new banner
 * inside the modal, then use the adjustment bars (horizontal/vertical position,
 * angle, padding) to move/fit the image — the preview updates live. Save writes
 * the image URL + settings back to the slide.
 */

export interface HeroAdjust {
  image: string;
  angle: number;
  pad: number;
  posX: number;
  posY: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

function Bar({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="rounded bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-slate-600 ring-1 ring-slate-200">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#FF5A00]"
        aria-label={label}
      />
    </div>
  );
}

export default function HeroImageAdjustModal({
  value,
  angle = 0,
  pad = 0,
  posX = 50,
  posY = 50,
  onSave,
  slotLabel,
  recommended,
  minWidth,
}: {
  value: string;
  angle?: number;
  pad?: number;
  posX?: number;
  posY?: number;
  onSave: (adj: HeroAdjust) => void;
  /** Which banner this is editing, e.g. "Desktop banner" / "Mobile banner". */
  slotLabel?: string;
  /** Required/recommended size label, e.g. "1920 × 800". */
  recommended?: string;
  /** Minimum pixel width before we warn the image will look blurry. */
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(value);
  const [a, setA] = useState(angle);
  const [p, setP] = useState(pad);
  const [x, setX] = useState(posX);
  const [y, setY] = useState(posY);
  const [busy, setBusy] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const rot = (a * Math.PI) / 180;
  const zoom = a !== 0 ? 1 / Math.cos(rot) : 1;
  const img = url || value;

  const reset = () => {
    setA(0);
    setP(0);
    setX(50);
    setY(50);
  };

  const save = () => {
    setBusy(true);
    setTimeout(() => {
      onSave({
        image: url || value,
        angle: Math.round(a),
        pad: Math.round(p),
        posX: Math.round(x),
        posY: Math.round(y),
      });
      setBusy(false);
      setOpen(false);
    }, 60);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          // Sync state with the latest slide values each time it opens.
          setUrl(value);
          setA(angle);
          setP(pad);
          setX(posX);
          setY(posY);
          setDims(null);
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5A00] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#E04D00]"
      >
        <FaCrop /> Upload &amp; adjust image
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <FaImage className="text-[#FF5A00]" />
                {slotLabel || "Banner image editor"}
                {recommended && (
                  <span className="rounded-md bg-[#FF5A00]/10 px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide text-[#FF5A00]">
                    {recommended}
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[1.25fr_1fr]">
              {/* ---------- Live preview (hero-shaped) ---------- */}
              <div>
                <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
                  Live preview (wide banner)
                </p>
                <div className="relative h-44 overflow-hidden rounded-xl bg-[#001B45] sm:h-56 lg:h-full lg:min-h-[260px]">
                  {img ? (
                    <>
                      <div
                        className="absolute overflow-hidden"
                        style={{
                          top: p,
                          right: p,
                          bottom: p,
                          left: p,
                          background: "#001B45",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveImage(img)}
                          alt="Banner preview"
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: `${x}% ${y}%`,
                            transform:
                              a !== 0
                                ? `rotate(${a}deg) scale(${zoom.toFixed(3)})`
                                : undefined,
                          }}
                          onLoad={(e) => {
                            const n = e.currentTarget;
                            if (n.naturalWidth && n.naturalHeight)
                              setDims({ w: n.naturalWidth, h: n.naturalHeight });
                          }}
                        />
                      </div>
                      {/* mimic hero readability scrim */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#001B45]/70 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute bottom-1.5 right-2 rounded bg-black/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/70">
                        Sample headline
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/50">
                      No image — upload or paste a URL below
                    </div>
                  )}
                </div>
                {dims && (
                  <p
                    className={`mt-1 text-[0.7rem] font-semibold ${
                      dims.w < (minWidth ?? 0)
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    Loaded {dims.w} × {dims.h} px —
                    {dims.w < (minWidth ?? 0)
                      ? " too small for this banner; it will look soft / blurry. Upload the recommended size for a sharp image."
                      : " sharp enough ✓"}
                  </p>
                )}
                <p className="mt-1 text-[0.68rem] text-slate-400">
                  This is how the image sits in the hero with your current
                  settings.
                </p>
              </div>

              {/* ---------- Controls ---------- */}
              <div className="space-y-4">
                <div>
                  <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">
                    Image
                  </span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF5A00]"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/images/hero/banner.jpg or paste URL"
                  />
                  <div className="mt-2">
                    <UploadButton value={url} onChange={setUrl} label="Upload image" />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <Bar
                    label="Position · horizontal (left ↔ right)"
                    value={x}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => setX(clamp(v, 0, 100))}
                  />
                  <Bar
                    label="Position · vertical (top ↔ bottom)"
                    value={y}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(v) => setY(clamp(v, 0, 100))}
                  />
                  <Bar
                    label="Angle"
                    value={a}
                    min={-30}
                    max={30}
                    unit="°"
                    onChange={(v) => setA(clamp(v, -30, 30))}
                  />
                  <Bar
                    label="Padding"
                    value={p}
                    min={0}
                    max={100}
                    unit="px"
                    onChange={(v) => setP(clamp(v, 0, 100))}
                  />
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#FF5A00]"
                  >
                    <FaRedo /> Reset adjustments
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || !url}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF5A00] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#E04D00] disabled:opacity-50"
              >
                <FaCheck /> {busy ? "Saving…" : "Use this image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

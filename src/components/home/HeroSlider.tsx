"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import {
  FaAward,
  FaBolt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaHeadset,
  FaShieldAlt,
  FaStar,
  FaStore,
  FaSun,
  FaTruck,
  FaWifi,
} from "react-icons/fa";
import { heroSlides } from "@/data/hero";
import type { HeroFeature, HeroSlide } from "@/data/hero";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const featureIcons: Record<string, { icon: typeof FaBolt; cls: string }> = {
  bolt: { icon: FaBolt, cls: "from-amber-300 to-amber-500 text-slate-900" },
  sun: { icon: FaSun, cls: "from-amber-300 to-yellow-500 text-slate-900" },
  star: { icon: FaStar, cls: "from-accent to-accent-700 text-primary" },
  shield: { icon: FaShieldAlt, cls: "from-emerald-400 to-emerald-600 text-white" },
  truck: { icon: FaTruck, cls: "from-sky-400 to-sky-600 text-white" },
  wifi: { icon: FaWifi, cls: "from-violet-400 to-violet-600 text-white" },
  award: { icon: FaAward, cls: "from-red-400 to-red-600 text-white" },
  headset: { icon: FaHeadset, cls: "from-emerald-400 to-teal-600 text-white" },
  check: { icon: FaCheckCircle, cls: "from-green-400 to-green-600 text-white" },
  store: { icon: FaStore, cls: "from-blue-400 to-blue-700 text-white" },
};
const fallback = { icon: FaStar, cls: "from-accent to-accent-700 text-primary" };

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const def = featureIcons[name] ?? fallback;
  const Icon = def.icon;
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm shadow-md ${def.cls} ${className ?? ""}`}
    >
      <Icon />
    </span>
  );
}

function Feature({ f }: { f: HeroFeature }) {
  return (
    <span className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-md">
      <FeatureIcon name={f.icon} />
      <span className="text-[0.8rem] font-bold text-white/90">{f.label}</span>
    </span>
  );
}

/**
 * HeroSlider — the homepage's main advertisement carousel.
 * Content comes from the admin (Site Content) when set, else src/data/hero.ts.
 */
export default function HeroSlider({
  slides,
  version,
}: {
  slides?: HeroSlide[];
  version?: number;
}) {
  const list = slides && slides.length ? slides : heroSlides;
  const heroImg = (src: string) => {
    const abs = /^https?:\/\//.test(src)
      ? src
      : src.startsWith("/storage/")
        ? `https://api.pespeshawar.pk${src}`
        : src;
    return version ? `${abs}${abs.includes("?") ? "&" : "?"}v=${version}` : abs;
  };
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={1000}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".hero-pagination" }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          const nav = swiper.params.navigation as {
            prevEl?: HTMLElement | null;
            nextEl?: HTMLElement | null;
          };
          nav.prevEl = prevRef.current;
          nav.nextEl = nextRef.current;
        }}
        className="!overflow-hidden"
      >
        {list.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative flex items-center overflow-hidden text-white lg:min-h-[640px]"
              style={{ background: slide.bg }}
            >
              {/* subtle grid texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "64px 64px",
                }}
              />
              {/* soft glows */}
              <div className="pointer-events-none absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#E11D2A]/15 blur-3xl" />

              <div className="container-px relative flex w-full flex-col items-center gap-8 pb-20 pt-24 text-center lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:pb-24 lg:pt-24 lg:text-left">
                {/* ============ Copy / ad text ============ */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="order-2 w-full lg:order-1"
                >
                  {slide.badge && (
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-4 py-1.5 text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#E11D2A]/40">
                      <FaStar /> {slide.badge}
                    </span>
                  )}
                  <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.26em] text-accent">
                    {slide.eyebrow}
                  </p>
                  <h1 className="font-display text-[2.1rem] font-extrabold leading-[1.08] sm:text-6xl lg:text-[4rem]">
                    {slide.titleA}{" "}
                    <span className="bg-gold-gradient bg-clip-text text-transparent">
                      {slide.titleHighlight}
                    </span>
                    {slide.titleB && <> {slide.titleB}</>}
                  </h1>
                  <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/80 sm:text-lg lg:mx-0 lg:mt-6">
                    {slide.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5 lg:mt-9 lg:justify-start">
                    <Link
                      href={slide.ctaHref}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E11D2A]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b8111f]"
                    >
                      {slide.ctaLabel}
                      <FaChevronRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    {slide.cta2Label && slide.cta2Href && (
                      <Link
                        href={slide.cta2Href}
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white backdrop-blur transition-all duration-300 hover:border-white hover:bg-white hover:text-primary"
                      >
                        {slide.cta2Label}
                      </Link>
                    )}
                  </div>

                  {/* feature chips */}
                  <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-2 gap-2.5 sm:max-w-xl sm:grid-cols-4 lg:mx-0 lg:mt-9 lg:max-w-xl">
                    {slide.features.map((f) => (
                      <Feature key={f.label} f={f} />
                    ))}
                  </div>
                </motion.div>

                {/* ============ Product visual (edge-to-edge on mobile) ============ */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="order-1 w-[calc(100%+2rem)] -mx-4 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:order-2 lg:mx-0 lg:w-auto lg:max-w-lg"
                >
                  <div className="relative">
                    {/* decorative rings behind card (desktop only) */}
                    <div className="absolute inset-4 hidden rounded-[2.2rem] bg-white/5 ring-1 ring-white/15 lg:block" />
                    <div className="relative w-full overflow-hidden bg-white lg:rounded-[2rem] lg:shadow-2xl lg:shadow-black/30">
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src={heroImg(slide.image)}
                          alt={slide.imageAlt}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-contain p-1 sm:p-4"
                        />
                      </div>
                      {/* subtle brand strip (desktop only) */}
                      <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between bg-gradient-to-t from-white via-white/80 to-transparent px-5 pb-3 pt-10 lg:flex">
                        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-slate-800">
                          Respak Express
                        </p>
                        <span className="rounded-full bg-primary px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                          Peshawar
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* custom controls */}
      <button
        ref={prevRef}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-[#E11D2A] hover:text-white lg:flex"
      >
        <FaChevronLeft />
      </button>
      <button
        ref={nextRef}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-[#E11D2A] hover:text-white lg:flex"
      >
        <FaChevronRight />
      </button>

      <div className="hero-pagination absolute bottom-7 left-0 z-20 flex w-full justify-center gap-2" />
    </section>
  );
}


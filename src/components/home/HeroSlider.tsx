"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { FaArrowRight, FaAward, FaBolt, FaChevronLeft, FaChevronRight, FaShieldAlt, FaStar, FaStore } from "react-icons/fa";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HeroSlide {
  id: string;
  eyebrow: string;
  titleA: string;
  titleHighlight: string;
  titleB?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label?: string;
  cta2Href?: string;
  image: string;
  chip1?: { icon: string; label: string };
  chip2?: { icon: string; label: string };
  bg: string;
}

const slides: HeroSlide[] = [
  {
    id: "s1",
    eyebrow: "Ceiling & Bracket Fans · Exhaust Fans",
    titleA: "Keep Cool with the",
    titleHighlight: "Best Fan Brands",
    description:
      "From copper-wound ceiling fans to powerful exhaust fans — Royal, Pak Fan, Lahore Fan, Voldam and more, all 100% genuine with real warranties.",
    ctaLabel: "Shop Ceiling Fans",
    ctaHref: "/products?category=fan",
    cta2Label: "Explore All",
    cta2Href: "/products",
    image: "/images/hero/hero-fan.svg",
    chip1: { icon: "bolt", label: "Genuine Brands" },
    chip2: { icon: "star", label: "Top Rated" },
    bg: "radial-gradient(1200px 600px at 85% -10%, rgba(26,92,173,0.55), transparent 60%), linear-gradient(120deg,#001a33 0%,#003366 60%,#0a4788 100%)",
  },
  {
    id: "s2",
    eyebrow: "LED Bulbs · Panels · Floodlights",
    titleA: "Light Up Your World with",
    titleHighlight: "Quality Lighting",
    description:
      "Energy-saving LED lighting from Philips, Opal and leading brands — bright, efficient fixtures for every room, shop and project.",
    ctaLabel: "Shop LED Lights",
    ctaHref: "/products?category=lighting-solutions",
    cta2Label: "View Catalog",
    cta2Href: "/products",
    image: "/images/hero/hero-light.svg",
    chip1: { icon: "bolt", label: "Up to 90% Saving" },
    chip2: { icon: "award", label: "Trusted Brands" },
    bg: "radial-gradient(1200px 600px at 15% -10%, rgba(212,175,55,0.25), transparent 60%), linear-gradient(120deg,#1a1a2e 0%,#003366 55%,#0a4788 100%)",
  },
  {
    id: "s3",
    eyebrow: "Wires · Breakers · DBs · Smart Home",
    titleA: "Everything Electrical,",
    titleHighlight: "One Trusted Shop",
    description:
      "Approved distributor of Pakistan Cables, AGE & Fast. Plus MCBs, MCCBs, distribution boards and BlueDot smart-home solutions at fair prices.",
    ctaLabel: "Shop the Range",
    ctaHref: "/products?category=wires-cables",
    cta2Label: "See All Categories",
    cta2Href: "/products",
    image: "/images/hero/hero-sensor.svg",
    chip1: { icon: "shield", label: "Approved Distributor" },
    chip2: { icon: "bolt", label: "100% Genuine" },
    bg: "radial-gradient(1200px 600px at 80% 0%, rgba(26,92,173,0.6), transparent 60%), linear-gradient(120deg,#00244a 0%,#003366 55%,#0a4788 100%)",
  },
];

function ChipIcon({ name }: { name: string }) {
  switch (name) {
    case "bolt":
      return <FaBolt />;
    case "award":
      return <FaAward />;
    case "shield":
      return <FaShieldAlt />;
    default:
      return <FaStar />;
  }
}

export default function HeroSlider() {
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
        autoplay={{ delay: 6000, disableOnInteraction: false }}
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
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative flex min-h-[100svh] items-center overflow-hidden text-white"
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
              <div className="pointer-events-none absolute -right-40 top-1/3 h-[34rem] w-[34rem] rounded-full bg-accent/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gold-gradient" />

              <div className="container-px relative grid w-full items-center gap-10 pb-24 pt-36 lg:grid-cols-2 lg:gap-6 lg:pt-32">
                {/* Copy */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-accent backdrop-blur">
                    {slide.eyebrow}
                  </span>
                  <h1 className="font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
                    {slide.titleA}{" "}
                    <span className="bg-gold-gradient bg-clip-text text-transparent">
                      {slide.titleHighlight}
                    </span>
                    {slide.titleB && <> {slide.titleB}</>}
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                    {slide.description}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <Link
                      href={slide.ctaHref}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E11D2A]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b8111f]"
                    >
                      {slide.ctaLabel}
                      <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    {slide.cta2Label && slide.cta2Href && (
                      <Link
                        href={slide.cta2Href}
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white backdrop-blur transition-all duration-300 hover:border-white hover:bg-white hover:text-primary"
                      >
                        {slide.cta2Label}
                      </Link>
                    )}
                  </div>

                  {/* floating chips */}
                  <div className="mt-12 flex flex-wrap gap-3">
                    {slide.chip1 && (
                      <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur">
                        <span className="text-accent">
                          <ChipIcon name={slide.chip1.icon} />
                        </span>
                        {slide.chip1.label}
                      </span>
                    )}
                    {slide.chip2 && (
                      <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur">
                        <span className="text-accent">
                          <ChipIcon name={slide.chip2.icon} />
                        </span>
                        {slide.chip2.label}
                      </span>
                    )}
                    <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur">
                      <FaStore className="text-accent" /> Serving Peshawar since 2015
                    </span>
                  </div>
                </motion.div>

                {/* Product visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.15 }}
                  className="relative mx-auto w-full max-w-md lg:max-w-none"
                >
                  <div className="relative aspect-square">
                    {/* glow ring */}
                    <div className="absolute inset-6 rounded-full bg-white/5 ring-1 ring-white/15" />
                    <div className="absolute inset-0 animate-float">
                      <Image
                        src={slide.image}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 1024px) 90vw, 45vw"
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* small floating brand card */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute left-0 top-10 flex items-center gap-2 rounded-2xl bg-white p-3 text-primary shadow-xl"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
                        <FaStar />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold">Est. 2015</p>
                        <p className="text-[0.6rem] text-slate-500">
                          Peshawar&apos;s trusted shop
                        </p>
                      </div>
                    </motion.div>
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
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-accent hover:text-primary lg:flex"
      >
        <FaChevronLeft />
      </button>
      <button
        ref={nextRef}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-accent hover:text-primary lg:flex"
      >
        <FaChevronRight />
      </button>

      <div className="hero-pagination absolute bottom-8 left-0 z-20 flex w-full justify-center gap-2" />
    </section>
  );
}

"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { resolveImage } from "@/lib/images";
import {
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingBag,
  FaStar,
} from "react-icons/fa";
import { heroSlides } from "@/data/hero";
import type { HeroSlide } from "@/data/hero";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

/** Responsive show/hide class for block text lines. */
const dispBlock = (d: boolean, m: boolean) =>
  d && m
    ? "block"
    : m
      ? "block md:hidden"
      : d
        ? "hidden md:block"
        : "hidden";
/** Responsive show/hide class for inline text spans. */
const dispInline = (d: boolean, m: boolean) =>
  d && m
    ? "inline"
    : m
      ? "inline md:hidden"
      : d
        ? "hidden md:inline"
        : "hidden";

/**
 * HeroSlider — Powerhouse-style E-COMMERCE promo slider.
 * Each slide is a full-width "collection / offer" banner: a bold sale headline,
 * an offer pill (slide.offer, e.g. "Up to 30% OFF"), a big product/collection
 * visual with a deal sticker and a clear "Shop Now" CTA linking to a category.
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
    const abs = resolveImage(src);
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
        {list.map((slide) => {
          // Which breakpoint each button shows on (default: both).
          const dispCls = (d: boolean, m: boolean) =>
            d && m
              ? "inline-flex"
              : !d && m
                ? "inline-flex md:hidden"
                : d
                  ? "hidden md:inline-flex"
                  : "hidden";
          const cta1Cls = dispCls(
            slide.showCta1Desktop !== false,
            slide.showCta1Mobile !== false
          );
          const cta2Cls = dispCls(
            slide.showCta2Desktop !== false,
            slide.showCta2Mobile !== false
          );
          const cta1Size = slide.cta1Size ?? 14;
          const cta2Size = slide.cta2Size ?? 14;
          const hasMobile = !!slide.imageMobile;
          // Image framing (set via the pop-up image editor).
          const pad = Math.max(0, Math.min(100, slide.imgPadding ?? 0));
          const angle = slide.imgAngle ?? 0;
          const rot = (angle * Math.PI) / 180;
          const zoom = angle !== 0 ? 1 / Math.cos(rot) : 1;
          const posX = Math.max(0, Math.min(100, slide.imgPosX ?? 50));
          const posY = Math.max(0, Math.min(100, slide.imgPosY ?? 50));
          const imgStyle = {
            objectPosition: `${posX}% ${posY}%`,
            transform: angle
              ? `rotate(${angle}deg) scale(${zoom.toFixed(3)})`
              : undefined,
          } as CSSProperties;
          return (
            <SwiperSlide key={slide.id}>
            <div
              className="relative overflow-hidden text-white lg:h-[600px] lg:min-h-[600px]"
              style={{ background: slide.bg }}
            >
              {/* ===== Banner image(s) — desktop wide + mobile ===== */}
              <div
                className="absolute overflow-hidden"
                style={{
                  top: pad,
                  right: pad,
                  bottom: pad,
                  left: pad,
                  background: slide.bg,
                }}
              >
                {hasMobile ? (
                  <>
                    <Image
                      src={heroImg(slide.image)}
                      alt={slide.imageAlt}
                      fill
                      priority
                      sizes="100vw"
                      className="hidden object-cover md:block"
                      style={imgStyle}
                    />
                    <Image
                      src={heroImg(slide.imageMobile ?? "")}
                      alt={slide.imageAlt}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover md:hidden"
                      style={imgStyle}
                    />
                  </>
                ) : (
                  <Image
                    src={heroImg(slide.image)}
                    alt={slide.imageAlt}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    style={imgStyle}
                  />
                )}
              </div>

              {/* readability scrims (keeps copy readable over any banner) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#001a33] via-[#001a33]/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#001a33]/90 to-transparent lg:h-32" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

              <div className="container-px relative flex min-h-[520px] flex-col justify-center pb-16 pt-28 lg:min-h-[600px] lg:pb-24 lg:pt-36">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-2xl"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {slide.offer && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-4 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-widest text-primary shadow-lg shadow-black/25">
                        <FaBolt /> {slide.offer}
                      </span>
                    )}
                    {slide.badge && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E11D2A]/95 px-4 py-1.5 text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-white shadow-lg shadow-[#E11D2A]/30">
                        <FaStar /> {slide.badge}
                      </span>
                    )}
                  </div>

                  {slide.eyebrow && (
                    <p
                      className={`${dispBlock(
                        slide.eyebrowDesktop !== false,
                        slide.eyebrowMobile !== false
                      )} mb-3 mt-5 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-accent`}
                    >
                      <span
                        style={{
                          fontSize: `${(slide.eyebrowSize ?? 100) / 100}em`,
                        }}
                      >
                        {slide.eyebrow}
                      </span>
                    </p>
                  )}

                  <h1 className="font-display text-[2rem] font-extrabold leading-[1.07] drop-shadow-[0_2px_18px_rgba(0,10,25,0.55)] sm:text-5xl lg:text-[3.4rem]">
                    {slide.titleA && (
                      <span
                        className={dispInline(
                          slide.titleDesktop !== false,
                          slide.titleMobile !== false
                        )}
                        style={{ fontSize: `${(slide.titleSize ?? 100) / 100}em` }}
                      >
                        {slide.titleA}{" "}
                      </span>
                    )}
                    {slide.titleHighlight && (
                      <span
                        className={`${dispInline(
                          slide.highlightDesktop !== false,
                          slide.highlightMobile !== false
                        )} bg-gold-gradient bg-clip-text text-transparent`}
                        style={{
                          fontSize: `${(slide.highlightSize ?? 100) / 100}em`,
                        }}
                      >
                        {slide.titleHighlight}
                      </span>
                    )}
                    {slide.titleB && (
                      <span
                        className={dispInline(
                          slide.part2Desktop !== false,
                          slide.part2Mobile !== false
                        )}
                        style={{ fontSize: `${(slide.part2Size ?? 100) / 100}em` }}
                      >
                        {" "}
                        {slide.titleB}
                      </span>
                    )}
                  </h1>

                  <p
                    className={`${dispBlock(
                      slide.descDesktop !== false,
                      slide.descMobile !== false
                    )} mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/90 sm:text-lg lg:mt-5`}
                  >
                    <span
                      style={{ fontSize: `${(slide.descSize ?? 100) / 100}em` }}
                    >
                      {slide.description}
                    </span>
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    {slide.ctaLabel && slide.ctaHref && (
                      <Link
                        href={slide.ctaHref}
                        className={`${cta1Cls} group items-center gap-2 rounded-full bg-[#E11D2A] px-8 py-3.5 font-extrabold uppercase tracking-wider text-white shadow-xl shadow-[#E11D2A]/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b8111f]`}
                        style={{ fontSize: cta1Size }}
                      >
                        <FaShoppingBag className="text-base" />
                        {slide.ctaLabel}
                        <FaChevronRight className="text-xs transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                    {slide.cta2Label && slide.cta2Href && (
                      <Link
                        href={slide.cta2Href}
                        className={`${cta2Cls} group items-center gap-2 rounded-full border-2 border-white/40 bg-black/20 px-7 py-3.5 font-bold uppercase tracking-wider text-white backdrop-blur transition-all duration-300 hover:border-white hover:bg-white hover:text-primary`}
                        style={{ fontSize: cta2Size }}
                      >
                        {slide.cta2Label}
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
          );
        })}
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


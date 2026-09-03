"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { testimonials } from "@/data/testimonials";
import SectionHeading from "@/components/ui/SectionHeading";

import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsSlider({
  items,
}: {
  items?: typeof testimonials;
}) {
  const list = items && items.length ? items : testimonials;
  return (
    <section className="section-pad relative overflow-hidden bg-primary-gradient text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />

      <div className="container-px relative">
        <SectionHeading
          variant="light"
          eyebrow="Testimonials"
          title={
            <>
              Loved by <span className="text-accent">Thousands</span>
            </>
          }
          description="Real stories from homeowners, contractors and businesses who trust Pearl Electric Solutions."
        />

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="!pb-14"
        >
          {list.map((t) => (
            <SwiperSlide key={t.id} className="h-auto">
              <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.07] p-7 backdrop-blur transition-colors duration-300 hover:bg-white/[0.12]">
                <FaQuoteLeft className="text-3xl text-accent/70" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/85">
                  “{t.quote}”
                </blockquote>
                <div className="mt-5 flex items-center gap-1 text-accent">
                  {Array.from({ length: Math.round(t.rating) }).map((_, i) => (
                    <FaStar key={i} className="text-xs" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-gradient font-display text-sm font-bold text-primary">
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-white/60">
                      {t.role} · {t.city}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

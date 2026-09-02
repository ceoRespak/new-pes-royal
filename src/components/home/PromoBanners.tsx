import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import { site } from "@/data/site";

export default function PromoBanners() {
  const promos = site.promoBanners.slice(0, 3);

  if (promos.length === 0) return null;

  return (
    <section className="section-pad bg-white">
      <div className="container-px grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promos.map((banner, i) => (
          <AnimatedSectionWrapper
            key={banner.title}
            className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}
            delay={i * 0.08}
          >
            <Link
              href={banner.link}
              className="group relative flex h-full min-h-[15rem] flex-col justify-end overflow-hidden rounded-3xl text-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card-hover"
            >
              {/* background image */}
              {banner.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
              {/* deco ring */}
              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border-[1.5rem] border-white/10 transition-transform duration-700 group-hover:scale-125" />

              <div className="relative p-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-primary">
                  Shop Now
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1.5 text-sm text-white/80">{banner.subtitle}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white transition-all duration-300 group-hover:gap-3 group-hover:text-accent">
                  Browse Collection <FaArrowRight />
                </span>
              </div>
            </Link>
          </AnimatedSectionWrapper>
        ))}
      </div>
    </section>
  );
}


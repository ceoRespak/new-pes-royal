import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaAward, FaCheckCircle, FaStore } from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { site } from "@/data/site";

const stats = [
  { value: 10, suffix: "+", label: "Years Serving Peshawar" },
  { value: 12, suffix: "+", label: "Top Genuine Brands" },
  { value: 100, suffix: "+", label: "Products Online" },
  { value: 2, suffix: "", label: "Shop Locations" },
];

const usps = [
  "Approved distributor of Pakistan Cables, AGE & Fast Cables",
  "Premium brands — Philips, Schneider, ABB, Royal, Pak Fan & more",
  "Expert advice for electricians, contractors & homeowners",
  "Free same-day delivery across Peshawar",
];

export default function BrandStory() {
  const about = site.about;

  return (
    <section className="section-pad overflow-hidden bg-white">
      <div className="container-px grid items-center gap-14 lg:grid-cols-2">
        {/* Visuals */}
        <AnimatedSectionWrapper className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-card-hover">
            {site.shopFront ? (
              <Image
                src={site.shopFront}
                alt="Pearl Electric Solutions shop front"
                width={720}
                height={540}
                className="h-auto w-full object-cover"
              />
            ) : (
              <Image
                src="/images/about/company.svg"
                alt="Pearl Electric Solutions"
                width={720}
                height={540}
                className="h-auto w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-8 -right-3 flex items-center gap-4 rounded-2xl bg-primary p-5 text-white shadow-card-hover sm:right-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-2xl text-primary">
              <FaAward />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold leading-none">
                <AnimatedCounter to={10} suffix="+" />
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/70">
                Years in Peshawar
              </p>
            </div>
          </div>
        </AnimatedSectionWrapper>

        {/* Copy */}
        <div>
          <AnimatedSectionWrapper>
            <span className="eyebrow">
              <span className="h-px w-6 bg-accent" /> About the Shop
            </span>
            <h2 className="heading heading-underline">
              {about.heading}{" "}
              <span className="text-accent">{about.headingHighlight}</span>
            </h2>
            <p className="mt-6 leading-relaxed text-slate-600">{about.p1}</p>
            <p className="mt-4 leading-relaxed text-slate-500">{about.p2}</p>
          </AnimatedSectionWrapper>

          <AnimatedSectionWrapper delay={0.1}>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {usps.map((u) => (
                <li key={u} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <FaCheckCircle className="mt-0.5 shrink-0 text-accent" />
                  {u}
                </li>
              ))}
            </ul>
          </AnimatedSectionWrapper>

          <AnimatedSectionWrapper delay={0.15}>
            <div className="mt-9 grid grid-cols-2 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-extrabold text-primary">
                    <AnimatedCounter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSectionWrapper>

          <AnimatedSectionWrapper delay={0.2}>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/about" className="btn-primary group">
                Our Story
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="btn-outline">
                <FaStore className="text-accent" /> Visit the Shop
              </Link>
            </div>
          </AnimatedSectionWrapper>
        </div>
      </div>
    </section>
  );
}

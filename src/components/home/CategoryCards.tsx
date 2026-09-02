import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaBoxOpen,
  FaCogs,
  FaFan,
  FaHome,
  FaLightbulb,
  FaNetworkWired,
  FaPlug,
  FaSatelliteDish,
  FaServer,
  FaShieldAlt,
  FaSun,
  FaToggleOn,
  FaTools,
  FaWifi,
} from "react-icons/fa";
import { categories } from "@/data/categories";
import { StaggerGroup, StaggerItem } from "@/components/ui/AnimatedSectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";

const iconMap: Record<string, ElementType> = {
  fan: FaFan,
  bulb: FaLightbulb,
  wire: FaNetworkWired,
  switch: FaToggleOn,
  breaker: FaBolt,
  dbs: FaServer,
  solar: FaSun,
  smart: FaWifi,
  conduit: FaCogs,
  shutter: FaShieldAlt,
  earthing: FaPlug,
  other: FaBoxOpen,
  tools: FaTools,
  home: FaHome,
  satellite: FaSatelliteDish,
};
const fallbackIcon = FaBoxOpen;

export default function CategoryCards() {
  // Only surface categories that actually contain products.
  const visible = categories.filter((c) => c.count > 0);

  return (
    <section className="section-pad overflow-hidden bg-light/60">
      <div className="container-px">
        <SectionHeading
          eyebrow="Shop by Category"
          title={
            <>
              Browse Our <span className="text-accent">Range</span>
            </>
          }
          description="From ceiling fans and LED lighting to wires, circuit breakers, DBs and smart home — genuine brands stocked at Pearl Electric Solutions, Peshawar."
        />

        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((cat) => {
            const Icon = iconMap[cat.icon] ?? fallbackIcon;
            return (
              <StaggerItem key={cat.id} className="h-full">
                <Link
                  href={`/products?category=${cat.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
                >
                  {/* image */}
                  <div className="relative mb-5 h-36 overflow-hidden rounded-2xl bg-slate-100">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.shortName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-gradient">
                        <Icon className="text-5xl text-white/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent">
                        {cat.count} Products
                      </p>
                      <h3 className="mt-1 font-display text-[1.05rem] font-bold leading-snug text-primary">
                        {cat.shortName}
                      </h3>
                    </div>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg text-white"
                      style={{ background: cat.accent }}
                    >
                      <Icon />
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {cat.tagline}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all duration-300 group-hover:gap-3 group-hover:text-accent">
                    Shop {cat.shortName.split("(")[0].trim()} <FaArrowRight />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

import {
  FaHeadset,
  FaShieldAlt,
  FaStore,
  FaTags,
} from "react-icons/fa";
import type { ComponentType } from "react";

export interface WhyItem {
  icon: string;
  title: string;
  text: string;
}

const iconMap: Record<string, ComponentType> = {
  store: FaStore,
  shield: FaShieldAlt,
  tags: FaTags,
  headset: FaHeadset,
};

const defaults: WhyItem[] = [
  {
    icon: "store",
    title: "Trusted Local Store",
    text: "Serving Peshawar from two shops since 2015.",
  },
  {
    icon: "shield",
    title: "100% Genuine Products",
    text: "Royal, Pak Fan, Philips, Schneider, AGE & more.",
  },
  {
    icon: "tags",
    title: "Honest Pricing",
    text: "Best retail & cash prices, no hidden charges.",
  },
  {
    icon: "headset",
    title: "Expert After-Sales Support",
    text: "Warranty help & honest buying advice.",
  },
];

export default function WhyChoose({
  heading,
  items,
}: {
  heading?: string;
  items?: WhyItem[];
}) {
  const list = items && items.length ? items : defaults;
  return (
    <section className="bg-light/50 py-12 md:py-16">
      <div className="container-px">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
            Why Choose Pearl Electric?
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
            {heading || "Your Trusted Electrical Partner"}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item) => {
            const Icon = iconMap[item.icon] ?? FaStore;
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-[#E11D2A]/30 hover:shadow-lg"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E11D2A]/10 text-2xl text-[#E11D2A] transition group-hover:bg-[#E11D2A] group-hover:text-white">
                  <Icon />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

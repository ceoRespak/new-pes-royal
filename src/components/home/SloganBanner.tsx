import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export interface SloganContent {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const defaults: SloganContent = {
  eyebrow: "Fans · Lighting · Wires · Protection · Smart Home",
  title: "Everything Electrical for",
  highlight: "Every Space & Season",
  description:
    "From one ceiling fan to a complete building installation — genuine products, honest prices and trusted advice at Pearl Electric Solutions, Peshawar.",
  ctaLabel: "Explore Products",
  ctaHref: "/products",
};

/**
 * Full-width slogan banner (royalfans "Designed for every space…" style):
 * content editable via Admin → Site Content.
 */
export default function SloganBanner({ content }: { content?: SloganContent }) {
  const c = content && content.title ? content : defaults;
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#001a33] via-[#003366] to-[#001a33]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-[#E11D2A]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-px relative py-20 text-center md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-accent backdrop-blur">
          {c.eyebrow}
        </span>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
          {c.title}{" "}
          <span className="bg-gold-gradient bg-clip-text text-transparent">
            {c.highlight}
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75">
          {c.description}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={c.ctaHref || "/products"}
            className="group inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E11D2A]/30 transition hover:-translate-y-0.5 hover:bg-[#b8111f]"
          >
            {c.ctaLabel}
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white backdrop-blur transition hover:border-white hover:bg-white hover:text-primary"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}

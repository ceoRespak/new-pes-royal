import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";

interface PageHeroProps {
  title: string;
  highlight?: string;
  description?: string;
  crumb: string;
  image?: string;
}

/** Reusable gradient hero banner used on every inner page. */
export default function PageHero({
  title,
  highlight,
  description,
  crumb,
  image,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary-gradient pt-36 pb-24 text-white lg:pt-44">
      {/* decorative rings */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[3rem] border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
        />
      )}
      <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />

      <div className="container-px relative">
        <AnimatedSectionWrapper>
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 transition hover:text-accent"
            >
              <FaHome /> Home
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <span className="text-accent">{crumb}</span>
          </nav>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-[3.4rem]">
            {title}{" "}
            {highlight && (
              <span className="bg-gold-gradient bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {description}
            </p>
          )}
        </AnimatedSectionWrapper>
      </div>
    </section>
  );
}

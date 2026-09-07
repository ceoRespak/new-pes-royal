import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";

interface PageHeroProps {
  title: string;
  highlight?: string;
  description?: string;
  crumb: string;
  /** Optional hero image (e.g. category banner) shown as the header visual. */
  image?: string;
  /** Accessible name for the hero image (defaults to `crumb`). */
  imageAlt?: string;
}

/**
 * Reusable gradient hero banner used on every inner page. When `image` is
 * provided the hero becomes a split header — breadcrumb/title/description on
 * the left and the banner image in a framed card on the right (below the text
 * on mobile).
 */
export default function PageHero({
  title,
  highlight,
  description,
  crumb,
  image,
  imageAlt,
}: PageHeroProps) {
  const breadcrumb = (
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
  );

  const heading = (
    <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-[3.4rem]">
      {title}{" "}
      {highlight && (
        <span className="bg-accent-gradient bg-clip-text text-transparent">
          {highlight}
        </span>
      )}
    </h1>
  );

  const sub = description ? (
    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
      {description}
    </p>
  ) : null;

  return (
    <section className="relative overflow-hidden bg-primary-gradient pb-20 pt-36 text-white lg:pb-24 lg:pt-44">
      {/* decorative rings */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[3rem] border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-1 bg-accent-gradient" />

      <div className="container-px relative">
        {image ? (
          <div className="flex flex-col items-start gap-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl lg:max-w-xl">
              <AnimatedSectionWrapper>
                {breadcrumb}
                {heading}
                {sub}
              </AnimatedSectionWrapper>
            </div>
            <AnimatedSectionWrapper
              delay={0.12}
              className="w-full max-w-md shrink-0 self-center lg:mx-0 lg:w-[400px] xl:w-[460px]"
            >
              <div className="relative">
                <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-accent/20 blur-2xl" />
                <div className="overflow-hidden rounded-3xl border-4 border-white/15 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={imageAlt || crumb}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </AnimatedSectionWrapper>
          </div>
        ) : (
          <AnimatedSectionWrapper>
            {breadcrumb}
            {heading}
            {sub}
          </AnimatedSectionWrapper>
        )}
      </div>
    </section>
  );
}

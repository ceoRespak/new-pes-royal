import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
import Image from "next/image";
import {
  FaAward,
  FaBinoculars,
  FaBullseye,
  FaCheckCircle,
  FaEye,
  FaFlag,
  FaHandshake,
  FaHeart,
  FaShieldAlt,
} from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import AnimatedSectionWrapper, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/AnimatedSectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import CtaSection from "@/components/home/CtaSection";
import { getRuntimeSite } from "@/lib/content/runtime-site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Respak Express — Peshawar's trusted electrical supply shop since 2015. Approved distributor of Pakistan Cables, AGE & Fast; genuine fans, lighting, switchgear & smart home.",
  alternates: { canonical: "/about" },
};

const defaultMilestones = [
  {
    year: "2015",
    title: "The shop opens",
    text: "Respak Express opens its doors at Shop No. 1, Haroon Market, Karkhano Bazar, Peshawar — with one promise: genuine products at fair prices.",
  },
  {
    year: "Growing",
    title: "Becoming approved distributors",
    text: "We become approved distributors of Pakistan Cables, AGE Cables and Fast Cables, and start stocking premium brands like Philips, Schneider, ABB, Royal Fans and Pak Fan.",
  },
  {
    year: "Expanding",
    title: "A second branch",
    text: "To serve more customers we open a second outlet at Khyber Bazaar, Peshawar — bringing the same genuine stock and honest advice closer to you.",
  },
  {
    year: "Online",
    title: "Shop online, delivered same-day",
    text: "Our online store goes live with free same-day delivery across Peshawar, letting electricians, contractors and homeowners order from anywhere.",
  },
  {
    year: "Today",
    title: "Peshawar's trusted electric shop",
    text: "From wires and circuit breakers to fans, lighting, DBs and smart home — customers across the city rely on Respak Express every day.",
  },
];

const VALUE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  shield: FaShieldAlt,
  award: FaAward,
  heart: FaHeart,
  handshake: FaHandshake,
};

const defaultValues = [
  {
    icon: "shield",
    title: "Integrity",
    text: "Only genuine, authentic products — and honest advice, always.",
  },
  {
    icon: "award",
    title: "Quality Brands",
    text: "We stock brands we trust: Pakistan Cables, Schneider, ABB, Royal & more.",
  },
  {
    icon: "heart",
    title: "Customer Care",
    text: "Expert guidance for electricians, contractors and homeowners.",
  },
  {
    icon: "handshake",
    title: "Fair Partnership",
    text: "Fair prices and reliable supply for every customer and project.",
  },
];

const defaultStats = [
  { value: 10, suffix: "+", label: "Years in Peshawar" },
  { value: 13, suffix: "", label: "Product Categories" },
  { value: 100, suffix: "+", label: "Products Online" },
  { value: 12, suffix: "+", label: "Top Brands" },
];

const defaultIntroPoints = [
  "Approved distributor of Pakistan Cables, AGE & Fast Cables",
  "Genuine Philips, Schneider, ABB, Opal, Royal & Pak Fan products",
  "Expert advice for electricians, contractors & homeowners",
  "Free same-day delivery across Peshawar",
];

const defaultMissionVision = {
  mission: {
    title: "Our Mission",
    text: "To supply genuine, quality electrical products at fair prices — and help every customer choose exactly the right item through honest, expert advice.",
  },
  vision: {
    title: "Our Vision",
    text: "To be Peshawar's most trusted electric shop — the first stop for homeowners, electricians and contractors whenever they need quality electrical products.",
  },
  approach: {
    title: "Our Approach",
    text: "We stock only authentic brands, we advise honestly, and we stand behind every sale with same-day delivery and a simple 7-day return policy.",
  },
};

const DEFAULT_COMPANY_IMG = "/images/about/company.svg";

/** Brand copy used when nothing has been saved in Admin → Site Content → About. */
const DEFAULT_TITLE = "Peshawar's Most";
const DEFAULT_HIGHLIGHT = "Trusted Electric Shop";
const DEFAULT_SHORT =
  "Respak Express has been serving Peshawar since 2015. We provide high-quality electrical products ranging from wires and cables to smart home solutions.";
const DEFAULT_YEAR = "2015";
const DEFAULT_LOCATION = "Peshawar, Pakistan";
const DEFAULT_P1 =
  "Respak Express has been serving the people of Peshawar for over a decade from our location at Shop No. 1, Haroon Market, Karkhano Bazar. We are approved distributors of Pakistan Cables, AGE Cables, and Fast Cables, and stock premium brands including Philips, Schneider, ABB, Opal, Royal Fans, Voldam Fan, Lahore Fan, Pak Fan, BlueDot Smart Home, and more.";
const DEFAULT_P2 =
  "Whether you're an electrician, contractor, or homeowner, we provide expert advice and genuine products at the best prices in town. Now you can also shop online — browse our catalog, place your order, and get same-day delivery across Peshawar.";

export default function AboutPage() {
  const site = getRuntimeSite();
  const content = getContent();

  // Everything editable in ONE place: Admin → Site Content → About page.
  const raw = (content.about ?? {}) as {
    title?: string;
    highlight?: string;
    short?: string;
    image?: string;
    companyHeading?: string;
    sinceYear?: string;
    location?: string;
    p1?: string;
    p2?: string;
    mission?: { title?: string; text?: string };
    vision?: { title?: string; text?: string };
    approach?: { title?: string; text?: string };
    introPoints?: string[];
    values?: { icon: string; title: string; text: string }[];
    stats?: { value: number; suffix: string; label: string }[];
    milestones?: { year: string; title: string; text: string }[];
  };

  // Legacy: hero used to live under "inner page headings" → content.pages.about.
  const pgAbout = ((content.pages as Record<string, Record<string, string>> | undefined)?.["about"] ?? {}) as Record<string, string>;

  const ab = {
    title: raw.title || pgAbout.title || DEFAULT_TITLE,
    highlight: raw.highlight || pgAbout.highlight || DEFAULT_HIGHLIGHT,
    short: raw.short || DEFAULT_SHORT,
    image: raw.image || site.shopFront || DEFAULT_COMPANY_IMG,
    companyHeading: raw.companyHeading || site.shopName,
    sinceYear: raw.sinceYear || DEFAULT_YEAR,
    location: raw.location || DEFAULT_LOCATION,
    p1: raw.p1 || DEFAULT_P1,
    p2: raw.p2 || DEFAULT_P2,
    mission: {
      title: raw.mission?.title || defaultMissionVision.mission.title,
      text: raw.mission?.text || defaultMissionVision.mission.text,
    },
    vision: {
      title: raw.vision?.title || defaultMissionVision.vision.title,
      text: raw.vision?.text || defaultMissionVision.vision.text,
    },
    approach: {
      title: raw.approach?.title || defaultMissionVision.approach.title,
      text: raw.approach?.text || defaultMissionVision.approach.text,
    },
    introPoints: raw.introPoints?.length ? raw.introPoints : defaultIntroPoints,
    values: (raw.values?.length ? raw.values : defaultValues).map((v) => ({
      ...v,
      icon: VALUE_ICONS[v.icon] ?? FaShieldAlt,
    })),
    stats: raw.stats?.length ? raw.stats : defaultStats,
    milestones: raw.milestones?.length ? raw.milestones : defaultMilestones,
  };

  const stats = ab.stats;
  const values = ab.values;
  const milestones = ab.milestones;
  const introPoints = ab.introPoints;
  return (
    <>
      <PageHero
        crumb="About Us"
        title={ab.title}
        highlight={ab.highlight}
        description={ab.short}
      />

      {/* Company profile */}
      <section className="section-pad overflow-hidden bg-white">
        <div className="container-px grid items-center gap-14 lg:grid-cols-2">
          <AnimatedSectionWrapper>
            <div className="relative">
              <Image
                src={ab.image}
                alt="Respak Express shop front"
                width={640}
                height={480}
                className="w-full rounded-3xl object-cover shadow-card-hover"
              />
              <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-white shadow-card-hover">
                <FaFlag className="text-2xl text-accent" />
                <div>
                  <p className="font-display text-lg font-extrabold leading-none">
                    Since {ab.sinceYear}
                  </p>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-widest text-white/70">
                    {ab.location}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSectionWrapper>

          <div>
            <AnimatedSectionWrapper>
              <span className="eyebrow">
                <span className="h-px w-6 bg-accent" /> Company Profile
              </span>
              <h2 className="heading heading-underline">
                {ab.companyHeading} — trusted since{" "}
                <span className="text-accent">{ab.sinceYear}</span>
              </h2>
            </AnimatedSectionWrapper>
            <AnimatedSectionWrapper delay={0.1}>
              <p className="mt-6 leading-relaxed text-slate-600">{ab.p1}</p>
              <p className="mt-4 leading-relaxed text-slate-500">{ab.p2}</p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {introPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <FaCheckCircle className="mt-0.5 shrink-0 text-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </AnimatedSectionWrapper>
          </div>
        </div>
      </section>

      {/* Animated stats band */}
      <section className="relative overflow-hidden bg-primary-gradient py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg,#FF5A00 0 2px,transparent 2px 22px)",
          }}
        />
        <div className="container-px relative">
          <div className="grid grid-cols-2 gap-10 text-center lg:grid-cols-4">
            {stats.map((s, i) => (
              <AnimatedSectionWrapper key={s.label} delay={i * 0.08}>
                <p className="font-display text-4xl font-extrabold text-white md:text-5xl">
                  <AnimatedCounter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  {s.label}
                </p>
              </AnimatedSectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="section-pad bg-light/60">
        <div className="container-px">
          <AnimatedSectionWrapper className="text-center">
            <span className="eyebrow justify-center">
              <span className="h-px w-6 bg-accent" /> What Drives Us
              <span className="h-px w-6 bg-accent" />
            </span>
            <h2 className="heading mx-auto max-w-2xl heading-underline-center">
              Our Mission, Vision &amp; Core Values
            </h2>
          </AnimatedSectionWrapper>

          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
            <StaggerItem>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-2xl text-white transition group-hover:bg-accent-gradient group-hover:text-white">
                  <FaBullseye />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-primary">
                  {ab.mission.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {ab.mission.text}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem delay={0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-primary-gradient p-8 text-white shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient text-2xl text-white">
                  <FaEye />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-white">
                  {ab.vision.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {ab.vision.text}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem delay={0.2}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-2xl text-accent transition group-hover:bg-accent-gradient group-hover:text-white">
                  <FaBinoculars />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-primary">
                  {ab.approach.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {ab.approach.text}
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>

          <StaggerGroup className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex h-full items-start gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-lg text-primary">
                    <v.icon />
                  </span>
                  <div>
                    <h4 className="font-display text-base font-bold text-primary">
                      {v.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                      {v.text}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* History timeline */}
      <section className="section-pad overflow-hidden bg-white">
        <div className="container-px">
          <AnimatedSectionWrapper className="text-center">
            <span className="eyebrow justify-center">
              <span className="h-px w-6 bg-accent" /> Our Journey
              <span className="h-px w-6 bg-accent" />
            </span>
            <h2 className="heading mx-auto max-w-2xl heading-underline-center">
              Serving Peshawar since {ab.sinceYear}
            </h2>
          </AnimatedSectionWrapper>

          <div className="relative mx-auto mt-16 max-w-4xl">
            {/* vertical line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-accent via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <AnimatedSectionWrapper key={m.title}>
                  <div
                    className={`relative flex flex-col gap-4 pl-14 md:w-1/2 md:pl-0 ${
                      i % 2 === 0
                        ? "md:pr-14 md:text-right"
                        : "md:ml-auto md:pl-14"
                    }`}
                  >
                    {/* dot */}
                    <span
                      className={`absolute top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-accent text-[0.6rem] font-bold text-white shadow-accent ${
                        i % 2 === 0
                          ? "left-0 md:left-auto md:-right-4"
                          : "left-0 md:-left-4"
                      }`}
                    />
                    <div
                      className={`rounded-3xl border border-slate-100 bg-light/50 p-6 shadow-card transition hover:border-accent/40 ${
                        i % 2 === 0 ? "md:items-end" : ""
                      }`}
                    >
                      <span className="inline-block rounded-full bg-primary px-3 py-1 font-display text-xs font-bold text-white">
                        {m.year}
                      </span>
                      <h3 className="mt-3 font-display text-lg font-bold text-primary">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        {m.text}
                      </p>
                    </div>
                  </div>
                </AnimatedSectionWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}


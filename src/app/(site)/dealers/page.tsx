import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
import { FaHandshake, FaHeadset, FaStore } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import DealerDirectory from "@/components/DealerDirectory";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Dealers & Retail Network",
  description:
    "Find an authorized Pearl Electric Solutions dealer near you. Search our retail network across Peshawar, Mardan, Islamabad, Lahore and more.",
  alternates: { canonical: "/dealers" },
};

const perks = [
  {
    icon: FaStore,
    title: "200+ Retail Outlets",
    text: "A growing nationwide network of authorized dealers and stockists.",
  },
  {
    icon: FaHandshake,
    title: "Become a Dealer",
    text: "Partner with PES — attractive margins, training and marketing support.",
  },
  {
    icon: FaHeadset,
    title: "Dedicated Support",
    text: "Our dealer desk assists with stock, availability and after-sales.",
  },
];

export default function DealersPage() {
  const pg = (((getContent().pages ?? {}) as Record<string, Record<string, string>>)["dealers"] ?? {}) as Record<string, string>;
  return (
    <>
      <PageHero
        crumb="Dealers"
        title={pg.title || "Find a PES Dealer"}
        highlight={pg.highlight || "Near You"}
        description="Search our authorized retail network across Pakistan — or become a partner and grow with us."
      />

      {/* Perks */}
      <section className="section-pad pb-0">
        <div className="container-px">
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((p, i) => (
              <AnimatedSectionWrapper key={p.title} delay={i * 0.08}>
                <div className="flex h-full items-start gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-xl text-accent">
                    <p.icon />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-primary">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {p.text}
                    </p>
                  </div>
                </div>
              </AnimatedSectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="section-pad">
        <div className="container-px">
          <AnimatedSectionWrapper className="mb-10 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <span className="eyebrow">
                <span className="h-px w-6 bg-accent" /> Retail Network
              </span>
              <h2 className="heading heading-underline">
                Authorized <span className="text-accent">Outlets</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Want to stock PES in your store? Call{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="font-bold text-primary hover:underline"
              >
                {site.phone}
              </a>{" "}
              and ask for our dealer desk.
            </p>
          </AnimatedSectionWrapper>

          <DealerDirectory />
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
import {
  FaAward,
  FaCheckCircle,
  FaClock,
  FaFileDownload,
  FaFilePdf,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTools,
} from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import FaqAccordion from "@/components/FaqAccordion";
import AnimatedSectionWrapper, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/AnimatedSectionWrapper";
import { faqs } from "@/data/faqs";
import { serviceCenters } from "@/data/dealers";

export const metadata: Metadata = {
  title: "Support & Warranty",
  description:
    "Respak Express support — warranty policy, how to claim, FAQs, authorized service centers and downloadable specification sheets.",
  alternates: { canonical: "/support" },
};

const warrantyTiers = [
  {
    icon: FaAward,
    title: "100% Genuine Products",
    items: ["Philips, Schneider, ABB, Opal & more", "Approved distributor of Pakistan/AGE/Fast", "Brand warranty by the actual manufacturer"],
    color: "bg-primary-gradient",
  },
  {
    icon: FaAward,
    title: "Easy 7-Day Returns",
    items: ["Defective items returned within 7 days", "Original packaging required", "Replacement on stock / swift refunds"],
    color: "bg-gold-gradient",
  },
];

const steps = [
  {
    n: "01",
    title: "Keep your proof",
    text: "Retain your original purchase receipt and completed warranty card from the dealer.",
  },
  {
    n: "02",
    title: "Contact support",
    text: "Call our helpline or visit any authorized Respak Express service center with the product.",
  },
  {
    n: "03",
    title: "Quick resolution",
    text: "Our technicians diagnose and repair — or replace — the product under warranty.",
  },
];

const downloads = [
  { label: "Complete Product Price Catalogue (PDF)", url: "/downloads/pes-catalogue.pdf", size: "12 KB" },
  { label: "Returns, Delivery & Contact (PDF)", url: "/downloads/pes-return-policy.pdf", size: "1 KB" },
  { label: "About Us & Brands We Stock (PDF)", url: "/downloads/pes-about-brands.pdf", size: "3 KB" },
];

export default function SupportPage() {
  const pg = (((getContent().pages ?? {}) as Record<string, Record<string, string>>)["support"] ?? {}) as Record<string, string>;
  return (
    <>
      <PageHero
        crumb="Support"
        title={pg.title || "We've Got You"}
        highlight={pg.highlight || "Covered"}
        description="Warranty information, frequently asked questions, authorized service centers and useful downloads — everything you need in one place."
      />

      {/* Warranty */}
      <section id="warranty" className="section-pad scroll-mt-24 bg-white">
        <div className="container-px">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <AnimatedSectionWrapper>
                <span className="eyebrow">
                  <span className="h-px w-6 bg-accent" /> Warranty Policy
                </span>
                <h2 className="heading heading-underline">
                  Genuine products, simple{" "}
                  <span className="text-accent">returns &amp; support</span>
                </h2>
                <p className="mt-5 leading-relaxed text-slate-500">
                  We only stock authentic, brand-warranted products. If anything
                  arrives defective, return it within 7 days (original packaging
                  required) for a replacement or refund — no hassle.
                </p>
              </AnimatedSectionWrapper>

              <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2">
                {warrantyTiers.map((t) => (
                  <StaggerItem key={t.title}>
                    <div className="h-full rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.color} text-lg text-white`}
                      >
                        <t.icon />
                      </span>
                      <h3 className="mt-4 font-display text-base font-bold text-primary">
                        {t.title}
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {t.items.map((i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-slate-500"
                          >
                            <FaCheckCircle className="text-xs text-accent" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>

            {/* How to claim */}
            <AnimatedSectionWrapper delay={0.1}>
              <div className="rounded-3xl bg-primary-gradient p-8 text-white">
                <h3 className="font-display text-xl font-bold">
                  Returns &amp; product support
                </h3>
                <div className="mt-7 space-y-6">
                  {steps.map((s) => (
                    <div key={s.n} className="flex gap-5">
                      <span className="font-display text-3xl font-extrabold text-accent/80">
                        {s.n}
                      </span>
                      <div>
                        <h4 className="font-display text-base font-bold">{s.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">
                          {s.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                  <a
                    href="/contact"
                    className="rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-bold text-primary transition hover:brightness-105"
                  >
                    Register a Claim
                  </a>
                  <a
                    href="/contact"
                    className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-primary"
                  >
                    Talk to Support
                  </a>
                </div>
              </div>
            </AnimatedSectionWrapper>
          </div>
        </div>
      </section>

      {/* Service centers */}
      <section
        id="service-centers"
        className="section-pad scroll-mt-24 bg-light/60"
      >
        <div className="container-px">
          <AnimatedSectionWrapper className="text-center">
            <span className="eyebrow justify-center">
              <span className="h-px w-6 bg-accent" /> Service Network
              <span className="h-px w-6 bg-accent" />
            </span>
            <h2 className="heading mx-auto max-w-2xl heading-underline-center">
              Authorized Service Centers
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-slate-500">
              Find your nearest Respak Express service center for repairs, spare parts and
              warranty support.
            </p>
          </AnimatedSectionWrapper>

          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCenters.map((c) => (
              <StaggerItem key={c.id}>
                <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-lg text-accent">
                      <FaTools />
                    </span>
                    <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                      {c.city}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                    <FaMapMarkerAlt className="mt-0.5 shrink-0 text-accent" />
                    {c.address}
                  </p>
                  <div className="mt-auto space-y-1.5 pt-4 text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <FaPhoneAlt className="text-xs text-accent" />
                      <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                        {c.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClock className="text-xs text-accent" /> {c.timing}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-pad scroll-mt-24 bg-white">
        <div className="container-px">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <AnimatedSectionWrapper>
                <span className="eyebrow">
                  <span className="h-px w-6 bg-accent" /> Need Answers?
                </span>
                <h2 className="heading heading-underline">
                  Frequently Asked{" "}
                  <span className="text-accent">Questions</span>
                </h2>
                <p className="mt-5 leading-relaxed text-slate-500">
                  Quick answers to the questions we hear most often. Can&apos;t
                  find yours? Contact our support team — we&apos;re happy to
                  help.
                </p>
                <a href="/contact" className="btn-primary mt-6">
                  Ask a Question
                </a>
              </AnimatedSectionWrapper>
            </div>
            <AnimatedSectionWrapper delay={0.1}>
              <FaqAccordion faqs={faqs} />
            </AnimatedSectionWrapper>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section id="downloads" className="section-pad scroll-mt-24 bg-light/60">
        <div className="container-px">
          <AnimatedSectionWrapper className="text-center">
            <span className="eyebrow justify-center">
              <span className="h-px w-6 bg-accent" /> Resources
              <span className="h-px w-6 bg-accent" />
            </span>
            <h2 className="heading mx-auto max-w-2xl heading-underline-center">
              Downloads &amp; Resources
            </h2>
          </AnimatedSectionWrapper>

          <StaggerGroup className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {downloads.map((d) => (
              <StaggerItem key={d.url + d.label}>
                <a
                  href={d.url}
                  download
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                    <FaFilePdf />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-slate-700 group-hover:text-primary">
                      {d.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      PDF · {d.size}
                    </span>
                  </span>
                  <FaFileDownload className="text-lg text-slate-300 transition group-hover:text-accent" />
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

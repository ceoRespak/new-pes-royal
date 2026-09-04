import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
import {
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/ContactForm";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Respak Express — head office in Peshawar, sales & support, WhatsApp and a quick contact form. We reply within one business day.",
  alternates: { canonical: "/contact" },
};

const infoCards = [
  {
    icon: FaMapMarkerAlt,
    title: "Visit Us",
    lines: [site.address, site.contactAddress],
    href: "https://www.google.com/maps/search/?api=1&query=Karkhano+Bazar+Peshawar",
    cta: "Open in Maps",
  },
  {
    icon: FaPhoneAlt,
    title: "Call / WhatsApp",
    lines: [site.phone, site.contactPhone, "Mon – Sat · Same-day delivery"],
    href: `tel:${site.phone.replace(/\s/g, "")}`,
    cta: "Call Now",
  },
  {
    icon: FaEnvelope,
    title: "Email Us",
    lines: [site.email, site.salesEmail],
    href: `mailto:${site.email}`,
    cta: "Send Email",
  },
  {
    icon: FaClock,
    title: "Shop Hours",
    lines: [site.hours, "Free delivery within Peshawar"],
    href: "/dealers",
    cta: "Our Locations",
  },
];

export default function ContactPage() {
  const pg = (((getContent().pages ?? {}) as Record<string, Record<string, string>>)["contact"] ?? {}) as Record<string, string>;
  return (
    <>
      <PageHero
        crumb="Contact Us"
        title={pg.title || "Let's Start a"}
        highlight={pg.highlight || "Conversation"}
        description="Questions, quotations, partnerships or project support — the Respak Express team is ready to help. Reach out through any channel below."
      />

      {/* Info cards */}
      <section className="section-pad pb-0">
        <div className="container-px">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map((c, i) => (
              <AnimatedSectionWrapper key={c.title} delay={i * 0.07}>
                <div className="group flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card-hover">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-gradient text-xl text-white transition group-hover:bg-gold-gradient group-hover:text-primary">
                    <c.icon />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-primary">
                    {c.title}
                  </h3>
                  <div className="mt-2 flex-1 space-y-1">
                    {c.lines.filter(Boolean).map((l) => (
                      <p key={l} className="text-sm text-slate-500">
                        {l}
                      </p>
                    ))}
                  </div>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-4 text-sm font-bold text-accent underline-offset-4 hover:underline"
                  >
                    {c.cta} →
                  </a>
                </div>
              </AnimatedSectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="section-pad">
        <div className="container-px grid gap-10 lg:grid-cols-2">
          <AnimatedSectionWrapper>
            <span className="eyebrow">
              <span className="h-px w-6 bg-accent" /> Send a Message
            </span>
            <h2 className="heading heading-underline">We&apos;d love to hear from you</h2>
            <p className="mt-5 leading-relaxed text-slate-500">
              Fill in the form and our team will get back to you within one
              business day. Prefer instant answers? Message us on WhatsApp and a
              product specialist will respond right away.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
              <ContactForm />
            </div>
          </AnimatedSectionWrapper>

          <AnimatedSectionWrapper delay={0.1}>
            <div className="flex h-full flex-col">
              <span className="eyebrow">
                <span className="h-px w-6 bg-accent" /> Find Us
              </span>
              <h2 className="heading heading-underline">On the map</h2>
              <div className="mt-6 flex-1 overflow-hidden rounded-3xl border border-slate-100 shadow-card">
                <iframe
                  title="Respak Express location map"
                  src={site.mapEmbed}
                  className="h-full min-h-[420px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="mt-6 rounded-3xl bg-primary-gradient p-7 text-white">
                <h3 className="font-display text-lg font-bold">
                  Prefer to talk to a human?
                </h3>
                <p className="mt-1.5 text-sm text-white/75">
                  Our head office experience centre in Peshawar welcomes walk-in
                  customers every working day.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
                  >
                    WhatsApp Sales
                  </a>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-primary"
                  >
                    Call Helpline
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSectionWrapper>
        </div>
      </section>
    </>
  );
}

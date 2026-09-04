import Link from "next/link";
import { FaArrowRight, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";
import { site } from "@/data/site";

export default function CtaSection() {
  return (
    <section className="section-pad bg-light/60">
      <div className="container-px">
        <AnimatedSectionWrapper>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary-gradient px-7 py-14 text-center text-white sm:px-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg,#d4af37 0 2px,transparent 2px 26px)",
              }}
            />
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-primary">
                Ready to get started?
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight md:text-4xl">
                Visit a dealer, or let&apos;s talk about{" "}
                <span className="text-accent">your project</span>
              </h2>
              <p className="mt-4 text-white/75">
                Whether you need one fan or lighting for an entire building, our
                team is ready to help you find the perfect Respak Express solution.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/contact" className="btn-gold group">
                  Get a Free Quote
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/dealers" className="btn-light">
                  <FaMapMarkerAlt className="text-accent" /> Find a Dealer
                </Link>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 underline-offset-4 hover:text-accent hover:underline"
                >
                  <FaPhoneAlt className="text-accent" /> {site.phone}
                </a>
              </div>
            </div>
          </div>
        </AnimatedSectionWrapper>
      </div>
    </section>
  );
}

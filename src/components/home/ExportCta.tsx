import Link from "next/link";
import {
  FaArrowRight,
  FaBoxOpen,
  FaGlobe,
  FaHandshake,
  FaWhatsapp,
} from "react-icons/fa";
import { site } from "@/data/site";

const items = [
  {
    icon: FaBoxOpen,
    title: "Bulk Orders & Projects",
    text: "Whole-sale rates for contractors, electricians & builders.",
  },
  {
    icon: FaHandshake,
    title: "Dealer & Trade Enquiries",
    text: "Partner with us — genuine stock, reliable supply.",
  },
  {
    icon: FaGlobe,
    title: "Nationwide Shipping",
    text: "We courier orders safely all across Pakistan.",
  },
];

/** Royalfans-style closing "Export / Bulk" CTA band. */
export default function ExportCta() {
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
    "Hello Pearl Electric Solutions! I have a bulk / trade enquiry."
  )}`;
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-px">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="grid md:grid-cols-3">
            {items.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className={`p-8 ${i > 0 ? "border-t border-slate-200 md:border-l md:border-t-0" : ""}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E11D2A]/10 text-xl text-[#E11D2A]">
                  <Icon />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-5 bg-slate-900 px-8 py-7 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="font-display text-xl font-extrabold text-white">
                Ready to work together?
              </h3>
              <p className="mt-1 text-sm text-white/70">
                Talk to our team today — {site.phone}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b8111f]"
              >
                Contact Our Team <FaArrowRight />
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

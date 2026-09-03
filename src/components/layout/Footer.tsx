import Link from "next/link";
import {
  FaEnvelope,
  FaFacebookF,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegClock,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { categories } from "@/data/categories";
import { navLinks, site as siteBase } from "@/data/site";

const supportLinks = [
  { label: "Return Policy", href: "/support#warranty" },
  { label: "FAQs", href: "/support#faq" },
  { label: "Service & Support", href: "/support#service-centers" },
  { label: "Visit the Shop", href: "/contact" },
  { label: "Get in Touch", href: "/contact" },
];

const socialIcons = [
  { href: siteBase.social.facebook, label: "Facebook", Icon: FaFacebookF },
  { href: siteBase.social.whatsapp, label: "WhatsApp", Icon: FaWhatsapp },
].filter((s) => s.href);

export default function Footer({
  info,
}: {
  info?: {
    phone?: string;
    email?: string;
    hours?: string;
    address?: string;
    footerAbout?: string;
    announcement?: string;
  };
}) {
  const site = {
    ...siteBase,
    phone: info?.phone || siteBase.phone,
    email: info?.email || siteBase.email,
    hours: info?.hours || siteBase.hours,
    address: info?.address || siteBase.address,
    footerAbout:
      info?.footerAbout ||
      "Pearl Electric Solutions crafts premium fans, LED lighting, smart sensors and trusted electrical accessories. Proudly powering homes and businesses across Pakistan since 2015.",
  };
  return (
    <footer className="relative overflow-hidden bg-[#001a33] text-slate-300">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />

      {/* Newsletter band */}
      <div className="relative border-b border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-6 py-10 lg:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              Join the <span className="text-accent">PES family</span>
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              New product launches, offers and energy-saving tips — straight to
              your inbox.
            </p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="container-px relative grid grid-cols-2 gap-10 py-14 md:grid-cols-3 lg:grid-cols-5">
        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <Link href="/">
            <Logo variant="light" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            {site.footerAbout}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 shrink-0 text-accent" />
              <span>{site.address}</span>
            </p>
            <p className="flex items-center gap-3">
              <FaPhoneAlt className="shrink-0 text-accent" />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                {site.phone}
              </a>
            </p>
            <p className="flex items-center gap-3">
              <FaEnvelope className="shrink-0 text-accent" />
              <a href={`mailto:${site.email}`} className="hover:text-accent">
                {site.email}
              </a>
            </p>
            <p className="flex items-center gap-3">
              <FaRegClock className="shrink-0 text-accent" />
              <span>{site.hours}</span>
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
            Quick Links
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-accent">
                  <span className="h-px w-3 bg-accent/50 transition-all group-hover:w-4 group-hover:bg-accent" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
            Categories
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.id}`}
                  className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-accent"
                >
                  <span className="h-px w-3 bg-accent/50 transition-all group-hover:w-4 group-hover:bg-accent" />
                  {c.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/products"
                className="font-semibold text-accent transition hover:text-accent-300"
              >
                View all products →
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
            Support
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-slate-400 transition hover:text-accent"
                >
                  <span className="h-px w-3 bg-accent/50 transition-all group-hover:w-4 group-hover:bg-accent" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-2.5">
            {socialIcons.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm text-slate-300 transition hover:border-accent hover:bg-accent hover:text-primary"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Pearl Electric Solutions (PES). All
            rights reserved.
          </p>
          <p className="flex items-center gap-4">
            <Link href="/support#warranty" className="transition hover:text-accent">
              Privacy
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/support#warranty" className="transition hover:text-accent">
              Terms
            </Link>
            <span className="text-white/20">|</span>
            <span>
              Crafted with <span className="text-accent">♥</span> in Pakistan
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

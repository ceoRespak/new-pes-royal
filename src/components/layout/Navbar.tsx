"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBars,
  FaChevronDown,
  FaEnvelope,
  FaFacebookF,
  FaPhoneAlt,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "./Logo";
import { navLinks, site as siteBase, categoryNavLinks } from "@/data/site";
import { cn } from "@/lib/utils";

export default function Navbar({
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
  };
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    setCatOpen(false);
  }, [pathname]);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Decide whether the header sits over the (dark) hero or on a solid surface.
  const onHero = isHome && !scrolled;
  const solid = scrolled || !isHome;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top utility bar */}
      <div
        className={cn(
          "hidden border-b transition-colors duration-300 lg:block",
          solid
            ? "border-white/10 bg-primary text-white/80"
            : "border-white/10 bg-primary/60 text-white/80 backdrop-blur"
        )}
      >
        <div className="container-px flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 transition hover:text-accent"
            >
              <FaPhoneAlt className="text-accent" /> {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2 transition hover:text-accent"
            >
              <FaEnvelope className="text-accent" /> {site.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden tracking-wide text-white/60 xl:inline">
              {site.hours}
            </span>
            <div className="flex items-center gap-3 text-sm">
              {[
                { url: site.social.facebook, icon: <FaFacebookF />, label: "Facebook" },
                { url: site.social.whatsapp, icon: <FaWhatsapp />, label: "WhatsApp" },
              ]
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    aria-label={s.label}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-accent"
                  >
                    {s.icon}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "transition-all duration-500",
          solid
            ? "bg-white/95 shadow-lg shadow-primary/5 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="container-px flex items-center justify-between py-3">
          <Link href="/" aria-label="Respak Express — Home">
            <Logo variant={solid ? "dark" : "light"} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={
                  link.href === "/products"
                    ? () => setCatOpen(true)
                    : () => setCatOpen(false)
                }
                onMouseLeave={
                  link.href === "/products" ? () => setCatOpen(false) : undefined
                }
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  solid
                    ? "text-slate-600 hover:text-primary"
                    : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
                {link.href === "/products" && (
                  <FaChevronDown
                    className={cn(
                      "ml-1 inline-block text-[0.6rem] transition-transform duration-300",
                      catOpen && "rotate-180"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100",
                    isActive(link.href) && "scale-x-100"
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact"
              className={cn(
                "rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                solid
                  ? "border-primary/15 text-primary hover:border-primary hover:bg-primary hover:text-white"
                  : "border-white/40 text-white hover:border-white hover:bg-white hover:text-primary"
              )}
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg text-2xl transition lg:hidden",
              solid ? "text-primary" : "text-white"
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Category dropdown */}
      <AnimatePresence>
        {catOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
            className="absolute left-1/2 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-primary/10 lg:block"
          >
            {categoryNavLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setCatOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-primary/5 hover:text-primary"
              >
                {c.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-slate-100 pt-1">
              <Link
                href="/products"
                onClick={() => setCatOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/10"
              >
                View All Products →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[19rem] max-w-[85vw] flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <Logo variant="dark" />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-primary"
                >
                  <FaTimes />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "mb-1 flex items-center justify-between rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition",
                      isActive(link.href)
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-primary/5"
                    )}
                  >
                    {link.label}
                    {link.href === "/products" && (
                      <FaChevronDown className="text-xs opacity-60" />
                    )}
                  </Link>
                ))}

                <p className="mt-5 px-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Shop by Category
                </p>
                <div className="mt-2 space-y-1">
                  {categoryNavLinks.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="space-y-3 border-t border-slate-100 px-5 py-5">
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white"
                >
                  <FaWhatsapp /> WhatsApp Us
                </a>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white"
                >
                  <FaPhoneAlt /> {site.phone}
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

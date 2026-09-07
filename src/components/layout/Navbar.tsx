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
  FaShoppingCart,
  FaTimes,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "./Logo";
import { useCart } from "@/components/cart/CartProvider";
import { useSite } from "@/components/site/SiteProvider";
import type { CategoryMeta } from "@/types";
import { categories as snapshotCategories } from "@/data/categories";
import { navLinks } from "@/data/site";
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
  // Resolve admin-editable site settings (falls back to the static defaults).
  const rt = useSite();
  const site = {
    ...rt,
    phone: info?.phone || rt.phone,
    email: info?.email || rt.email,
    hours: info?.hours || rt.hours,
    address: info?.address || rt.address,
  };
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [account, setAccount] = useState<{ name: string } | null>(null);
  const isHome = pathname === "/";

  // Signed-in customer (storefront account) → show Login / account link.
  useEffect(() => {
    let on = true;
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (on && d?.ok && d.customer) setAccount(d.customer);
      })
      .catch(() => {});
    return () => {
      on = false;
    };
  }, []);

  // Full live category list for the mega-menu (fetched once, snapshot fallback).
  const [liveCats, setLiveCats] = useState<CategoryMeta[] | null>(null);
  useEffect(() => {
    let on = true;
    fetch("/api/shop/categories", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (on && d && Array.isArray(d.categories)) setLiveCats(d.categories);
      })
      .catch(() => {
        /* keep snapshot fallback */
      });
    return () => {
      on = false;
    };
  }, []);

  const menuCats: CategoryMeta[] = (liveCats ?? snapshotCategories).filter(
    (c) => c.count > 0
  );

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
        <div className="container-px flex items-center justify-between py-2">
          <Link
            href="/"
            aria-label="Respak Express — Home"
            // The stretched logo is coloured (navy/orange) so over the dark
            // transparent hero it sits on a small white chip for visibility.
            className={cn(
              "rounded-xl transition",
              !solid && "bg-white/95 px-2 py-1 shadow-sm"
            )}
          >
            <Logo variant="dark" heightClass="h-11 sm:h-12 lg:h-14" />
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
            {/* Account (customer login) */}
            <Link
              href={account ? "/account" : "/login"}
              aria-label={account ? "My account" : "Login"}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition",
                solid
                  ? "text-slate-600 hover:text-primary"
                  : "text-white/90 hover:text-white"
              )}
            >
              <FaUser className="text-base" />
              <span className="hidden xl:inline">
                {account ? account.name.split(" ")[0] : "Login"}
              </span>
            </Link>
            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart, ${ready ? count : 0} items`}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg transition-all duration-300",
                solid
                  ? "border-primary/15 text-primary hover:border-primary hover:bg-primary hover:text-white"
                  : "border-white/40 text-white hover:border-white hover:bg-white hover:text-primary"
              )}
            >
              <FaShoppingCart />
              {ready && count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5A00] px-1 text-[0.62rem] font-extrabold text-white shadow">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
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

      {/* Category dropdown (mega menu) */}
      <AnimatePresence>
        {catOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
            className="absolute left-1/2 hidden w-[30rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl shadow-primary/10 lg:block"
          >
            <p className="mb-2 px-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-400">
              Shop by Category
            </p>
            <div className="grid max-h-[60vh] grid-cols-2 gap-1 overflow-y-auto pr-1">
              {menuCats.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  onClick={() => setCatOpen(false)}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-primary/5 hover:text-primary"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: c.accent ?? "#002B6B" }}
                  />
                  <span className="truncate">{c.shortName || c.name}</span>
                  {c.count > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-slate-400 group-hover:bg-white/70">
                      {c.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="mt-2 border-t border-slate-100 pt-2">
              <Link
                href="/products"
                onClick={() => setCatOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-bold text-accent transition hover:bg-accent/10"
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
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
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
                <Link
                  href={account ? "/account" : "/login"}
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 text-[0.95rem] font-bold text-primary"
                >
                  <FaUser className="text-lg" />
                  {account
                    ? `My Account · ${account.name.split(" ")[0]}`
                    : "Login / Register"}
                </Link>
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
                  {menuCats.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10"
                    >
                      {c.shortName || c.name}
                      {c.count > 0 && (
                        <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-slate-500">
                          {c.count}
                        </span>
                      )}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-2 text-sm font-extrabold text-[#FF5A00]"
                  >
                    View All Products →
                  </Link>
                </div>
              </nav>

              <div className="space-y-3 border-t border-slate-100 px-5 py-5">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="relative flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-bold text-white"
                >
                  <FaShoppingCart />
                  {ready && count > 0 ? `Cart (${count})` : "Cart"}
                </Link>
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

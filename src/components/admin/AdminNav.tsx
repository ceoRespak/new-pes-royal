"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBoxOpen,
  FaChartPie,
  FaCogs,
  FaExternalLinkAlt,
  FaTags,
  FaUsers,
} from "react-icons/fa";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FaChartPie },
  { href: "/admin/products", label: "Products", icon: FaBoxOpen },
  { href: "/admin/categories", label: "Categories", icon: FaTags },
  { href: "/admin/content", label: "Site Content", icon: FaCogs },
  { href: "/admin/settings", label: "Live Store Settings", icon: FaTags },
  { href: "/admin/users", label: "Admin Users", icon: FaUsers },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 space-y-1 px-3">
      {links.map((l) => {
        const active =
          pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-gold-gradient text-primary"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <l.icon /> {l.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <FaExternalLinkAlt /> View Site
      </Link>
    </nav>
  );
}

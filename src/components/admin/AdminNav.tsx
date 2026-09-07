"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBoxOpen,
  FaChartPie,
  FaClipboardList,
  FaCogs,
  FaExternalLinkAlt,
  FaTags,
  FaUsers,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { AdminSection } from "@/lib/admin/users-store";

const ALL_LINKS: {
  section: AdminSection;
  href: string;
  label: string;
  icon: (typeof FaChartPie);
}[] = [
  { section: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: FaChartPie },
  { section: "products", href: "/admin/products", label: "Products", icon: FaBoxOpen },
  { section: "orders", href: "/admin/orders", label: "Orders", icon: FaClipboardList },
  { section: "categories", href: "/admin/categories", label: "Categories", icon: FaTags },
  { section: "content", href: "/admin/content", label: "Site Content", icon: FaCogs },
  { section: "settings", href: "/admin/settings", label: "Live Store Settings", icon: FaTags },
  { section: "users", href: "/admin/users", label: "Admin Users", icon: FaUsers },
];

export default function AdminNav({
  sections,
}: {
  /** Sections this admin may open. */
  sections?: AdminSection[];
}) {
  const pathname = usePathname();
  const visible = ALL_LINKS.filter(
    (l) => !sections || sections.includes(l.section)
  );
  return (
    <nav className="mt-6 space-y-1 px-3">
      {visible.map((l) => {
        const active =
          pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-accent-gradient text-white"
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

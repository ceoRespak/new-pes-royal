import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaHome, FaUserCircle } from "react-icons/fa";
import CustomerAuth from "@/components/account/CustomerAuth";

export const metadata: Metadata = {
  title: "Login | Respak Express",
  description:
    "Sign in or create your Respak Express account to save your details and order faster.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams?.next;

  return (
    <>
      <div className="border-b border-slate-100 bg-light/70 pb-6 pt-24 lg:pt-32">
        <div className="container-px">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link href="/" className="flex items-center gap-1.5 hover:text-primary">
              <FaHome /> Home
            </Link>
            <FaChevronRight className="text-[0.55rem]" />
            <span className="text-primary">My Account</span>
          </nav>
        </div>
      </div>

      <section className="section-pad bg-white">
        <div className="container-px">
          <CustomerAuth next={next} />
        </div>
      </section>
    </>
  );
}

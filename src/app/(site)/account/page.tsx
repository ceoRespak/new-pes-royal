import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaChevronRight, FaHome } from "react-icons/fa";
import { getCurrentCustomer } from "@/lib/customers/session";
import { getAllOrders } from "@/lib/orders/store";
import type { Order } from "@/types";
import AccountDashboard from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My Account | Respak Express",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?next=/account");
  }

  const orders: Order[] = getAllOrders()
    .filter((o) => o.customerId === customer.id)
    .slice(0, 30);

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
          <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-900">
            My Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile &amp; saved address, and track your orders.
          </p>
        </div>
      </div>

      <section className="section-pad bg-light/40">
        <div className="container-px">
          <AccountDashboard
            customer={{
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              city: customer.city,
              address: customer.address,
            }}
            orders={orders}
          />
        </div>
      </section>
    </>
  );
}

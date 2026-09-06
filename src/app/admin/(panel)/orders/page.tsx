import type { Metadata } from "next";
import OrdersManager from "@/components/admin/OrdersManager";

export const metadata: Metadata = { title: "Orders | Admin" };

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage online orders, update statuses and confirm payments.
        </p>
      </header>
      <OrdersManager />
    </div>
  );
}

import type { Metadata } from "next";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { getUsers } from "@/lib/admin/users-store";
import { backendGet } from "@/lib/admin/backend";
import { requireSection, currentAccess } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Users | Admin" };

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  requireSection("users");
  const current = currentAccess();
  const users = getUsers();

  // Category names for assigning per-user product scope.
  const catRes = await backendGet<{
    categories?: { id?: string; name?: string }[];
  }>("/api/categories").catch(() => null);
  const rawCats = Array.isArray(catRes?.data)
    ? catRes?.data
    : ((catRes?.data as { categories?: unknown } | null)?.categories ?? []);
  const allCategories = (rawCats as { name?: string }[])
    .map((c) => c.name)
    .filter((x): x is string => Boolean(x));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Admin Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Who can sign in to this admin panel, what role they have, and which
          sections / product categories they may manage.
        </p>
      </header>
      <AdminUsersManager
        initial={users}
        allCategories={allCategories}
        currentRole={current?.role ?? "manager"}
        currentIsOwner={current?.role === "owner"}
      />
    </div>
  );
}


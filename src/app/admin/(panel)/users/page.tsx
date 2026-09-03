import type { Metadata } from "next";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { getUsers } from "@/lib/admin/users-store";

export const metadata: Metadata = { title: "Users | Admin" };

export default function AdminUsersPage() {
  const users = getUsers();
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Admin Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Who can sign in to this admin panel. Passwords are stored hashed on
          this site only.
        </p>
      </header>
      <AdminUsersManager initial={users} />
    </div>
  );
}

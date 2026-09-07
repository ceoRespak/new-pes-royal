import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminBackendStatus from "@/components/admin/AdminBackendStatus";
import {
  ADMIN_COOKIE,
  validateSession,
} from "@/lib/admin/session";
import { accessFromToken } from "@/lib/admin/access";
import { isOwnerLike } from "@/lib/admin/users-store";
import { FaUserShield, FaUserTie, FaUserCog } from "react-icons/fa";

export const metadata = { title: "Admin | Respak Express" };

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
};
const ROLE_ICON = { owner: FaUserShield, admin: FaUserTie, manager: FaUserCog };

export default function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!validateSession(token)) redirect("/admin/login");

  const access = accessFromToken(token) ?? null;
  const sections = access?.sections ?? [];
  const RoleIcon = access ? ROLE_ICON[access.role] : FaUserCog;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#001a33] text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src="/logo.png"
              alt="Respak Express"
              fill
              className="object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">Respak Express</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-white/50">
              Admin Panel
            </p>
          </div>
        </div>
        {access && (
          <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <RoleIcon
              className={
                access.role === "owner"
                  ? "text-amber-400"
                  : access.role === "admin"
                    ? "text-sky-300"
                    : "text-emerald-300"
              }
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-white">{access.name}</p>
              <p className="text-[0.6rem] uppercase tracking-widest text-white/50">
                {ROLE_LABEL[access.role] ?? access.role}
                {access.isMaster ? " · Master" : ""}
              </p>
            </div>
          </div>
        )}
        <div className="flex-1">
          <AdminNav sections={sections} />
        </div>
        <div className="border-t border-white/10 p-3">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-[#001a33] px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded">
            <Image src="/logo.png" alt="Respak Express" fill className="object-contain" />
          </div>
          <span className="font-display text-sm font-bold">Respak Express</span>
        </div>
        <AdminLogoutButton />
      </div>

      {/* Content */}
      <div className="w-full lg:pl-64">
        {/* mobile nav */}
        <div className="border-b border-slate-200 bg-white px-4 pb-2 pt-16 lg:hidden">
          <AdminNav sections={sections} />
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <AdminBackendStatus isOwner={access ? isOwnerLike(access.role) : false} />
          {children}
        </main>
      </div>
    </div>
  );
}

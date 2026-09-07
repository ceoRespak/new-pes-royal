"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBoxOpen,
  FaChartPie,
  FaClipboardList,
  FaCogs,
  FaPlus,
  FaShieldAlt,
  FaTags,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCog,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import type { AdminRole, AdminSection } from "@/lib/admin/users-store";

export interface AdminUserPublic {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  sections: AdminSection[];
  categoryScope: string[] | null;
  createdAt: string;
}

const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
};
const ROLE_DESC: Record<AdminRole, string> = {
  owner: "Full control — every section, every category, manages users.",
  admin: "Full store access — sections on/off below, all categories.",
  manager: "Staff — only the sections & product categories you assign.",
};
const ROLE_ICON = {
  owner: FaUserShield,
  admin: FaUserCog,
  manager: FaUser,
};

const SECTION_META: { key: AdminSection; label: string; icon: typeof FaCogs }[] = [
  { key: "dashboard", label: "Dashboard", icon: FaChartPie },
  { key: "products", label: "Products", icon: FaBoxOpen },
  { key: "orders", label: "Orders", icon: FaClipboardList },
  { key: "categories", label: "Categories", icon: FaTags },
  { key: "content", label: "Site Content", icon: FaCogs },
  { key: "settings", label: "Live Store Settings", icon: FaCogs },
  { key: "users", label: "Admin Users", icon: FaUsers },
];

/** Sections a role defaults to when none stored. */
const ROLE_DEFAULT_SECTIONS: Record<Exclude<AdminRole, "owner">, AdminSection[]> = {
  admin: ["dashboard", "products", "orders", "categories", "content", "settings"],
  manager: ["dashboard", "products"],
};

function defaultSections(role: AdminRole): AdminSection[] {
  if (role === "owner") return SECTION_META.map((s) => s.key);
  return ROLE_DEFAULT_SECTIONS[role];
}

const ALL_SECTION_KEYS = SECTION_META.map((s) => s.key);

interface FormState {
  username: string;
  name: string;
  role: AdminRole;
  password: string;
  sections: AdminSection[];
  categoryScope: string[] | null;
}

function emptyForm(role: AdminRole): FormState {
  return {
    username: "",
    name: "",
    role,
    password: "",
    sections: defaultSections(role),
    categoryScope: null,
  };
}

function toForm(u: AdminUserPublic): FormState {
  return {
    username: u.username,
    name: u.name,
    role: u.role,
    password: "",
    sections: u.sections?.length ? u.sections : defaultSections(u.role),
    categoryScope: u.categoryScope ?? null,
  };
}

export default function AdminUsersManager({
  initial,
  allCategories = [],
  currentIsOwner = true,
}: {
  initial: AdminUserPublic[];
  /** All category names in the store (for the product scope picker). */
  allCategories?: string[];
  /** Role of the signed-in user (used by the admin page). */
  currentRole?: AdminRole;
  /** Whether the signed-in user is an owner. */
  currentIsOwner?: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserPublic[]>(initial);
  const [editing, setEditing] = useState<AdminUserPublic | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm("manager"));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 5000);
  }
  function openCreate() {
    setEditing(null);
    setForm(emptyForm("manager"));
    setCreating(true);
  }
  function openEdit(u: AdminUserPublic) {
    setCreating(false);
    setEditing(u);
    setForm(toForm(u));
  }
  function close() {
    setCreating(false);
    setEditing(null);
    setForm(emptyForm("manager"));
  }

  // Owner rows can only be edited by an owner.
  const locked = !!editing && editing.role === "owner" && !currentIsOwner;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Save failed");
        setBusy(false);
        return;
      }
      flash("ok", editing ? "User updated ✓" : "User created ✓");
      close();
      router.refresh();
    } catch {
      flash("err", "Network error during save.");
    }
    setBusy(false);
  }

  async function remove(u: AdminUserPublic) {
    if (!window.confirm(`Delete user "${u.username}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Delete failed");
      } else {
        flash("ok", "User deleted");
        router.refresh();
      }
    } catch {
      flash("err", "Network error during delete.");
    }
    setBusy(false);
  }

  function toggleSection(key: AdminSection) {
    setForm((f) => ({
      ...f,
      sections: f.sections.includes(key)
        ? f.sections.filter((s) => s !== key)
        : [...f.sections, key],
    }));
  }

  function toggleCategory(name: string) {
    setForm((f) => {
      const scope = f.categoryScope ?? [];
      const next = scope.includes(name)
        ? scope.filter((c) => c !== name)
        : [...scope, name];
      return { ...f, categoryScope: next.length ? next : null };
    });
  }

  const canPickProducts = form.sections.includes("products");

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          {users.length} staff account{users.length === 1 ? "" : "s"} on this
          panel. Owners manage accounts &amp; roles.
          {!currentIsOwner && (
            <span className="mt-1 block font-semibold text-amber-600">
              You need Owner access to change roles.
            </span>
          )}
        </p>
        {currentIsOwner && (
          <button onClick={openCreate} className="btn-primary !py-2.5 text-sm">
            <FaPlus /> Add user
          </button>
        )}
        {notice && (
          <p
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
              notice.kind === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {/* list */}
      <div className="mt-5 space-y-3">
        {users.map((u) => {
          const Icon = ROLE_ICON[u.role];
          const isOwner = u.role === "owner";
          const scopeText =
            u.role === "owner" || !u.categoryScope
              ? "All product categories"
              : u.categoryScope.length === 0
                ? "No product categories"
                : u.categoryScope.join(", ");
          return (
            <div
              key={u.id}
              className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm hover:bg-slate-50/60"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  isOwner
                    ? "bg-amber-100 text-amber-600"
                    : u.role === "admin"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-700">
                  {u.name}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    @{u.username}
                  </span>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ${
                      isOwner
                        ? "bg-amber-100 text-amber-700"
                        : u.role === "admin"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>
                    {u.sections?.length ?? 0} section
                    {(u.sections?.length ?? 0) === 1 ? "" : "s"}
                  </span>
                  <span className="text-slate-200">·</span>
                  <span className="max-w-[24rem] truncate">{scopeText}</span>
                  <span className="text-slate-200">·</span>
                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(currentIsOwner || !isOwner) && (
                  <button
                    onClick={() => openEdit(u)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary transition hover:bg-primary hover:text-white"
                    title="Edit"
                  >
                    <FaUserCog />
                  </button>
                )}
                {currentIsOwner && !isOwner && (
                  <button
                    onClick={() => remove(u)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
            No custom users yet — the master login works until you add one.
          </div>
        )}
      </div>

      {/* modal */}
      {(creating || editing) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={close}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                <FaShieldAlt className="text-accent" />
                {editing ? "Edit user" : "Add user"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Identity */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="field">Name (optional)</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="inp"
                    placeholder="e.g. Chandelier Manager"
                  />
                </label>
                <label className="block">
                  <span className="field">Username *</span>
                  <input
                    required
                    disabled={locked}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="inp"
                    placeholder="e.g. lighting.manager"
                  />
                </label>
              </div>
              <label className="block">
                <span className="field">
                  {editing ? "New password (leave blank to keep)" : "Password *"}
                </span>
                <input
                  required={!editing}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="inp"
                  placeholder="min. 6 characters"
                />
              </label>

              {/* Role */}
              <div>
                <span className="field">Role</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["manager", "admin", "owner"] as AdminRole[]).map((r) => {
                    const RIcon = ROLE_ICON[r];
                    const disabled = locked || (r === "owner" && !currentIsOwner);
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            role: r,
                            sections: defaultSections(r),
                            // managers keep a category scope; admin/owner get all
                            categoryScope: r === "manager" ? f.categoryScope : null,
                          }))
                        }
                        className={`rounded-2xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          form.role === r
                            ? r === "owner"
                              ? "border-amber-400 bg-amber-50"
                              : r === "admin"
                                ? "border-indigo-400 bg-indigo-50"
                                : "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <RIcon
                          className={
                            r === "owner"
                              ? "text-amber-500"
                              : r === "admin"
                                ? "text-indigo-500"
                                : "text-emerald-500"
                          }
                        />
                        <span className="ml-1.5 text-sm font-bold text-slate-700">
                          {ROLE_LABEL[r]}
                        </span>
                        <span className="mt-1 block text-[0.62rem] leading-snug text-slate-500">
                          {ROLE_DESC[r]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {locked && (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Owner accounts can only be edited by an Owner.
                  </p>
                )}
              </div>

              {/* Sections (owners always have all) */}
              {form.role !== "owner" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Admin sections (on/off)
                    </span>
                    <button
                      type="button"
                      className="text-[0.65rem] font-bold text-primary hover:underline"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          sections:
                            f.sections.length === ALL_SECTION_KEYS.length
                              ? []
                              : [...ALL_SECTION_KEYS],
                        }))
                      }
                    >
                      {form.sections.length === ALL_SECTION_KEYS.length
                        ? "Turn all off"
                        : "Turn all on"}
                    </button>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {SECTION_META.map((s) => {
                      const on = form.sections.includes(s.key);
                      return (
                        <label
                          key={s.key}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${
                            on
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleSection(s.key)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <s.icon
                            className={on ? "text-emerald-600" : "text-slate-400"}
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            {s.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[0.65rem] text-slate-400">
                    Toggle what this account can open in the admin panel. When
                    &quot;Products&quot; is on, also pick their product
                    categories below.
                  </p>
                </div>
              )}

              {/* Product category scope */}
              {form.role !== "owner" && canPickProducts && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Product categories they manage
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, categoryScope: null }))}
                      className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold transition ${
                        form.categoryScope === null
                          ? "bg-primary text-white"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      All categories
                    </button>
                  </div>
                  <p className="mb-2 text-[0.65rem] text-slate-400">
                    {form.categoryScope === null
                      ? "Full product access — all categories."
                      : "They will see & edit ONLY the selected categories."}
                  </p>
                  {form.categoryScope !== null && (
                    <div className="flex flex-wrap gap-1.5">
                      {allCategories.map((c) => {
                        const on = form.categoryScope?.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCategory(c)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                              on
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                      {allCategories.length === 0 && (
                        <span className="text-xs text-slate-400">
                          No categories found in the store.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={close} className="btn-outline !py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="btn-primary !py-2.5 text-sm">
                {busy ? "Saving…" : editing ? "Save changes" : "Create user"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .field {
          display: block;
          margin-bottom: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #475569;
        }
        .inp {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.6rem 0.9rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all 0.15s;
        }
        .inp:focus {
          border-color: #003366;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCog,
  FaUserShield,
} from "react-icons/fa";

export interface AdminUserPublic {
  id: string;
  username: string;
  name: string;
  role: "owner" | "admin";
  createdAt: string;
}

const empty = {
  username: "",
  name: "",
  role: "admin" as "owner" | "admin",
  password: "",
};

export default function AdminUsersManager({
  initial,
}: {
  initial: AdminUserPublic[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserPublic[]>(initial);
  const [editing, setEditing] = useState<AdminUserPublic | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 5000);
  }
  function openCreate() {
    setEditing(null);
    setForm(empty);
    setCreating(true);
  }
  function openEdit(u: AdminUserPublic) {
    setCreating(false);
    setEditing(u);
    setForm({ username: u.username, name: u.name, role: u.role, password: "" });
  }
  function close() {
    setCreating(false);
    setEditing(null);
    setForm(empty);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const url = editing
        ? `/api/admin/users/${editing.id}`
        : "/api/admin/users";
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

  const RoleIcon = (r: string) => (r === "owner" ? FaUserShield : FaUserCog);

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          {users.length} admin account{users.length === 1 ? "" : "s"} on this
          panel. Master login (<code>admin</code> + <code>ADMIN_PASSWORD</code>)
          always works too.
        </p>
        <button onClick={openCreate} className="btn-primary !py-2.5 text-sm">
          <FaPlus /> Add user
        </button>
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
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {users.map((u) => {
            const Icon = RoleIcon(u.role);
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center gap-3 p-4 hover:bg-slate-50/60"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    u.role === "owner"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  <FaUser />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-700">
                    {u.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      @{u.username}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Icon className={u.role === "owner" ? "text-amber-500" : "text-indigo-500"} />
                    {u.role === "owner" ? "Owner" : "Admin"}
                    <span className="mx-1">·</span>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary transition hover:bg-primary hover:text-white"
                    title="Edit"
                  >
                    <FaUserCog />
                  </button>
                  <button
                    onClick={() => remove(u)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            );
          })}
          {users.length === 0 && (
            <li className="p-10 text-center text-sm text-slate-400">
              No custom users yet — the master login works until you add one.
            </li>
          )}
        </ul>
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
            className="my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
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

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="field">Name (optional)</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="inp"
                  placeholder="e.g. Store Manager"
                />
              </label>
              <label className="block">
                <span className="field">Username *</span>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="inp"
                  placeholder="e.g. manager"
                />
              </label>
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
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="radio"
                    checked={form.role === "admin"}
                    onChange={() => setForm({ ...form, role: "admin" })}
                    className="accent-[#003366]"
                  />
                  Admin
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="radio"
                    checked={form.role === "owner"}
                    onChange={() => setForm({ ...form, role: "owner" })}
                    className="accent-[#003366]"
                  />
                  Owner
                </label>
              </div>
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

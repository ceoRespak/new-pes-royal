"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaLock, FaSignInAlt, FaUser } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace("/admin/dashboard");
        router.refresh();
      } else {
        setError(json.error || "Login failed.");
        setBusy(false);
      }
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-gradient px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/logo.png"
                alt="Pearl Electric Solutions"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold text-primary">
              PES Admin Panel
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage products, categories &amp; site settings.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Username
              </span>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-200 bg-light/50 py-3 pl-11 pr-4 text-sm transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </span>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-slate-200 bg-light/50 py-3 pl-11 pr-4 text-sm transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                "Signing in…"
              ) : (
                <>
                  <FaSignInAlt /> Sign in to Admin
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.7rem] text-slate-400">
            The password is configured via <code>ADMIN_PASSWORD</code> in your
            environment (see .env.example).
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaLock, FaSpinner, FaUserPlus } from "react-icons/fa";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";

export default function CustomerAuth({ next }: { next?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const initial: Mode = sp.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<Mode>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    address: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("Please enter a valid email.");
    if (mode === "register") {
      if (!form.name.trim()) return setError("Please enter your name.");
      if (form.phone.replace(/[^\d]/g, "").length < 7)
        return setError("Please enter a valid phone number.");
    }
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      const url =
        mode === "login" ? "/api/account/login" : "/api/account/register";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.push(next || "/account");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      {/* Tabs */}
      <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              "rounded-full py-2.5 text-sm font-bold transition",
              mode === m
                ? "bg-primary-gradient text-white shadow"
                : "text-slate-500 hover:text-primary"
            )}
          >
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login"
            ? "Sign in to use your saved details at checkout."
            : "Save your details so ordering next time takes seconds."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className={labelCls}>Full Name *</label>
                <input className={inputCls} value={form.name} onChange={set("name")} placeholder="e.g. Ahmed Khan" autoComplete="name" />
              </div>
              <div>
                <label className={labelCls}>Phone / WhatsApp *</label>
                <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="03XX XXXXXXX" autoComplete="tel" />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <input type="password" className={inputCls} value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
          {mode === "register" && (
            <>
              <div>
                <label className={labelCls}>City (default delivery city)</label>
                <input className={inputCls} value={form.city} onChange={set("city")} placeholder="e.g. Peshawar" />
              </div>
              <div>
                <label className={labelCls}>Address (default delivery address)</label>
                <input className={inputCls} value={form.address} onChange={set("address")} placeholder="House/Shop no, street, area" />
              </div>
            </>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E11D2A] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 hover:bg-[#b8111f] disabled:opacity-60"
          >
            {busy ? <FaSpinner className="animate-spin" /> : mode === "login" ? <FaLock /> : <FaUserPlus />}
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Prefer not to create an account? You can still{" "}
          <Link href="/checkout" className="font-bold text-primary hover:underline">
            check out as a guest
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

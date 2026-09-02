import type { Metadata } from "next";
import { backendGet, maybeParse } from "@/lib/admin/backend";
import SettingsEditor from "@/components/admin/SettingsEditor";

export const metadata: Metadata = { title: "Settings | Admin" };

export default async function AdminSettingsPage() {
  const res = await backendGet<Record<string, unknown>>("/api/settings");
  const raw = res.data ?? {};
  const settings: Record<string, unknown> = {};
  for (const k of Object.keys(raw)) settings[k] = maybeParse(raw[k]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Site Settings &amp; Banners
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Contact info, about text, return/delivery policy, promo banners and
          social links — saved to the live pespeshawar.pk backend.
        </p>
        {!res.ok && (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Could not load settings: {res.error}
          </p>
        )}
      </header>
      <SettingsEditor settings={settings} />
    </div>
  );
}

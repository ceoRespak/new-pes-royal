"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";

interface PromoBanner {
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  color?: string;
}
interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

interface Props {
  settings: Record<string, unknown>;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

const STORE: [string, string][] = [
  ["siteName", "Site name"],
  ["shopName", "Shop name"],
  ["siteDescription", "Site description (meta)"],
  ["footerTagline", "Footer tagline"],
  ["footerDescription", "Footer description"],
  ["footerCopyright", "Footer copyright"],
];
const CONTACT: [string, string][] = [
  ["phone", "Phone"],
  ["contactPhone", "Contact / WhatsApp phone"],
  ["whatsappNumber", "WhatsApp number (digits)"],
  ["email", "Email"],
  ["contactEmail", "Secondary email"],
  ["address", "Main address"],
  ["contactAddress", "Second address"],
  ["mapUrl", "Map / location URL"],
  ["workingHours", "Working hours"],
];
const ABOUT: [string, string][] = [
  ["aboutHeading", "About heading"],
  ["aboutHeadingHighlight", "About heading highlight"],
  ["aboutUs", "About (short)"],
  ["aboutDescription1", "About paragraph 1"],
  ["aboutDescription2", "About paragraph 2"],
];
const POLICY: [string, string][] = [
  ["returnPolicy", "Return policy"],
  ["deliveryInfo", "Delivery info"],
  ["whatsappMessage", "WhatsApp pre-filled message"],
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-base font-bold text-primary">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className={textarea ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white"
        />
      )}
    </label>
  );
}

export default function SettingsEditor({ settings }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    [...STORE, ...CONTACT, ...ABOUT, ...POLICY].forEach(([k]) => {
      init[k] = str(settings[k]);
    });
    return init;
  });
  const [banners, setBanners] = useState<PromoBanner[]>(() =>
    arr<PromoBanner>(settings.promoBanners)
  );
  const [socials, setSocials] = useState<SocialLink[]>(() =>
    arr<SocialLink>(settings.socialLinks)
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function patchBanner(i: number, patch: Partial<PromoBanner>) {
    setBanners((b) => b.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }
  function patchSocial(i: number, patch: Partial<SocialLink>) {
    setSocials((s) => s.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const edits: Record<string, unknown> = { ...form };
    if (settings.promoBanners !== undefined) edits.promoBanners = banners;
    if (settings.socialLinks !== undefined) edits.socialLinks = socials;
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edits }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg({ kind: "ok", text: "Settings saved to the live backend ✓" });
      router.refresh();
    } else {
      setMsg({ kind: "err", text: json.error || "Save failed" });
    }
    setBusy(false);
  }

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white";

  return (
    <div className="space-y-6">
      {msg && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            msg.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </p>
      )}

      <Section title="Store basics">
        {STORE.map(([k, label]) => (
          <Field
            key={k}
            label={label}
            value={form[k] ?? ""}
            onChange={(v) => setField(k, v)}
            textarea={k === "siteDescription" || k === "footerDescription"}
          />
        ))}
      </Section>

      <Section title="Contact & locations">
        {CONTACT.map(([k, label]) => (
          <Field
            key={k}
            label={label}
            value={form[k] ?? ""}
            onChange={(v) => setField(k, v)}
          />
        ))}
      </Section>

      <Section title="About text">
        {ABOUT.map(([k, label]) => (
          <Field
            key={k}
            label={label}
            value={form[k] ?? ""}
            onChange={(v) => setField(k, v)}
            textarea={k.startsWith("aboutDescription") || k === "aboutUs"}
          />
        ))}
      </Section>

      <Section title="Returns, delivery & WhatsApp">
        {POLICY.map(([k, label]) => (
          <Field
            key={k}
            label={label}
            value={form[k] ?? ""}
            onChange={(v) => setField(k, v)}
            textarea
          />
        ))}
      </Section>

      {/* Promo banners */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-primary">
            Promo banners
          </h2>
          <button
            onClick={() =>
              setBanners((b) => [
                ...b,
                { title: "", subtitle: "", image: "", link: "/products" },
              ])
            }
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            <FaPlus /> Add banner
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {banners.length === 0 && (
            <p className="text-sm text-slate-400">No promo banners yet.</p>
          )}
          {banners.map((b, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Title"
                  value={b.title}
                  onChange={(e) => patchBanner(i, { title: e.target.value })}
                  className={inputCls}
                />
                <input
                  placeholder="Subtitle"
                  value={b.subtitle ?? ""}
                  onChange={(e) => patchBanner(i, { subtitle: e.target.value })}
                  className={inputCls}
                />
                <input
                  placeholder="Image URL"
                  value={b.image ?? ""}
                  onChange={(e) => patchBanner(i, { image: e.target.value })}
                  className={inputCls}
                />
                <input
                  placeholder="Link (e.g. /products?category=fan)"
                  value={b.link ?? ""}
                  onChange={(e) => patchBanner(i, { link: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setBanners((list) => list.filter((_, idx) => idx !== i))}
                  className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500"
                >
                  <FaTimes /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social links */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-primary">
            Social links
          </h2>
          <button
            onClick={() => setSocials((s) => [...s, { name: "", url: "", icon: "FaGlobe" }])}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            <FaPlus /> Add link
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {socials.map((s, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:flex-row">
              <input
                placeholder="Name (facebook, whatsapp…)"
                value={s.name}
                onChange={(e) => patchSocial(i, { name: e.target.value })}
                className={`${inputCls} sm:w-52`}
              />
              <input
                placeholder="URL"
                value={s.url}
                onChange={(e) => patchSocial(i, { url: e.target.value })}
                className={inputCls}
              />
              <button
                onClick={() => setSocials((list) => list.filter((_, idx) => idx !== i))}
                className="flex items-center justify-center rounded-full bg-red-50 px-3 text-red-500"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={busy}
          className="btn-primary disabled:opacity-60"
        >
          <FaSave /> {busy ? "Saving…" : "Save all settings"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaPaperPlane, FaWhatsapp } from "react-icons/fa";
import { site } from "@/data/site";

const subjects = [
  "General Enquiry",
  "Product Information",
  "Bulk / Wholesale Order",
  "Project Quote",
  "Warranty & Support",
  "Dealer / Retail Enquiry",
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: subjects[0],
  message: "",
};

/**
 * Contact form with animated success state.
 * (Static demo — submissions open a pre-filled WhatsApp chat to the sales team.)
 */
export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [sent, setSent] = useState(false);

  const update =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const waMessage = encodeURIComponent(
    `Hello Respak Express! I'm ${form.name || "a visitor"}.\nSubject: ${form.subject}\n\n${form.message}\n\nPhone: ${form.phone} | Email: ${form.email}`
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-emerald-50/60 px-8 py-20 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl text-white shadow-gold">
              <FaCheckCircle />
            </span>
            <h3 className="mt-6 font-display text-2xl font-bold text-primary">
              Thank you, {form.name.split(" ")[0] || "friend"}!
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              Your message has been received. Our team typically responds within
              one business day. For instant assistance, continue on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
              >
                <FaWhatsapp /> Continue on WhatsApp
              </a>
              <button
                onClick={() => {
                  setSent(false);
                  setForm(initial);
                }}
                className="btn-outline"
              >
                Send another message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={onSubmit}
            className="grid gap-5 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Full Name *
              </span>
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Ahmed Raza"
                className="w-full rounded-xl border border-slate-200 bg-light/50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email *
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-light/50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={update("phone")}
                placeholder="+92 3xx xxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-light/50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Subject *
              </span>
              <select
                value={form.subject}
                onChange={update("subject")}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-light/50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Message *
              </span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={update("message")}
                placeholder="Tell us how we can help..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-light/50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary group w-full sm:w-auto">
                Send Message
                <FaPaperPlane className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

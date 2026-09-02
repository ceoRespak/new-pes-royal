"use client";

import { FormEvent, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  if (done) {
    return (
      <p className="rounded-full bg-white/10 px-4 py-2.5 text-sm text-white">
        ✅ Thank you for subscribing — watch your inbox!
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex overflow-hidden rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className="w-full bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe to newsletter"
        className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-accent-300"
      >
        <FaPaperPlane /> Subscribe
      </button>
    </form>
  );
}

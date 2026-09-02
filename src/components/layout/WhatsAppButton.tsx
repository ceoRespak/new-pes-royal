"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { site } from "@/data/site";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const message = encodeURIComponent(
    "Hello PES! I would like to ask about your products."
  );
  const href = `https://wa.me/${site.whatsapp}?text=${message}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, scale: 0.5, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group fixed bottom-6 right-6 z-40 flex items-center gap-3"
        >
          <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary opacity-0 shadow-card transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            Chat with us
          </span>
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-gold transition-transform duration-300 group-hover:scale-110">
              <FaWhatsapp />
            </span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

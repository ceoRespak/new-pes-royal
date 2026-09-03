import {
  FaCheckCircle,
  FaHeadset,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";
import type { ComponentType } from "react";

export interface TrustItem {
  icon: string;
  title: string;
  text: string;
}

const iconMap: Record<string, ComponentType> = {
  truck: FaTruck,
  shield: FaShieldAlt,
  money: FaMoneyBillWave,
  check: FaCheckCircle,
  headset: FaHeadset,
};

const defaults: TrustItem[] = [
  {
    icon: "truck",
    title: "Fast Delivery",
    text: "Same-day in Peshawar · Nationwide courier",
  },
  {
    icon: "shield",
    title: "Genuine Warranty",
    text: "Official brand products & warranties",
  },
  {
    icon: "money",
    title: "Cash on Delivery",
    text: "Pay at your doorstep",
  },
  {
    icon: "check",
    title: "Secure Ordering",
    text: "Order via WhatsApp or call",
  },
  {
    icon: "headset",
    title: "Expert Support",
    text: "Mon–Sat · 9am – 8pm",
  },
];

export default function TrustStrip({ items }: { items?: TrustItem[] }) {
  const list = items && items.length ? items : defaults;
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="container-px grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 md:grid-cols-5 md:divide-y-0">
        {list.map((item) => {
          const Icon = iconMap[item.icon] ?? FaCheckCircle;
          return (
            <div
              key={item.title}
              className="flex flex-col items-center gap-2 px-3 py-6 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E11D2A]/10 text-lg text-[#E11D2A]">
                <Icon />
              </span>
              <div>
                <p className="text-[0.82rem] font-bold text-slate-900">
                  {item.title}
                </p>
                <p className="text-[0.68rem] leading-snug text-slate-500">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

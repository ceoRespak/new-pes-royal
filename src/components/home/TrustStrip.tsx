import {
  FaCheckCircle,
  FaHeadset,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

const items = [
  {
    icon: FaTruck,
    title: "Fast Delivery",
    text: "Same-day in Peshawar · Nationwide courier",
  },
  {
    icon: FaShieldAlt,
    title: "Genuine Warranty",
    text: "Official brand products & warranties",
  },
  {
    icon: FaMoneyBillWave,
    title: "Cash on Delivery",
    text: "Pay at your doorstep",
  },
  {
    icon: FaCheckCircle,
    title: "Secure Ordering",
    text: "Order via WhatsApp or call",
  },
  {
    icon: FaHeadset,
    title: "Expert Support",
    text: "Mon–Sat · 9am – 8pm",
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="container-px grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-3 md:grid-cols-5 md:divide-y-0">
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-2 px-3 py-6 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E11D2A]/10 text-lg text-[#E11D2A]">
              <Icon />
            </span>
            <div>
              <p className="text-[0.82rem] font-bold text-slate-900">{title}</p>
              <p className="text-[0.68rem] leading-snug text-slate-500">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

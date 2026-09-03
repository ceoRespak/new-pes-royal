import {
  FaHeadset,
  FaShieldAlt,
  FaStore,
  FaTags,
} from "react-icons/fa";

const reasons = [
  {
    icon: FaStore,
    title: "Trusted Local Store",
    text: "Serving Peshawar from two shops since 2015.",
  },
  {
    icon: FaShieldAlt,
    title: "100% Genuine Products",
    text: "Royal, Pak Fan, Philips, Schneider, AGE & more.",
  },
  {
    icon: FaTags,
    title: "Honest Pricing",
    text: "Best retail & cash prices, no hidden charges.",
  },
  {
    icon: FaHeadset,
    title: "Expert After-Sales Support",
    text: "Warranty help & honest buying advice.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-light/50 py-12 md:py-16">
      <div className="container-px">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
            Why Choose Pearl Electric?
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
            Your Trusted Electrical Partner
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-[#E11D2A]/30 hover:shadow-lg"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E11D2A]/10 text-2xl text-[#E11D2A] transition group-hover:bg-[#E11D2A] group-hover:text-white">
                <Icon />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-slate-900">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

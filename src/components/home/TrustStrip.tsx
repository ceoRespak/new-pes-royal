import {
  FaAward,
  FaHeadset,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";
import AnimatedSectionWrapper from "@/components/ui/AnimatedSectionWrapper";

const items = [
  {
    icon: FaShieldAlt,
    title: "Genuine Products",
    text: "100% authentic PES quality",
  },
  {
    icon: FaAward,
    title: "Up to 2-Yr Warranty",
    text: "On fans & protection gear",
  },
  {
    icon: FaHeadset,
    title: "Nationwide Support",
    text: "Service centres in 6+ cities",
  },
  {
    icon: FaTruck,
    title: "Dealer Network",
    text: "200+ trusted outlets",
  },
];

export default function TrustStrip() {
  return (
    <section className="relative z-10 -mt-8">
      <div className="container-px">
        <AnimatedSectionWrapper className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-100 shadow-card lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group flex items-center gap-4 bg-white p-5 transition-colors duration-300 hover:bg-primary sm:p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-xl text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-primary">
                <Icon />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-primary transition group-hover:text-white sm:text-base">
                  {title}
                </p>
                <p className="text-xs text-slate-500 transition group-hover:text-white/70 sm:text-[0.8rem]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </AnimatedSectionWrapper>
      </div>
    </section>
  );
}

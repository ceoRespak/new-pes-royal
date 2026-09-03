import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { getContent } from "@/lib/content/store";

/**
 * Layout for the public marketing site (route group "(site)").
 * The /admin area lives OUTSIDE this group so it gets its own shell.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const info = getContent().siteInfo ?? {};
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar info={info} />
      <main className="flex-1">{children}</main>
      <Footer info={info} />
      <WhatsAppButton number={info.whatsapp} />
    </div>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/components/cart/CartProvider";
import { SiteProvider } from "@/components/site/SiteProvider";
import { getRuntimeSite } from "@/lib/content/runtime-site";

export const dynamic = "force-dynamic";

/**
 * Layout for the public site (route group "(site)").
 * The /admin area lives OUTSIDE this group so it gets its own shell.
 * <CartProvider> wraps everything so the navbar cart badge, cart & checkout
 * pages all share one client-side cart.
 *
 * The site's contact / about / policy text is now resolved per-request from
 * the runtime settings that Admin → Live Store Settings edits
 * (`/.data/store.json` → settings) via getRuntimeSite(), then handed to the
 * whole subtree through <SiteProvider> so server pages + client components
 * (header, footer, WhatsApp float, product cards …) all reflect admin edits.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = getRuntimeSite();
  return (
    <CartProvider>
      <SiteProvider site={site}>
        <div className="flex min-h-screen flex-col">
          <Navbar
            info={{
              phone: site.phone,
              email: site.email,
              hours: site.hours,
              address: site.address,
              footerAbout: site.footerAbout,
              announcement: site.announcement,
            }}
          />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton number={site.whatsapp} />
        </div>
      </SiteProvider>
    </CartProvider>
  );
}

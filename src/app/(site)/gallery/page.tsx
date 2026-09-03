import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
import PageHero from "@/components/ui/PageHero";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore Pearl Electric Solutions installations and projects — residential fans, premium lighting, security systems and more across Pakistan.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const pg = (((getContent().pages ?? {}) as Record<string, Record<string, string>>)["gallery"] ?? {}) as Record<string, string>;
  return (
    <>
      <PageHero
        crumb="Gallery"
        title={pg.title || "Our Work in"}
        highlight={pg.highlight || "Action"}
        description="A look at real PES installations — from cosy living rooms to large commercial projects across Pakistan."
      />

      <section className="section-pad bg-light/60">
        <div className="container-px">
          <GalleryGrid />
        </div>
      </section>
    </>
  );
}

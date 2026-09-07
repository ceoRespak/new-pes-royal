import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { galleryItems as defaultGalleryItems } from "@/data/gallery";
import type { GalleryItem } from "@/types";

export const dynamic = "force-dynamic";
import PageHero from "@/components/ui/PageHero";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore Respak Express installations and projects — residential fans, premium lighting, security systems and more across Pakistan.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const content = getContent();
  const pg = (((content.pages ?? {}) as Record<string, Record<string, string>>)["gallery"] ?? {}) as Record<string, string>;
  const items = (content.galleryItems as GalleryItem[] | undefined) ?? defaultGalleryItems;
  return (
    <>
      <PageHero
        crumb="Gallery"
        title={pg.title || "Our Work in"}
        highlight={pg.highlight || "Action"}
        description="A look at real Respak Express installations — from cosy living rooms to large commercial projects across Pakistan."
      />

      <section className="section-pad bg-light/60">
        <div className="container-px">
          <GalleryGrid items={items} />
        </div>
      </section>
    </>
  );
}

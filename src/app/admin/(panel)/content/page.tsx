import type { Metadata } from "next";
import SiteContentEditor from "@/components/admin/SiteContentEditor";
import { getContent } from "@/lib/content/store";

export const metadata: Metadata = { title: "Site Content | Admin" };

export default function AdminContentPage() {
  const content = getContent();
  return (
    <div>
      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#E11D2A] to-[#7a0f16] p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur">
            🎨
          </span>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight">
              Site Content
            </h1>
            <p className="mt-0.5 text-sm text-white/85">
              Make the website fully dynamic — edit every homepage section from
              here. Saved content lives in this site&apos;s local store.
            </p>
          </div>
        </div>
      </header>
      <SiteContentEditor initial={content as Record<string, unknown>} />
    </div>
  );
}

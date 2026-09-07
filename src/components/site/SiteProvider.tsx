"use client";

/**
 * Provides the runtime (admin-editable) site settings to client components.
 *
 * Server components/layouts compute the live settings with
 * `getRuntimeSite()` (src/lib/content/runtime-site.ts — reads files, so it is
 * server-only) and pass them in here. Client leaves that used to import the
 * static `@/data/site` can call `useSite()` instead and get the admin-overridden
 * values. When no provider is mounted (e.g. a component rendered outside the
 * public layout), it transparently falls back to the static defaults.
 */
import { createContext, useContext } from "react";
import { site as staticSite } from "@/data/site";
import type { RuntimeSite } from "@/lib/content/runtime-site";

const SiteContext = createContext<RuntimeSite | null>(null);

export function SiteProvider({
  site,
  children,
}: {
  site: RuntimeSite;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): RuntimeSite {
  const rt = useContext(SiteContext);
  if (rt) return rt;
  return staticSite as unknown as RuntimeSite;
}

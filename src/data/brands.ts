import type { BrandRef } from "@/types";
import { bestRank } from "@/lib/rules";

/**
 * Brand registry used for AUTO-DETECTION only — products carry no brand
 * column, so we match a known brand / product-line phrase against the product
 * name during catalog normalisation (see src/lib/store/live.ts).
 *
 * Order matters for ties (earlier brand wins). Multi-word matchers and
 * product-lines (e.g. "Opal Premium") are preferred because they are longer /
 * more specific than the bare family name ("Opal").
 */

export interface BrandLineDef {
  id: string;
  name: string;
  /** Phrases (matched as standalone words) that identify this product line. */
  match: string[];
}

export interface BrandDef {
  id: string;
  name: string;
  tagline?: string;
  /** Phrases (matched as standalone words) that identify the family. */
  match: string[];
  /** Optional product-lines that also belong to this family. */
  lines?: BrandLineDef[];
}

export const BRANDS: BrandDef[] = [
  {
    id: "opal",
    name: "Opal",
    tagline: "Switches, sockets & electrical accessories",
    match: ["Opal"],
    lines: [
      { id: "opal-pride", name: "Opal Pride", match: ["Opal Pride"] },
      { id: "opal-premium", name: "Opal Premium", match: ["Opal Premium"] },
      { id: "opal-royal", name: "Opal Royal", match: ["Opal Royal"] },
      { id: "opal-333", name: "Opal 333-Series", match: ["333-Series", "333 Series"] },
    ],
  },
  {
    id: "voldam",
    name: "Voldam",
    tagline: "Exhaust, ceiling & in-line fans",
    match: ["Voldam"],
  },
  {
    id: "royal",
    name: "Royal",
    tagline: "Ceiling & false-ceiling fans",
    match: ["Royal"],
    lines: [{ id: "royal-monarch", name: "Royal Monarch", match: ["Royal Monarch"] }],
  },
  {
    id: "chint",
    name: "Chint",
    tagline: "MCBs, MCCBs & protection devices",
    match: ["Chint"],
  },
  {
    id: "philips",
    name: "Philips",
    tagline: "LED lighting",
    match: ["Philips"],
  },
  {
    id: "schneider",
    name: "Schneider",
    tagline: "Switches, MCBs & protection",
    match: ["Schneider"],
  },
  {
    id: "pakistan-cable",
    name: "Pakistan Cable",
    tagline: "House wiring & power cables",
    match: ["Pakistan Cable"],
  },
  {
    id: "age",
    name: "AGE",
    tagline: "House wiring cables",
    match: ["AGE"],
  },
  {
    id: "clipsal",
    name: "Clipsal",
    tagline: "E-Series switches & sockets",
    match: ["Clipsal"],
  },
  {
    id: "riva",
    name: "Riva",
    tagline: "Extension boards, door bells & more",
    match: ["Riva"],
  },
  {
    id: "popular",
    name: "Popular",
    tagline: "Conduit pipes",
    match: ["Popular"],
  },
  {
    id: "coarts",
    name: "Coarts",
    tagline: "SMD LED bulbs",
    match: ["Coarts"],
  },
  {
    id: "blue-dot",
    name: "Blue Dot",
    tagline: "Smart switches & light plugs",
    match: ["Blue Dot"],
  },
  {
    id: "xelent",
    name: "Xelent",
    tagline: "Door bells & push buttons",
    match: ["Xelent", "Xekent"],
  },
  {
    id: "islamabad-design",
    name: "Islamabad Design",
    tagline: "Distribution boards",
    match: ["Islamabad"],
  },
  {
    id: "fast-cables",
    name: "Fast Cables",
    tagline: "XLPO / DC solar cables",
    match: ["Fast Cables", "Fast Cable"],
  },
  {
    id: "blacksmith",
    name: "BlackSmith",
    tagline: "Exhaust fans",
    match: ["BlackSmith"],
  },
  {
    id: "mm",
    name: "M&M",
    tagline: "Distribution boards",
    match: ["M&M"],
  },
  {
    id: "commax",
    name: "Commax",
    tagline: "Door phones",
    match: ["Commax"],
  },
  {
    id: "himel",
    name: "Himel",
    match: ["Himel"],
  },
  {
    id: "hager",
    name: "Hager",
    match: ["Hager"],
  },
  {
    id: "kss",
    name: "KSS",
    match: ["KSS"],
  },
  {
    id: "ecotek",
    name: "Ecotek",
    match: ["Ecotek"],
  },
  {
    id: "ecolink",
    name: "Ecolink",
    match: ["Ecolink"],
  },
  {
    id: "lumek",
    name: "Lumek",
    match: ["Lumek"],
  },
  {
    id: "poineer",
    name: "Poineer",
    match: ["Poineer"],
  },
  {
    id: "afsun",
    name: "Afsun",
    match: ["Afsun"],
  },
  {
    id: "opple",
    name: "Opple",
    match: ["Opple"],
  },
];

/** Lookup helpers (labels for chips, links, detail page). */
const byId = new Map(BRANDS.map((b) => [b.id, b]));

export function getBrand(id: string): BrandDef | undefined {
  return byId.get(id);
}

export function brandLabel(id: string): string {
  return byId.get(id)?.name ?? id;
}

/**
 * Detect the brand + (optionally) product line for a product name.
 * The longest matching phrase wins, so a line like "Opal Premium" beats the
 * bare family "Opal". Products that don't mention a known brand return
 * undefined (they are shown as generic / unbranded).
 */
export function detectBrand(
  name: string
): { brand: BrandRef; line?: { id: string; name: string } } | undefined {
  let bestRankValue = 0;
  let bestBrand: BrandRef | undefined;
  let bestLine: { id: string; name: string } | undefined;

  for (const b of BRANDS) {
    const fam = bestRank(name, b.match);
    if (fam > bestRankValue) {
      bestRankValue = fam;
      bestBrand = { id: b.id, name: b.name };
      bestLine = undefined;
    }
    for (const ln of b.lines ?? []) {
      const lr = bestRank(name, ln.match);
      if (lr > bestRankValue) {
        bestRankValue = lr;
        bestBrand = { id: b.id, name: b.name };
        bestLine = { id: ln.id, name: ln.name };
      }
    }
  }

  return bestBrand ? { brand: bestBrand, line: bestLine } : undefined;
}

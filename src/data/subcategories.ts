import type { SubCategoryRef } from "@/types";
import { bestRank } from "@/lib/rules";

/**
 * Sub-category (product-type) definitions, keyed by the parent category's
 * display name. Each product is auto-assigned to the sub whose keyword phrase
 * best matches its name (longest / most specific phrase wins). Products that
 * match nothing stay under the category's "All" — they are not forced into a
 * bucket. Everything here is easy to tune: add/reorder keywords, or reorder
 * subs (on equal rank, the earlier sub wins).
 *
 * NOTE: keys must match the category names in the store (e.g. "FAN").
 */

export interface SubDef {
  id: string;
  name: string;
  /** Keyword phrases (matched as standalone words) that identify this type. */
  match: string[];
}

const slugify = (s: string): string =>
  String(s)
    .toLowerCase()
    .replace(/[’'&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "item";

export const SUBCATEGORIES: Record<string, SubDef[]> = {
  FAN: [
    {
      id: "false-ceiling-fans",
      name: "False Ceiling Fans",
      match: ["false ceiling", "false ceilling", "ceiling fan 18", "ceiling 18"],
    },
    {
      id: "air-circulating-fans",
      name: "Air Circulating Fans",
      match: ["air circulating", "circulating"],
    },
    {
      id: "ceiling-fans",
      name: "Ceiling Fans",
      match: ["celling fan", "ceiling fan", "ceiling 56", "celling"],
    },
  ],

  "Exhaust Fans": [
    {
      id: "in-line-mix-flow",
      name: "In-Line & Mix Flow",
      match: ["mix flow", "in-line", "inline"],
    },
    {
      id: "wall-window",
      name: "Wall & Window",
      match: ["wall", "window"],
    },
    {
      id: "metal",
      name: "Powerful Metal",
      match: ["metal", "blacksmith"],
    },
    {
      id: "european",
      name: "European Design",
      match: ["european"],
    },
    {
      id: "plastic-glass",
      name: "Plastic & Glass",
      match: ["plastic glass", "glass exhaust"],
    },
  ],

  Chandeliers: [
    {
      id: "crystal",
      name: "Crystal Chandeliers",
      match: ["crystal"],
    },
    {
      id: "bluetooth-remote",
      name: "Bluetooth & Remote",
      match: ["bluetooth", "remote control"],
    },
    {
      id: "designer-modern",
      name: "Designer & Modern",
      match: ["style", "modern", "frosted", "antique", "drone", "octopus", "globe", "falling", "moonlight", "turkish", "lamp", "leaves"],
    },
  ],

  "Lighting Solutions": [
    {
      id: "profile-strip",
      name: "Profile & Strip Lights",
      match: ["profile light", "profile strip", "profile cob", "cob strip", "profile", "strip"],
    },
    {
      id: "track-lights",
      name: "Track Lights",
      match: ["magnetic track", "track light"],
    },
    {
      id: "flood-tube",
      name: "Flood & Tube Lights",
      match: ["flood", "tube light", "tube"],
    },
    {
      id: "panel-lights",
      name: "Panel Lights",
      match: ["panel light", "panel"],
    },
    {
      id: "step-outdoor",
      name: "Step & Outdoor Lights",
      match: ["step light", "out door", "outdoor", "lazer"],
    },
    {
      id: "cob-downlights",
      name: "COB Downlights",
      match: ["cob light", "downlight"],
    },
    {
      id: "led-bulbs",
      name: "SMD & LED Bulbs",
      match: ["smd", "e-27", "bulb", "grace", "coarts"],
    },
  ],

  "Switches & Sockets": [
    {
      id: "opal-333",
      name: "Opal 333-Series",
      match: ["333-series", "333 series"],
    },
    {
      id: "opal-premium",
      name: "Opal Premium",
      match: ["opal premium"],
    },
    {
      id: "opal-pride",
      name: "Opal Pride",
      match: ["opal pride"],
    },
    {
      id: "opal-royal",
      name: "Opal Royal",
      match: ["opal royal"],
    },
    {
      id: "clipsal-eseries",
      name: "Clipsal E-Series",
      match: ["clipsal", "e-series"],
    },
    {
      id: "schneider",
      name: "Schneider",
      match: ["schneider"],
    },
  ],

  "Circuit Breakers": [
    {
      id: "fire-extinguisher",
      name: "Fire Extinguishers",
      match: ["fire extinguisher"],
    },
    {
      id: "change-over-ats",
      name: "Change Over & ATS",
      match: ["change over", "changeover", "ats", "automatic transfer", "knife switch"],
    },
    {
      id: "protectors",
      name: "Protectors & Fuses",
      match: ["protector", "amp+volt", "volt+amp", "dc fuse", "fuse cover", "fuse"],
    },
    {
      id: "mccb",
      name: "MCCB",
      match: ["mccb"],
    },
    {
      id: "mcb",
      name: "MCB",
      match: ["mcb"],
    },
    {
      id: "breakers",
      name: "Breakers",
      match: ["breaker"],
    },
  ],

  "Wires & Cables": [
    {
      id: "xlpo-dc",
      name: "XLPO / DC (Solar)",
      match: ["xlpo", "dc wire"],
    },
    {
      id: "data",
      name: "Data (UTP / CAT6)",
      match: ["cat 6", "cat6", "utp"],
    },
    {
      id: "coaxial",
      name: "Coaxial (RG)",
      match: ["coaxial", "rg-7", "rg7"],
    },
    {
      id: "house-wiring",
      name: "House Wiring",
      match: ["age", "pakistan cable", "cable", "1mm", "2.5mm", "3/29", "7/29", "7/36", "7/44", "7/52", "10mm2", "6mm2", "4mm2"],
    },
  ],

  Others: [
    {
      id: "door-bells-phones",
      name: "Door Bells & Phones",
      match: ["bell", "dingdong", "door phone", "dorr", "xelent", "commax", "push"],
    },
    {
      id: "extension-boards",
      name: "Extension Boards",
      match: ["extension board", "extension"],
    },
    {
      id: "mosquito-killers",
      name: "Mosquito Killers",
      match: ["mosquito"],
    },
    {
      id: "fan-accessories",
      name: "Fan Accessories",
      match: ["fan rod", "fan sheet", "tikki"],
    },
    {
      id: "ducts-ties",
      name: "Ducts & Ties",
      match: ["duct", "cable tie", "insulation tape", "insulation"],
    },
    {
      id: "change-overs",
      name: "Change Overs",
      match: ["change over", "changeover"],
    },
  ],

  "Smart Home": [
    {
      id: "blue-dot",
      name: "Blue Dot Switches",
      match: ["blue dot"],
    },
    {
      id: "sensors",
      name: "Sensors",
      match: ["sensor"],
    },
  ],

  "Conduites & Back Boxes": [
    {
      id: "conduit-pipes",
      name: "Conduit Pipes",
      match: ["conduit", "pipe"],
    },
    {
      id: "back-boxes",
      name: "Back Boxes",
      match: ["back box"],
    },
    {
      id: "fan-accessories",
      name: "Fan Accessories",
      match: ["fan sheet", "fan rod", "tikki"],
    },
  ],

  "Distribution Boards (DBs)": [
    {
      id: "islamabad-design",
      name: "Islamabad Design",
      match: ["islamabad"],
    },
    {
      id: "mm",
      name: "M&M",
      match: ["m&m"],
    },
  ],

  "Solar Accessories": [
    {
      id: "connectors-mc4",
      name: "Connectors & MC4",
      match: ["mc4", "connector"],
    },
    {
      id: "earthing-rods",
      name: "Earthing & Rods",
      match: ["earthing", "rod"],
    },
    {
      id: "protection",
      name: "Protection",
      match: ["protector"],
    },
  ],
};

/**
 * Assign a sub-category to a product based on its name and parent category.
 * Returns undefined when nothing matches (the product stays under "All").
 */
export function getProductSub(
  categoryName: string,
  productName: string
): SubCategoryRef | undefined {
  const subs = SUBCATEGORIES[String(categoryName ?? "").trim()];
  if (!subs) return undefined;
  let best = 0;
  let chosen: SubDef | undefined;
  for (const s of subs) {
    const rank = bestRank(productName, s.match);
    if (rank > best) {
      best = rank;
      chosen = s;
    }
  }
  return chosen ? { id: chosen.id, name: chosen.name } : undefined;
}

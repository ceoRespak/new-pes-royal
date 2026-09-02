import type { CategoryMeta } from "@/types";

/**
 * REAL store categories — imported from www.pespeshawar.pk
 * (13 categories) by scripts/import-pes.mjs.
 */
export const categories: CategoryMeta[] = [
  {"id":"wires-cables","name":"Wires & Cables","shortName":"Wires & Cables","tagline":"Pakistan Cables, AGE, Fast & more","description":"Approved distributor of Pakistan Cables, AGE Cables and Fast Cables. House wiring, coaxial, and industrial cables with the lowest resistance and highest safety.","icon":"wire","accent":"#c9894a","image":"https://api.pespeshawar.pk/storage/images/product-1784357674800.jpg","count":10},
  {"id":"switches-sockets","name":"Switches & Sockets","shortName":"Switches & Sockets","tagline":"Clipsal, Schneider, ABB & genuine brands","description":"Premium switches, sockets and accessories from Clipsal, Schneider, ABB and others — from 1-gang to modular ranges, always 100% genuine.","icon":"switch","accent":"#4f9de0","image":"https://api.pespeshawar.pk/storage/images/product-1785241843392.png","count":10},
  {"id":"lighting-solutions","name":"Lighting Solutions","shortName":"Lighting Solutions","tagline":"LED bulbs, panels & decorative lighting","description":"Energy-saving LED bulbs, battens, panels, floodlights and decorative fixtures from Philips, Opal and leading brands — bright, efficient and long-lasting.","icon":"bulb","accent":"#f2c14e","image":"https://api.pespeshawar.pk/storage/images/product-1784720615866.png","count":10},
  {"id":"fan","name":"FAN","shortName":"FAN","tagline":"Ceiling & bracket fans from Pakistan's top brands","description":"A wide range of ceiling fans and bracket fans from Royal, Pak Fan, Lahore Fan, Voldam and other trusted brands — energy-efficient copper-wound motors, quiet operation and genuine warranties.","icon":"fan","accent":"#d4af37","image":"https://api.pespeshawar.pk/storage/images/product-1784437879489.png","count":10},
  {"id":"exhaust-fans","name":"Exhaust Fans","shortName":"Exhaust Fans","tagline":"Kitchen, bath & industrial ventilation","description":"Exhaust fans for kitchens, bathrooms and workspaces — from compact 6\" plastic models to powerful metal ventilators that clear heat, steam and odours quickly.","icon":"fan","accent":"#5aa7d6","image":"https://api.pespeshawar.pk/storage/images/product-1784714397105.png","count":10},
  {"id":"circuit-breakers","name":"Circuit Breakers","shortName":"Circuit Breakers","tagline":"MCBs, MCCBs, RCDs & change-overs","description":"Complete circuit protection — MCBs, MCCBs, RCDs and change-over switches from Chint and trusted manufacturers to keep every circuit safe.","icon":"breaker","accent":"#5fd0a6","image":"https://api.pespeshawar.pk/storage/images/product-1784303059088.jpg","count":10},
  {"id":"distribution-boards-dbs","name":"Distribution Boards (DBs)","shortName":"Distribution Boards (DBs)","tagline":"Load centres for every project","description":"Distribution boards and load centres in all sizes and designs — from 4-way to 18-way metal and Islamabad-design boards for homes and commercial projects.","icon":"dbs","accent":"#d98e4a","image":"https://api.pespeshawar.pk/storage/images/product-1784714882449.png","count":6},
  {"id":"solar-accessories","name":"Solar Accessories","shortName":"Solar Accessories","tagline":"Solar gear for homes & industry","description":"Solar accessories including copper earthing rods, structure, and components to make your solar installation safe, earthed and reliable.","icon":"solar","accent":"#f2c14e","image":"https://api.pespeshawar.pk/storage/images/product-1784706573354.png","count":4},
  {"id":"smart-home","name":"Smart Home","shortName":"Smart Home","tagline":"BlueDot switches & automation","description":"Smart-home solutions — WiFi switches, motion and microwave sensors that bring convenience, automation and security to your space.","icon":"smart","accent":"#5aa7d6","image":"https://api.pespeshawar.pk/storage/images/product-1785241497660.png","count":7},
  {"id":"conduites-back-boxes","name":"Conduites & Back Boxes","shortName":"Conduites & Back Boxes","tagline":"Conduit pipes, ducts & boxes","description":"Conduit pipes, slotted ducts, back boxes and switch boxes that keep wiring neat, safe and up to code.","icon":"conduit","accent":"#9aa7b8","image":"https://api.pespeshawar.pk/storage/images/product-1785241330539.jpg","count":9},
  {"id":"shutters-covers","name":"Shutters & Covers","shortName":"Shutters & Covers","tagline":"Exhaust shutters & covers","description":"Shutters and covers for exhaust fans and openings — durable, rust-resistant and available in multiple sizes.","icon":"shutter","accent":"#7ec89b","image":"https://api.pespeshawar.pk/storage/images/product-1784713243031.png","count":4},
  {"id":"earthing-accessories","name":"Earthing Accessories","shortName":"Earthing Accessories","tagline":"Copper rods & grounding gear","description":"Earthing copper rods, clamps and accessories for safe, low-resistance grounding in every soil type.","icon":"earthing","accent":"#b3922a","image":"https://api.pespeshawar.pk/storage/images/product-1784303079594.jpg","count":0},
  {"id":"others","name":"Others","shortName":"Others","tagline":"Everyday electrical essentials","description":"The essentials that keep every electrician going — tapes, tools and everyday electrical accessories from the brands you trust.","icon":"other","accent":"#8ab6f0","image":"https://api.pespeshawar.pk/storage/images/product-1784712265979.png","count":10},
];

export const categoryNavIds = [
  "fan",
  "exhaust-fans",
  "lighting-solutions",
  "wires-cables",
  "switches-sockets",
  "circuit-breakers",
];

export function getCategory(id: string): CategoryMeta | undefined {
  return categories.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.shortName ?? id;
}

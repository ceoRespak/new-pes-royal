/**
 * generate-pdfs.mjs
 * -----------------
 * Generates simple, valid text-only PDF documents (no external deps) for the
 * public /downloads folder — product catalogues, per-category spec sheets and
 * the warranty policy.
 *
 * Run:  node scripts/generate-pdfs.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "downloads");
mkdirSync(outDir, { recursive: true });

/* --------------------------- tiny PDF writer --------------------------- */
const escapeText = (t) =>
  String(t)
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function buildPdf(title, blocks) {
  // blocks: [{ type:'head'|'sub'|'rule'|'body'|'bullet'|'spacer', text? }]
  const HEAD = 13;
  const BODY = 10;
  const SMALL = 8.5;
  const LINE = (s) => Math.round(s * 1.9);

  // layout into pages: each page has width 612 (A4 ~ 595?) use letter 612x792
  const top = 740;
  const bottom = 60;
  const left = 56;

  // Build pages of instructions first (font + text ops).
  const pages = [];
  let ops = [];
  let y = top;

  const ensure = (needed) => {
    if (y - needed < bottom && ops.length > 0) {
      pages.push(ops);
      ops = [];
      y = top;
    }
  };

  // page header on every page
  const startPage = () => {
    ops = [];
    y = top;
    ops.push(`BT /F2 ${14} Tf 0.01 Tw ${left} ${y} Td (PEARL ELECTRIC SOLUTIONS (PES)) Tj ET`);
    ops.push(`BT /F1 ${8.5} Tf ${left} ${y - 13} Td (Premium Fans - LED Lighting - Smart Sensors - Electrical Accessories) Tj ET`);
    ops.push(`0.35 0.69 0.93 RG ${left} ${y - 20} m 556 ${y - 20} l S`); // thin line
    y -= 30;
    ops.push(`BT /F2 ${18} Tf ${left} ${y} Td (${escapeText(title)}) Tj ET`);
    y -= 26;
  };

  blocks.forEach((b) => {
    if (b.type === "head") {
      ensure(26);
      ops.push(`BT /F2 ${HEAD} Tf ${left} ${y} Td (${escapeText(b.text)}) Tj ET`);
      y -= LINE(HEAD) + 2;
    } else if (b.type === "sub") {
      ensure(20);
      ops.push(`BT /F2 ${11} Tf ${left} ${y} Td (${escapeText(b.text)}) Tj ET`);
      y -= 20;
    } else if (b.type === "body" || b.type === "bullet") {
      const text = b.text ?? "";
      // soft wrap naive: fit ~ (556-left)/chars by size
      const wrap = Math.floor((500 * 10) / BODY);
      const isHead = false;
      void isHead;
      const prefix = b.type === "bullet" ? "  -  " : "";
      let remainder = text;
      do {
        const chunk = remainder.slice(0, wrap);
        ensure(20);
        ops.push(`BT /F1 ${BODY} Tf ${left} ${y} Td (${escapeText(prefix + chunk)}) Tj ET`);
        remainder = remainder.slice(wrap);
        y -= 18;
      } while (remainder.length > 0);
    } else if (b.type === "rule") {
      ensure(12);
      ops.push(`0.83 0.68 0.22 RG ${left} ${y} m 556 ${y} l S`);
      y -= 14;
    } else if (b.type === "spacer") {
      y -= 10;
    }
  });
  pages.push(ops);

  // assemble objects
  const objects = [];
  const add = (body) => {
    objects.push(body);
    return objects.length; // 1-based id
  };

  const streamFor = (pageOps) => {
    const data = pageOps.join("\n");
    return `${data}\n`;
  };

  const fontIds = { F1: 0, F2: 0 };
  const pageIds = [];
  const contentIds = [];

  const catalogId = add("");
  const pagesId = add("");
  fontIds.F1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  fontIds.F2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pages.forEach((p) => {
    contentIds.push(add(""));
    pageIds.push(add(""));
  });

  // fill content streams
  pages.forEach((p, i) => {
    objects[contentIds[i] - 1] = `<< /Length ${streamFor(p).length} >>\nstream\n${streamFor(p)}endstream`;
  });
  // fill pages
  const kids = pageIds
    .map((id, i) => `${id} 0 R`)
    .join(" ");
  const pagesObj = `<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>`;
  objects[pagesId - 1] = pagesObj;

  pageIds.forEach((id, i) => {
    const contentId = contentIds[i];
    const text =
      `<< /Type /Page /Parent ${pagesId} 0 R ` +
      `/MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontIds.F1} 0 R /F2 ${fontIds.F2} 0 R >> >> ` +
      `/Contents ${contentId} 0 R >>`;
    objects[id - 1] = text;
  });

  const infoId = add(`<< /Title (${escapeText(title)}) /Producer (PES) /Creator (PES) >>`);
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  // offsets
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return pdf;
}

/* ------------------------------ documents ------------------------------ */
function catSpecs(list, catTitle) {
  const blocks = [
    { type: "sub", text: `Specification summary - ${catTitle}` },
    { type: "rule" },
  ];
  list.forEach((p) => {
    blocks.push({ type: "head", text: p.name });
    p.specs.forEach(([k, v]) => blocks.push({ type: "body", text: `${k}: ${v}` }));
    blocks.push({ type: "body", text: `Warranty: ${p.warranty}` });
    blocks.push({ type: "rule" });
  });
  return blocks;
}

const fanList = [
  { name: "Royal Breeze Ceiling Fan 56\"", specs: [["Sweep", "56 in (142 cm)"], ["Air delivery", "230 CMM"], ["Motor", "Pure copper"], ["Power", "75 W"], ["Speed", "290 RPM"], ["Voltage", "220-240 V 50 Hz"], ["Warranty", "2 years"]], warranty: "2 years" },
  { name: "Pearl Glide Ceiling Fan 48\"", specs: [["Sweep", "48 in (122 cm)"], ["Air delivery", "165 CMM"], ["Power", "60 W"], ["Noise", "under 36 dB"], ["Warranty", "2 years"]], warranty: "2 years" },
  { name: "Pearl Storm Pedestal Fan 18\"", specs: [["Blade", "18 in aluminium"], ["Oscillation", "120 degrees"], ["Power", "75 W"], ["Control", "Remote + panel"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Comfort Wall Fan 16\"", specs: [["Sweep", "16 in"], ["Power", "55 W"], ["Motor", "Copper, dual ball bearing"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Pearl Airline Exhaust Fan 12\"", specs: [["Blade", "12 in"], ["Power", "45 W"], ["Mounting", "Wall / window"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Breeze High Speed 60\"", specs: [["Sweep", "60 in (152 cm)"], ["Air delivery", "285 CMM"], ["Power", "90 W"], ["Usage", "Halls, mosques, industry"], ["Warranty", "2 years"]], warranty: "2 years" },
];

const lightList = [
  { name: "Pearl Crystal LED Panel 24W", specs: [["Power", "24 W"], ["Lumens", "2400"], ["Temp", "4000K"], ["Life", "25,000 hours"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Glow LED Bulb 12W", specs: [["Power", "12 W"], ["Base", "E27"], ["Beam", "220 degrees"], ["Life", "25,000 hours"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Pearl Beam LED Floodlight 50W", specs: [["Power", "50 W"], ["Lumens", "4000"], ["Protection", "IP66"], ["Life", "30,000 hours"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Linear LED Batten 20W", specs: [["Power", "20 W"], ["Length", "4 ft"], ["Temp", "6500K"], ["Linkable", "Up to 10"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Pearl Garden LED Spotlight 10W", specs: [["Power", "10 W"], ["Protection", "IP65"], ["Beam", "30 degrees"], ["Life", "25,000 hours"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Tube LED 20W (4 ft)", specs: [["Power", "20 W"], ["Equivalency", "40 W fluorescent"], ["Temp", "6500K"], ["Life", "25,000 hours"], ["Warranty", "1 year"]], warranty: "1 year" },
];

const sensorList = [
  { name: "Pearl Motion Sensor Switch", specs: [["Range", "7 m, 360 degrees"], ["Load", "300 W"], ["Delay", "10s - 5min"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Smart Motion Floodlight", specs: [["Light", "30 W daylight"], ["Range", "12 m, 120 degrees"], ["Protection", "IP65"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Pearl Smoke & Heat Detector", specs: [["Type", "Optical smoke + heat"], ["Alarm", "85 dB"], ["Coverage", "40 m2"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal Temperature & Timer Controller", specs: [["Range", "5-40 C"], ["Load", "2 kW"], ["Display", "LED"], ["Warranty", "1 year"]], warranty: "1 year" },
];

const elecList = [
  { name: "Pearl Safe MCB 16A", specs: [["Rating", "16 A C-curve"], ["Breaking", "10 kA"], ["Standard", "IEC 60898"], ["Warranty", "2 years"]], warranty: "2 years" },
  { name: "Royal Power Socket with USB", specs: [["Rating", "13 A + USB 5V/2.1A"], ["Safety", "Child shutters"], ["Material", "Fire-retardant PC"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Pearl Copper Wire 1.5mm2", specs: [["Conductor", "100% pure copper"], ["Insulation", "FR PVC"], ["Voltage", "450/750 V"], ["Warranty", "2 years"]], warranty: "2 years" },
  { name: "Royal Energy Saver Stabilizer 1000VA", specs: [["Capacity", "1000 VA"], ["Input", "140-280 V"], ["Output", "220 V"], ["Warranty", "2 years"]], warranty: "2 years" },
  { name: "Pearl Extension Board 4-Socket", specs: [["Sockets", "4 universal"], ["Cord", "3 m"], ["Rating", "2200 W"], ["Warranty", "1 year"]], warranty: "1 year" },
  { name: "Royal RCD Safety Breaker 40A", specs: [["Rating", "40 A / 30 mA"], ["Tripping", "under 0.1 s"], ["Standard", "IEC 61008"], ["Warranty", "2 years"]], warranty: "2 years" },
];

/* catalogue */
const catBlocks = [
  { type: "sub", text: "Complete product range 2026 - prices are suggested retail in PKR" },
  { type: "rule" },
];
[...fanList, ...lightList, ...sensorList, ...elecList].forEach((p) => {
  catBlocks.push({ type: "head", text: `${p.name} - Rs ${p.specs[0][1] ? "" : ""} (see spec sheets)` });
  catBlocks.push({ type: "body", text: `Category specs & warranty available on the PES website. Warranty: ${p.warranty}.` });
  catBlocks.push({ type: "rule" });
});

/* warranty policy */
const warrantyBlocks = [
  { type: "sub", text: "Effective from 1 January 2026" },
  { type: "rule" },
  { type: "body", text: "1. Pearl Electric Solutions (PES) warrants its products to be free from defects in materials and workmanship under normal domestic use for the period stated on the product's warranty card." },
  { type: "body", text: "2. Warranty periods: Ceiling fans, exhaust fans, MCBs, RCDs, stabilizers and copper wiring - 2 years. LED lighting, sensors, pedestal and wall fans - 1 year." },
  { type: "body", text: "3. Coverage: manufacturing defects only. Excludes damage from misuse, voltage fluctuation, tampering, water damage, or repairs by unauthorized persons." },
  { type: "body", text: "4. Claim procedure: present the original receipt and completed warranty card at any authorized PES dealer or service center." },
  { type: "body", text: "5. Resolution: PES will repair or, at its discretion, replace the defective product. No cash refunds are provided under this policy." },
  { type: "body", text: "6. This warranty is in addition to any statutory rights the customer may have under applicable law." },
  { type: "rule" },
  { type: "body", text: "For support contact: +92 91 525 6789 | info@pearlelectric.pk | www.pearlelectric.pk" },
];

/* write out */
const docs = [
  ["pes-fans-specs.pdf", "Fans - Specification Sheets", catSpecs(fanList, "Fans")],
  ["pes-lights-specs.pdf", "LED Lighting - Specification Sheets", catSpecs(lightList, "LED Lighting")],
  ["pes-sensors-specs.pdf", "Smart Sensors - Specification Sheets", catSpecs(sensorList, "Smart Sensors")],
  ["pes-electrical-specs.pdf", "Electrical Accessories - Specification Sheets", catSpecs(elecList, "Electrical Accessories")],
  ["pes-catalogue.pdf", "Complete Product Catalogue", catBlocks],
  ["pes-warranty-policy.pdf", "PES Warranty Policy", warrantyBlocks],
];

for (const [file, title, blocks] of docs) {
  const data = buildPdf(title, blocks);
  writeFileSync(join(outDir, file), data, "utf8");
  console.log("✓", "downloads/" + file, "(" + Math.round(data.length / 1024) + " KB)");
}
console.log("\nAll PDFs generated ✅");

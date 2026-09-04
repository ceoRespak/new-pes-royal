/**
 * generate-store-pdfs.mjs
 * -----------------------
 * Generates REAL, truthful PDF documents for the store from the imported
 * www.pespeshawar.pk data (scripts/pes-data/*.json):
 *
 *   public/downloads/pes-catalogue.pdf   — full price catalogue (100 products)
 *   public/downloads/pes-return-policy.pdf — return, delivery & hours
 *   public/downloads/pes-about-brands.pdf  — who we are + brands we stock
 *
 * Run:  node scripts/generate-store-pdfs.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "pes-data");
const outDir = join(here, "..", "public", "downloads");
mkdirSync(outDir, { recursive: true });

const load = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));
const products = load("products.json");
const settingsRaw = load("settings.json");
const parseMaybe = (v) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (!t.startsWith("[") && !t.startsWith("{")) return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};
const settings = Object.fromEntries(
  Object.entries(settingsRaw).map(([k, v]) => [k, parseMaybe(v)])
);

const clean = (s = "") =>
  String(s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .replace(/[\u0000-\u001f]/g, " ")
    .trim();
const firstNumber = (s) => {
  const m = String(s ?? "").match(/(\d[\d,]*)/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};
const esc = (t) =>
  String(t).replace(/[^\x20-\x7e]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/* --------------------------- tiny PDF writer --------------------------- */
function buildPdf(title, blocks) {
  const BODY = 10;
  const left = 56;
  const top = 740;
  const bottom = 60;
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

  const startPage = () => {
    ops = [];
    y = top;
    ops.push(`BT /F2 14 Tf ${left} ${y} Td (RESPAK EXPRESS - Peshawar) Tj ET`);
    ops.push(`BT /F1 8.5 Tf ${left} ${y - 13} Td (Genuine electrical products | Same-day delivery in Peshawar) Tj ET`);
    ops.push(`0.35 0.69 0.93 RG ${left} ${y - 20} m 556 ${y - 20} l S`);
    y -= 30;
    ops.push(`BT /F2 18 Tf ${left} ${y} Td (${esc(title)}) Tj ET`);
    y -= 26;
  };

  blocks.forEach((b) => {
    if (b.type === "head") {
      ensure(26);
      ops.push(`BT /F2 12 Tf ${left} ${y} Td (${esc(b.text)}) Tj ET`);
      y -= 20;
    } else {
      // body / bullet / spacer / rule
      const wrap = 52;
      if (b.type === "rule") {
        ensure(12);
        ops.push(`0.83 0.68 0.22 RG ${left} ${y} m 556 ${y} l S`);
        y -= 12;
      } else if (b.type === "spacer") {
        y -= 8;
      } else {
        const prefix = b.type === "bullet" ? "  -  " : "";
        let remainder = b.text ?? "";
        do {
          const chunk = remainder.slice(0, wrap);
          ensure(18);
          ops.push(`BT /F1 ${BODY} Tf ${left} ${y} Td (${esc(prefix + chunk)}) Tj ET`);
          remainder = remainder.slice(wrap);
          y -= 15;
        } while (remainder.length > 0);
      }
    }
  });
  pages.push(ops);

  const objects = [];
  const add = (body) => (objects.push(body), objects.length);
  const fontIds = {};
  const pageIds = [];
  const contentIds = [];
  const catalogId = add("");
  const pagesId = add("");
  fontIds.F1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  fontIds.F2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  pages.forEach(() => {
    contentIds.push(add(""));
    pageIds.push(add(""));
  });
  pages.forEach((p, i) => {
    objects[contentIds[i] - 1] = `<< /Length ${p.join("\n").length} >>\nstream\n${p.join("\n")}\nendstream`;
  });
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>`;
  pageIds.forEach((id, i) => {
    objects[id - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontIds.F1} 0 R /F2 ${fontIds.F2} 0 R >> >> ` +
      `/Contents ${contentIds[i]} 0 R >>`;
  });
  const infoId = add(`<< /Title (${esc(title)}) /Producer (Respak Express) >>`);
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++)
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return pdf;
}

/* --------------------------- content --------------------------- */
const price = (p) => {
  const n = firstNumber(p.sale_price ?? p.price) ?? firstNumber(p.price);
  const reg = firstNumber(p.price);
  return reg && n && n < reg
    ? `Rs ${reg} (sale Rs ${n})`
    : `Rs ${n ?? "call"}`;
};

// Catalogue grouped by category
const byCat = {};
products.forEach((p) => {
  const c = clean(p.category) || "Others";
  (byCat[c] = byCat[c] || []).push(p);
});
const catBlocks = [{ type: "rule" }, { type: "body", text: `${clean(settings.returnPolicy || "7-day return policy for defective items.")}` }, { type: "body", text: `${clean(settings.deliveryInfo || "Free delivery within Peshawar.")}` }];
Object.keys(byCat)
  .sort()
  .forEach((cat) => {
    catBlocks.push({ type: "head", text: `${cat} (${byCat[cat].length})` });
    byCat[cat].forEach((p) => {
      catBlocks.push({
        type: "body",
        text: `${clean(p.name)} — ${price(p)}`,
      });
    });
  });

const policyBlocks = [
  { type: "rule" },
  { type: "body", text: `Return policy: ${clean(settings.returnPolicy || "7-day return for defective items.")}` },
  { type: "body", text: `Delivery: ${clean(settings.deliveryInfo || "Free delivery within Peshawar city.")}` },
  { type: "body", text: `Working hours: ${clean(settings.workingHours || "Mon-Sat 9 AM - 8 PM, Sun closed")}` },
  { type: "spacer" },
  { type: "head", text: "Contact" },
  { type: "body", text: `Address: ${clean(settings.address || "")}` },
  { type: "body", text: `Phone: ${clean(settings.phone || "")} | WhatsApp: ${clean(settings.whatsappNumber || "")}` },
  { type: "body", text: `Email: ${clean(settings.email || "")}` },
];

const brandBlocks = [
  { type: "rule" },
  { type: "body", text: clean(settings.aboutDescription1 || "") },
  { type: "body", text: clean(settings.aboutDescription2 || "") },
  { type: "spacer" },
  { type: "head", text: "Brands we stock & distribute" },
  ...["Pakistan Cables", "AGE Cables", "Fast Cables", "Philips", "Schneider", "ABB", "Opal", "Royal Fans", "Voldam Fan", "Lahore Fan", "Pak Fan", "BlueDot Smart Home"].map((b) => ({
    type: "bullet",
    text: b,
  })),
  { type: "spacer" },
  { type: "head", text: "What we offer" },
  { type: "bullet", text: "Ceiling, bracket & exhaust fans" },
  { type: "bullet", text: "LED lighting solutions" },
  { type: "bullet", text: "Wires, cables, switches & sockets" },
  { type: "bullet", text: "MCBs, MCCBs, RCDs, change-overs & distribution boards" },
  { type: "bullet", text: "Solar accessories, earthing & smart-home products" },
  { type: "bullet", text: "Expert advice for electricians, contractors & homeowners" },
];

const docs = [
  ["pes-catalogue.pdf", "Product Price Catalogue", catBlocks],
  ["pes-return-policy.pdf", "Returns, Delivery & Contact", policyBlocks],
  ["pes-about-brands.pdf", "About Us & Brands We Stock", brandBlocks],
];

for (const [file, title, blocks] of docs) {
  const data = buildPdf(title, blocks);
  writeFileSync(join(outDir, file), data, "utf8");
  console.log("✓", "downloads/" + file, "(" + Math.round(data.length / 1024) + " KB)");
}
console.log("\nStore PDFs generated ✅");

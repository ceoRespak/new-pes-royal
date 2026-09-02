/**
 * generate-images.mjs
 * -------------------
 * Deterministically writes the placeholder artwork used by the site as local
 * SVG files (products, categories, hero, brand story, gallery...).
 *
 * These are clearly-branded *placeholders* — swap them for real photography
 * later without touching any code, since the data files only reference URLs.
 *
 * Run:  node scripts/generate-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/* ------------------------------------------------------------------ */
/* tiny helpers                                                        */
/* ------------------------------------------------------------------ */
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&#34;");
}

function write(rel, svg) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
  console.log("✓", rel);
}

/* ------------ vector family icons (local coords, centred 0,0) ------------ */
const FAMILIES = {
  fan: (c1, c2) => `
    <g transform="rotate(-18)">
      <g fill="${c2}" opacity="0.92">
        <ellipse cx="0" cy="-96" rx="34" ry="118" transform="rotate(0)"/>
        <ellipse cx="0" cy="-96" rx="34" ry="118" transform="rotate(120)"/>
        <ellipse cx="0" cy="-96" rx="34" ry="118" transform="rotate(240)"/>
      </g>
      <circle r="118" fill="none" stroke="${c1}" stroke-width="14"/>
      <circle r="96" fill="none" stroke="${c2}" stroke-opacity="0.35" stroke-width="5"/>
      <circle r="40" fill="${c1}"/>
      <circle r="16" fill="#fff" opacity="0.85"/>
    </g>`,
  bulb: (c1, c2) => `
    <g>
      <circle cy="-6" r="88" fill="${c2}" opacity="0.9"/>
      <path d="M-36 70 H36 L44 122 H-44 Z" fill="${c1}"/>
      <rect x="-30" y="122" width="60" height="14" rx="7" fill="${c1}"/>
      <path d="M-128 -60 H-96 M96 -60 H128 M-92 -128 L-70 -106 M70 -106 L92 -128 M0 -158 V-190" stroke="${c1}" stroke-width="14" stroke-linecap="round"/>
      <circle r="20" fill="#fff" opacity="0.75" cx="-34" cy="-40"/>
    </g>`,
  sensor: (c1, c2) => `
    <g>
      <rect x="-92" y="-120" width="184" height="240" rx="46" fill="${c2}" opacity="0.95"/>
      <rect x="-62" y="-92" width="124" height="120" rx="30" fill="#0d1b2a"/>
      <circle cy="-32" r="30" fill="url(#accentGrad)"/>
      <circle cy="-32" r="12" fill="#fff"/>
      <path d="M-40 -150 q40 30 0 56 q-40 30 0 56 M40 -150 q-40 30 0 56 q40 30 0 56" fill="none" stroke="${c1}" stroke-width="12" stroke-linecap="round" opacity="0.85"/>
      <circle cy="52" r="10" fill="#4ade80"/>
      <rect x="-34" y="40" width="68" height="24" rx="12" fill="${c1}" opacity="0.35"/>
    </g>`,
  electrical: (c1, c2) => `
    <g>
      <rect x="-104" y="-128" width="208" height="256" rx="40" fill="${c2}" opacity="0.95"/>
      <path d="M24 -84 L-40 -8 H4 L-24 84 L52 -12 H8 Z" fill="url(#accentGrad)"/>
      <rect x="-60" y="-104" width="44" height="20" rx="10" fill="${c1}" opacity="0.5"/>
      <rect x="-88" y="-128" width="26" height="60" rx="8" fill="${c1}" opacity="0.35"/>
    </g>`,
  pedestalFan: (c1, c2) => `
    <g>
      <circle cy="-108" r="112" fill="none" stroke="${c2}" stroke-width="10"/>
      <g fill="${c2}" opacity="0.9">
        <ellipse cx="0" cy="-108" rx="30" ry="86" transform="rotate(40 0 -108)"/>
        <ellipse cx="0" cy="-108" rx="30" ry="86" transform="rotate(200 0 -108)"/>
      </g>
      <circle cy="-108" r="34" fill="${c1}"/>
      <rect x="-14" y="6" width="28" height="120" rx="8" fill="${c1}"/>
      <path d="M-70 126 H70 L52 168 H-52 Z" fill="${c1}"/>
      <rect x="-52" y="168" width="104" height="18" rx="9" fill="${c2}"/>
    </g>`,
  panel: (c1, c2) => `
    <g>
      <circle r="130" fill="${c2}" opacity="0.85"/>
      <circle r="100" fill="none" stroke="url(#accentGrad)" stroke-width="18"/>
      <circle r="46" fill="url(#accentGrad)"/>
      <circle r="18" fill="#fff" opacity="0.9"/>
      <path d="M0 -180 V-150 M0 150 V180 M-180 0 H-150 M150 0 H180" stroke="${c1}" stroke-width="12" stroke-linecap="round"/>
    </g>`,
  smoke: (c1, c2) => `
    <g>
      <circle r="118" fill="${c2}" opacity="0.92"/>
      <circle r="118" fill="none" stroke="${c1}" stroke-width="6" stroke-dasharray="14 10"/>
      <circle r="74" fill="none" stroke="${c1}" stroke-width="12"/>
      <circle r="38" fill="${c1}"/>
      <circle r="14" fill="#fff" opacity="0.85"/>
      <rect x="-16" y="118" width="32" height="34" rx="8" fill="${c1}"/>
    </g>`,
  mcb: (c1, c2) => `
    <g>
      <rect x="-80" y="-120" width="160" height="240" rx="22" fill="${c2}" opacity="0.95"/>
      <rect x="-52" y="-88" width="104" height="150" rx="16" fill="#0d1b2a"/>
      <rect x="-30" y="-62" width="60" height="10" rx="5" fill="${c1}"/>
      <rect x="-30" y="30" width="60" height="10" rx="5" fill="${c1}"/>
      <rect x="-14" y="-18" width="28" height="26" rx="4" fill="${c1}"/>
      <rect x="-22" y="60" width="44" height="16" rx="6" fill="${c1}" opacity="0.6"/>
    </g>`,
  socket: (c1, c2) => `
    <g>
      <rect x="-104" y="-128" width="208" height="256" rx="34" fill="${c2}" opacity="0.95"/>
      <rect x="-66" y="-92" width="132" height="88" rx="16" fill="#0d1b2a"/>
      <circle cx="-32" cy="-48" r="14" fill="none" stroke="${c1}" stroke-width="10"/>
      <rect x="-44" y="-58" width="10" height="20" rx="4" fill="${c1}"/>
      <circle cx="32" cy="-48" r="14" fill="none" stroke="${c1}" stroke-width="10"/>
      <rect x="34" y="-58" width="10" height="20" rx="4" fill="${c1}"/>
      <rect x="-50" y="40" width="100" height="26" rx="13" fill="${c1}" opacity="0.9"/>
      <rect x="-38" y="34" width="12" height="38" rx="5" fill="${c2}"/>
      <rect x="26" y="34" width="12" height="38" rx="5" fill="${c2}"/>
    </g>`,
  wire: (c1, c2) => `
    <g>
      <circle r="120" fill="${c2}" opacity="0.9"/>
      <circle r="120" fill="none" stroke="${c1}" stroke-width="10"/>
      <path d="M0 0 m0 6 a6 6 0 0 1 0 12 a6 6 0 0 1 0 -12 m0 34 a14 14 0 0 0 0 28 m0 34 a14 14 0 0 0 0 28" stroke="${c1}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M-40 -60 A 44 44 0 0 1 40 -60" fill="none" stroke="url(#accentGrad)" stroke-width="12" stroke-linecap="round"/>
    </g>`,
  stabilizer: (c1, c2) => `
    <g>
      <rect x="-120" y="-140" width="240" height="280" rx="30" fill="${c2}" opacity="0.95"/>
      <path d="M28 -120 L-30 -30 H18 L-28 80 L56 -52 H4 Z" fill="url(#accentGrad)"/>
      <circle cx="-70" cy="90" r="14" fill="none" stroke="${c1}" stroke-width="8"/>
      <circle cx="0" cy="90" r="14" fill="none" stroke="${c1}" stroke-width="8"/>
      <circle cx="70" cy="90" r="14" fill="none" stroke="${c1}" stroke-width="8"/>
      <rect x="-110" y="-150" width="220" height="22" rx="11" fill="${c1}" opacity="0.6"/>
    </g>`,
  extension: (c1, c2) => `
    <g>
      <rect x="-150" y="-120" width="300" height="240" rx="36" fill="${c2}" opacity="0.95"/>
      <circle cx="-75" cy="-30" r="30" fill="#0d1b2a"/>
      <rect x="-92" y="-46" width="10" height="32" rx="4" fill="${c1}"/>
      <circle cx="0" cy="-30" r="30" fill="#0d1b2a"/>
      <rect x="-17" y="-46" width="10" height="32" rx="4" fill="${c1}"/>
      <circle cx="75" cy="-30" r="30" fill="#0d1b2a"/>
      <rect x="58" y="-46" width="10" height="32" rx="4" fill="${c1}"/>
      <rect x="-24" y="52" width="48" height="18" rx="9" fill="${c1}"/>
      <path d="M0 70 v40 q0 12 -12 12 h-34" fill="none" stroke="${c1}" stroke-width="14" stroke-linecap="round"/>
    </g>`,
};

/* --------------- base studio-scene template --------------- */
function productArt({
  file,
  accent,
  family,
  label,
  sub,
  angle = 0,
  tint,
}) {
  const c1 = accent; // main
  const c2 = tint ?? "#0a3d6e"; // deep partner colour
  const icon = FAMILIES[family] ? FAMILIES[family](c1, c2) : FAMILIES.electrical(c1, c2);
  const rotation = angle * 22;
  const bgGrad =
    angle % 2 === 0
      ? `<linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fbfcfe"/><stop offset="1" stop-color="#e9eef7"/>
        </linearGradient>`
      : `<linearGradient id="bgGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#fdfaf1"/><stop offset="1" stop-color="#eef0f8"/>
        </linearGradient>`;
  const subTxt =
    angle === 0 ? "Front View" : angle === 1 ? "Studio Angle" : "Detail Close-up";
  const fs = label.length > 30 ? 26 : label.length > 20 ? 30 : 34;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    ${bgGrad}
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="#b3922a"/>
    </linearGradient>
    <radialGradient id="spot" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="900" fill="url(#bgGrad)"/>
  <circle cx="450" cy="430" r="330" fill="url(#spot)"/>
  <g stroke="${c1}" stroke-opacity="0.08">
    <circle cx="120" cy="140" r="70" fill="none" stroke-width="2"/>
    <circle cx="810" cy="760" r="120" fill="none" stroke-width="2"/>
  </g>
  <g transform="translate(450 420)">
    <ellipse cx="0" cy="216" rx="240" ry="26" fill="${c1}" opacity="0.10"/>
    <g transform="rotate(${rotation})">
      <circle r="150" fill="#ffffff" opacity="0.55"/>
      <g transform="translate(0 -14) scale(1.22)">${icon}</g>
    </g>
  </g>
  <rect x="40" y="40" width="150" height="46" rx="23" fill="${c1}" opacity="0.92"/>
  <text x="115" y="70" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="800" letter-spacing="3" fill="#ffffff" text-anchor="middle">PES</text>
  <circle cx="850" cy="66" r="26" fill="#ffffff" opacity="0.85"/>
  <text x="850" y="74" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700" fill="${c1}" text-anchor="middle">${angle + 1}</text>
  <text x="450" y="700" font-family="Arial,Helvetica,sans-serif" font-size="${fs}" font-weight="700" fill="#12263a" text-anchor="middle">${esc(label)}</text>
  <text x="450" y="738" font-family="Arial,Helvetica,sans-serif" font-size="19" letter-spacing="6" fill="${c1}" text-anchor="middle">${esc(sub)}</text>
  <line x1="310" y1="776" x2="590" y2="776" stroke="${c1}" stroke-opacity="0.35" stroke-width="3"/>
  <text x="450" y="812" font-family="Arial,Helvetica,sans-serif" font-size="15" letter-spacing="2" fill="#6b7a90" text-anchor="middle">${subTxt} · placeholder artwork</text>
</svg>`;
  return svg;
}

/* hero illustration with transparent background */
function heroArt({ accent, family, glow }) {
  const c1 = accent;
  const c2 = "#ffffff";
  const icon = FAMILIES[family] ? FAMILIES[family](c1, c2) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="halo" cx="0.5" cy="0.45" r="0.5">
      <stop offset="0" stop-color="${c1}" stop-opacity="${glow}"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e4c566"/><stop offset="1" stop-color="#b3922a"/>
    </linearGradient>
  </defs>
  <circle cx="600" cy="540" r="520" fill="url(#halo)"/>
  <g transform="translate(600 540)">
    <circle r="330" fill="#ffffff" opacity="0.06"/>
    <circle r="330" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="3" stroke-dasharray="8 14"/>
    <g transform="translate(0 -20) scale(2.35)">${icon}</g>
  </g>
  <g fill="${c1}" opacity="0.9">
    <circle cx="180" cy="220" r="12"/><circle cx="1030" cy="340" r="16"/>
    <circle cx="900" cy="150" r="9"/><circle cx="260" cy="920" r="13"/>
    <circle cx="1040" cy="880" r="10"/>
  </g>
</svg>`;
}

/* category tile (landscape) */
function categoryArt({ id, accent, family, label, count }) {
  const c1 = accent;
  const c2 = "#0a3d6e";
  const icon = FAMILIES[family] ? FAMILIES[family](c1, c2) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a4788"/><stop offset="1" stop-color="#001a33"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g opacity="0.08">
    <circle cx="90" cy="80" r="90" fill="none" stroke="#fff" stroke-width="2"/>
    <circle cx="700" cy="520" r="150" fill="none" stroke="#fff" stroke-width="2"/>
  </g>
  <circle cx="600" cy="120" r="180" fill="#d4af37" opacity="0.10"/>
  <g transform="translate(560 320) scale(1.7)">${icon}</g>
  <text x="90" y="330" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="800" fill="#ffffff">${esc(label)}</text>
  <text x="90" y="372" font-family="Arial,Helvetica,sans-serif" font-size="18" letter-spacing="4" fill="#e4c566">${count} PRODUCT FAMILIES</text>
</svg>`;
}

/* gallery / brand scenes (landscape 1200x800 or 900x600) */
function sceneArt({ file, w, h, accent, family, headline, sub, city }) {
  const c1 = accent;
  const icon = FAMILIES[family] ? FAMILIES[family](c1, "#0a3d6e") : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b2240"/><stop offset="0.6" stop-color="#0a4788"/><stop offset="1" stop-color="#003366"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.2" r="0.8">
      <stop offset="0" stop-color="${c1}" stop-opacity="0.35"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g opacity="0.06"><path d="M0 ${h * 0.33} H${w} M0 ${h * 0.66} H${w} M${w * 0.33} 0 V${h} M${w * 0.66} 0 V${h}" stroke="#fff" stroke-width="2"/></g>
  <g transform="translate(${w * 0.5} ${h * 0.46})">
    <circle r="${h * 0.28}" fill="#fff" opacity="0.05"/>
    <g transform="scale(${h / 820})">${icon}</g>
  </g>
  <rect x="0" y="${h - 90}" width="${w}" height="90" fill="#001a33" opacity="0.85"/>
  <text x="${w * 0.5}" y="${h - 48}" font-family="Arial,Helvetica,sans-serif" font-size="${Math.round(h / 26)}" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(headline)}</text>
  <text x="${w * 0.5}" y="${h - 20}" font-family="Arial,Helvetica,sans-serif" font-size="${Math.round(h / 52)}" letter-spacing="3" fill="#e4c566" text-anchor="middle">${esc(sub)}${city ? " · " + esc(city) : ""}</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Product config: [slug, view-label, family, accent]                  */
/* ------------------------------------------------------------------ */
const PRODUCTS = [
  ["royal-breeze-ceiling-fan", "Royal Breeze Ceiling Fan 56in", "fan", "#d4af37"],
  ["pearl-glide-ceiling-fan", "Pearl Glide Ceiling Fan 48in", "fan", "#5aa7d6"],
  ["pearl-storm-pedestal-fan", "Pearl Storm Pedestal Fan 18in", "pedestalFan", "#d4af37"],
  ["royal-comfort-wall-fan", "Royal Comfort Wall Fan 16in", "fan", "#b9a1d9"],
  ["pearl-airline-exhaust-fan", "Pearl Airline Exhaust Fan 12in", "fan", "#7ec8a8"],
  ["royal-breeze-high-speed-60", "Royal Breeze High Speed 60in", "fan", "#e07a3f"],
  ["pearl-crystal-led-panel", "Pearl Crystal LED Panel 24W", "panel", "#d4af37"],
  ["royal-glow-led-bulb", "Royal Glow LED Bulb 12W", "bulb", "#f2c14e"],
  ["pearl-beam-led-floodlight", "Pearl Beam LED Floodlight 50W", "panel", "#4f9de0"],
  ["royal-linear-led-batten", "Royal Linear LED Batten 20W", "electrical", "#9aa7b8"],
  ["pearl-garden-led-spotlight", "Pearl Garden LED Spotlight 10W", "bulb", "#7ec89b"],
  ["royal-tube-led-20w", "Royal Tube LED 20W 4ft", "electrical", "#8ab6f0"],
  ["pearl-motion-sensor-switch", "Pearl Motion Sensor Switch", "sensor", "#d4af37"],
  ["royal-smart-motion-flood", "Royal Smart Motion Floodlight", "sensor", "#e07a3f"],
  ["pearl-smoke-heat-detector", "Pearl Smoke Heat Detector", "smoke", "#d95f5f"],
  ["royal-temperature-controller", "Royal Temp & Timer Controller", "sensor", "#5aa7d6"],
  ["pearl-safe-mcb-16a", "Pearl Safe MCB 16A", "mcb", "#d4af37"],
  ["royal-socket-usb", "Royal Power Socket with USB", "socket", "#d4af37"],
  ["pearl-copper-wire-15mm", "Pearl Copper Wire 1.5mm", "wire", "#c9894a"],
  ["royal-stabilizer-1000va", "Royal Stabilizer 1000VA", "stabilizer", "#d4af37"],
  ["pearl-extension-board", "Pearl Extension Board 4-Socket", "extension", "#6a8fcf"],
  ["royal-rcd-circuit-breaker", "Royal RCD Safety Breaker 40A", "mcb", "#5fd0a6"],
];

PRODUCTS.forEach(([slug, label, family, accent], idx) => {
  const tone = idx % 2 === 0 ? "#0a3d6e" : "#123f5c";
  for (let v = 0; v < 3; v++) {
    write(
      `images/products/${slug}-${v + 1}.svg`,
      productArt({
        file: `${slug}-${v + 1}.svg`,
        accent,
        tint: tone,
        family,
        label,
        sub: "PES QUALITY RANGE",
        angle: v,
      })
    );
  }
});

/* hero */
write("images/hero/hero-fan.svg", heroArt({ accent: "#e4c566", family: "fan", glow: 0.18 }));
write("images/hero/hero-light.svg", heroArt({ accent: "#5fc3e0", family: "bulb", glow: 0.2 }));
write("images/hero/hero-sensor.svg", heroArt({ accent: "#e4c566", family: "sensor", glow: 0.18 }));

/* categories */
const CATS = [
  ["fans", "#d4af37", "fan", "Premium Fans", "06"],
  ["lights", "#5fc3e0", "bulb", "LED Lighting", "06"],
  ["sensors", "#e4c566", "sensor", "Smart Sensors", "04"],
  ["electrical", "#7ec89b", "electrical", "Electrical", "06"],
];
CATS.forEach(([id, accent, family, label, count]) =>
  write(`images/categories/${id}.svg`, categoryArt({ id, accent, family, label, count }))
);

/* brand & about */
write(
  "images/brand/story.svg",
  sceneArt({
    file: "story.svg", w: 720, h: 560, accent: "#d4af37", family: "panel",
    headline: "PES Experience Centre", sub: "Showroom · Peshawar",
  })
);
write(
  "images/brand/factory.svg",
  sceneArt({
    file: "factory.svg", w: 560, h: 400, accent: "#5aa7d6", family: "fan",
    headline: "Quality Control Lab", sub: "In-house testing",
  })
);
write(
  "images/about/company.svg",
  sceneArt({
    file: "company.svg", w: 640, h: 480, accent: "#d4af37", family: "electrical",
    headline: "Pearl Electric Solutions", sub: "Head Office & R&D",
  })
);

/* gallery */
const GALLERY = [
  ["project-1", "fan", "#d4af37", "Residential Fan Installation", "Fans", "Peshawar"],
  ["project-2", "panel", "#5fc3e0", "Luxury Lounge Lighting", "Lights", "Islamabad"],
  ["project-3", "bulb", "#e4c566", "Warehouse LED Retrofit", "Lights", "Hattar"],
  ["project-4", "sensor", "#7ec89b", "Office Security System", "Sensors", "Peshawar"],
  ["project-5", "panel", "#d98e4a", "Facade Lighting", "Lights", "Mardan"],
  ["project-6", "fan", "#7e9fe0", "School Ventilation", "Fans", "Swat"],
  ["project-7", "electrical", "#d4af37", "Showroom Display Zone", "Brand", "Peshawar"],
  ["project-8", "mcb", "#5fd0a6", "Hospital Safety Upgrade", "Electrical", "Abbottabad"],
  ["project-9", "bulb", "#c98bd9", "Restaurant Ambient Light", "Lights", "Islamabad"],
];
GALLERY.forEach(([id, family, accent, headline, cat, city]) =>
  write(
    `images/gallery/${id}.svg`,
    sceneArt({
      file: `${id}.svg`, w: 1200, h: 800, accent, family,
      headline, sub: cat, city,
    })
  )
);

console.log("\nAll placeholder artwork generated in /public/images ✅");

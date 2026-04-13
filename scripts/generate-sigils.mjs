/**
 * Generates unique procedural sigils for all 72 Goetic spirits.
 * Each sigil is derived from the spirit's number, planet, and rank,
 * producing a distinct geometric seal in the style of ceremonial magic.
 *
 * These are stylized interpretations, not manuscript reproductions.
 * For authentic sigils, trace from Sloane 2731/3825 or Mathers 1904.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const spirits = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "spirits.json"), "utf-8")
);

const PLANET_SYMBOLS = {
  Saturn: "\u2644",
  Jupiter: "\u2643",
  Mars: "\u2642",
  Sun: "\u2609",
  Venus: "\u2640",
  Mercury: "\u263F",
  Moon: "\u263D",
};

// Deterministic pseudo-random from seed
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Convert polar to cartesian
function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Generate SVG path for a regular polygon
function polygon(cx, cy, r, sides, rotation = 0) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i + rotation;
    const p = polar(cx, cy, r, angle);
    points.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return `<polygon points="${points.join(" ")}" fill="none" stroke="#d97706" stroke-width="1"/>`;
}

// Star polygon (pentagram, hexagram, etc.)
function starPolygon(cx, cy, r, points, skip, rotation = 0) {
  const vertices = [];
  for (let i = 0; i < points; i++) {
    const angle = (360 / points) * i + rotation;
    const p = polar(cx, cy, r, angle);
    vertices.push(p);
  }
  let d = "";
  let current = 0;
  const visited = new Set();
  while (visited.size < points) {
    if (!visited.has(current)) {
      if (d === "") {
        d += `M${vertices[current].x.toFixed(2)},${vertices[current].y.toFixed(2)}`;
      } else {
        d += `L${vertices[current].x.toFixed(2)},${vertices[current].y.toFixed(2)}`;
      }
      visited.add(current);
      current = (current + skip) % points;
    } else {
      d += "Z";
      // Find next unvisited
      for (let i = 0; i < points; i++) {
        if (!visited.has(i)) {
          current = i;
          d += `M${vertices[current].x.toFixed(2)},${vertices[current].y.toFixed(2)}`;
          break;
        }
      }
    }
  }
  d += "Z";
  return `<path d="${d}" fill="none" stroke="#d97706" stroke-width="1"/>`;
}

// Generate radial lines from center
function radialLines(cx, cy, rInner, rOuter, count, rotation, rand) {
  let lines = "";
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + rotation;
    const p1 = polar(cx, cy, rInner, angle);
    const p2 = polar(cx, cy, rOuter, angle);
    // Some lines get small crossbars or dots
    lines += `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="#d97706" stroke-width="1"/>`;

    if (rand() > 0.5) {
      // Small crossbar at end
      const cross = polar(p2.x, p2.y, 4, angle + 90);
      const cross2 = polar(p2.x, p2.y, 4, angle - 90);
      lines += `<line x1="${cross.x.toFixed(2)}" y1="${cross.y.toFixed(2)}" x2="${cross2.x.toFixed(2)}" y2="${cross2.y.toFixed(2)}" stroke="#d97706" stroke-width="1"/>`;
    }
    if (rand() > 0.6) {
      // Small circle at end
      lines += `<circle cx="${p2.x.toFixed(2)}" cy="${p2.y.toFixed(2)}" r="2.5" fill="#d97706"/>`;
    }
  }
  return lines;
}

// Curved sigil lines — the distinctive flowing lines of Goetic seals
function sigilCurves(cx, cy, r, seed, count) {
  const rand = seededRandom(seed * 7 + 31);
  let paths = "";
  for (let i = 0; i < count; i++) {
    const startAngle = rand() * 360;
    const endAngle = startAngle + 60 + rand() * 180;
    const startR = 15 + rand() * (r - 30);
    const endR = 15 + rand() * (r - 30);
    const p1 = polar(cx, cy, startR, startAngle);
    const p2 = polar(cx, cy, endR, endAngle);
    const cp1 = polar(cx, cy, r * (0.3 + rand() * 0.5), startAngle + 30 + rand() * 60);
    const cp2 = polar(cx, cy, r * (0.3 + rand() * 0.5), endAngle - 30 - rand() * 60);

    paths += `<path d="M${p1.x.toFixed(1)},${p1.y.toFixed(1)} C${cp1.x.toFixed(1)},${cp1.y.toFixed(1)} ${cp2.x.toFixed(1)},${cp2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>`;

    // Terminal marks
    if (rand() > 0.4) {
      paths += `<circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="2" fill="#f59e0b"/>`;
    }
    if (rand() > 0.4) {
      paths += `<circle cx="${p2.x.toFixed(1)}" cy="${p2.y.toFixed(1)}" r="2" fill="#f59e0b"/>`;
    }
    // Small cross at midpoint sometimes
    if (rand() > 0.7) {
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      paths += `<line x1="${(mid.x - 4).toFixed(1)}" y1="${mid.y.toFixed(1)}" x2="${(mid.x + 4).toFixed(1)}" y2="${mid.y.toFixed(1)}" stroke="#f59e0b" stroke-width="1.5"/>`;
      paths += `<line x1="${mid.x.toFixed(1)}" y1="${(mid.y - 4).toFixed(1)}" x2="${mid.x.toFixed(1)}" y2="${(mid.y + 4).toFixed(1)}" stroke="#f59e0b" stroke-width="1.5"/>`;
    }
  }
  return paths;
}

// Rank determines the geometric frame
const RANK_SHAPES = {
  King: { sides: 6, innerShape: "hexagram" },
  Duke: { sides: 4, innerShape: "cross" },
  Prince: { sides: 5, innerShape: "pentagram" },
  Marquis: { sides: 3, innerShape: "triangle" },
  President: { sides: 8, innerShape: "octagon" },
  Earl: { sides: 4, innerShape: "diamond" },
  Knight: { sides: 7, innerShape: "heptagram" },
};

// Planet determines number of radial elements
const PLANET_RADIALS = {
  Saturn: 3,
  Jupiter: 4,
  Mars: 5,
  Sun: 6,
  Venus: 7,
  Mercury: 8,
  Moon: 9,
};

function generateSigil(spirit) {
  const cx = 100;
  const cy = 100;
  const outerR = 90;
  const innerR = 70;
  const rand = seededRandom(spirit.id * 137 + 42);

  const rankInfo = RANK_SHAPES[spirit.rank] || RANK_SHAPES.Duke;
  const radialCount = PLANET_RADIALS[spirit.planet] || 5;
  const rotation = (spirit.id * 17) % 360;
  const planetSymbol = PLANET_SYMBOLS[spirit.planet] || "";

  let elements = "";

  // Outer circle
  elements += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#d97706" stroke-width="1.5"/>`;

  // Second circle
  elements += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#d97706" stroke-width="0.75" stroke-dasharray="${rand() > 0.5 ? "none" : "3 2"}"/>`;

  // Optional third circle for Kings and Princes
  if (spirit.rank === "King" || spirit.rank === "Prince") {
    elements += `<circle cx="${cx}" cy="${cy}" r="${outerR - 5}" fill="none" stroke="#d97706" stroke-width="0.5"/>`;
  }

  // Geometric frame based on rank
  if (rankInfo.innerShape === "hexagram") {
    elements += starPolygon(cx, cy, innerR - 5, 6, 2, rotation);
  } else if (rankInfo.innerShape === "pentagram") {
    elements += starPolygon(cx, cy, innerR - 5, 5, 2, rotation);
  } else if (rankInfo.innerShape === "heptagram") {
    elements += starPolygon(cx, cy, innerR - 5, 7, 3, rotation);
  } else if (rankInfo.innerShape === "cross") {
    const s = innerR - 15;
    elements += `<line x1="${cx}" y1="${cy - s}" x2="${cx}" y2="${cy + s}" stroke="#d97706" stroke-width="1"/>`;
    elements += `<line x1="${cx - s}" y1="${cy}" x2="${cx + s}" y2="${cy}" stroke="#d97706" stroke-width="1"/>`;
  } else if (rankInfo.innerShape === "diamond") {
    elements += polygon(cx, cy, innerR - 10, 4, 45 + rotation);
  } else if (rankInfo.innerShape === "triangle") {
    elements += polygon(cx, cy, innerR - 8, 3, rotation);
  } else if (rankInfo.innerShape === "octagon") {
    elements += polygon(cx, cy, innerR - 8, 8, rotation);
  }

  // Radial lines
  elements += radialLines(
    cx, cy,
    innerR - 5,
    outerR - 2,
    radialCount,
    rotation + 15,
    seededRandom(spirit.id * 53 + 7)
  );

  // Unique sigil curves — the flowing lines that make each seal distinctive
  const curveCount = 3 + Math.floor(rand() * 4);
  elements += sigilCurves(cx, cy, innerR - 10, spirit.id, curveCount);

  // Small inner marks based on spirit number
  const markCount = 2 + (spirit.id % 4);
  for (let i = 0; i < markCount; i++) {
    const angle = (360 / markCount) * i + rotation + 30;
    const mr = 20 + rand() * 20;
    const p = polar(cx, cy, mr, angle);
    if (rand() > 0.5) {
      elements += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.5" fill="#f59e0b"/>`;
    } else {
      elements += `<line x1="${(p.x - 3).toFixed(1)}" y1="${(p.y - 3).toFixed(1)}" x2="${(p.x + 3).toFixed(1)}" y2="${(p.y + 3).toFixed(1)}" stroke="#f59e0b" stroke-width="1"/>`;
      elements += `<line x1="${(p.x + 3).toFixed(1)}" y1="${(p.y - 3).toFixed(1)}" x2="${(p.x - 3).toFixed(1)}" y2="${(p.y + 3).toFixed(1)}" stroke="#f59e0b" stroke-width="1"/>`;
    }
  }

  // Planet symbol at center
  elements += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#f59e0b" font-size="18" font-family="serif">${planetSymbol}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
${elements}
</svg>`;
}

// Generate all 72
const outDir = join(__dirname, "..", "public", "sigils");
for (const spirit of spirits) {
  const id = String(spirit.id).padStart(3, "0");
  const svg = generateSigil(spirit);
  writeFileSync(join(outDir, `${id}.svg`), svg);
}

console.log(`Generated ${spirits.length} sigils in public/sigils/`);

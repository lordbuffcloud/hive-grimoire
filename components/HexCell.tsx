"use client";

import Link from "next/link";
import type { Spirit, Planet } from "@/lib/types";
import { PLANET_SYMBOLS, PLANET_COLORS } from "@/lib/planetaryHours";

interface HexCellProps {
  spirit: Spirit;
  isActive?: boolean; // true if current planetary hour matches this spirit's planet
  isHighlighted?: boolean; // true if matches search
}

export default function HexCell({
  spirit,
  isActive = false,
  isHighlighted = false,
}: HexCellProps) {
  const planetColor = PLANET_COLORS[spirit.planet as Planet];

  return (
    <Link
      href={`/spirit/${spirit.id}`}
      className="group block"
      aria-label={`${spirit.name}, ${spirit.rank}, Planet: ${spirit.planet}`}
    >
      <div
        className={`hex-clip relative flex aspect-[1/1.1547] w-full flex-col items-center justify-center transition-all duration-300 ${
          isActive
            ? "bg-amber/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            : "bg-obsidian-light"
        } ${
          isHighlighted
            ? "ring-2 ring-amber ring-offset-2 ring-offset-obsidian"
            : ""
        } group-hover:bg-obsidian-mid group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]`}
      >
        {/* Spirit number */}
        <span className="font-mono text-[10px] text-cream/30">
          {spirit.id}
        </span>

        {/* Planet symbol */}
        <span className="text-lg" style={{ color: planetColor }}>
          {PLANET_SYMBOLS[spirit.planet as Planet]}
        </span>

        {/* Spirit name */}
        <span className="mt-0.5 px-2 text-center font-serif text-xs font-semibold leading-tight text-cream/90 group-hover:text-amber">
          {spirit.name}
        </span>

        {/* Rank */}
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-cream/40">
          {spirit.rank}
        </span>

        {/* Active glow indicator */}
        {isActive && (
          <div className="absolute inset-0 hex-clip animate-pulse bg-amber/5" />
        )}
      </div>
    </Link>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { Spirit, Planet } from "@/lib/types";
import HexCell from "./HexCell";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlanetaryHour } from "@/hooks/usePlanetaryHour";
import { PLANET_SYMBOLS } from "@/lib/planetaryHours";
import { matchSpirits } from "@/lib/spiritMatcher";

const ALL_PLANETS: Planet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

interface HoneycombGridProps {
  spirits: Spirit[];
}

export default function HoneycombGrid({ spirits }: HoneycombGridProps) {
  const [search, setSearch] = useState("");
  const [planetFilter, setPlanetFilter] = useState<Planet | null>(null);
  const { lat, lng } = useGeolocation();
  const { currentHour } = usePlanetaryHour(lat, lng);

  const matchedIds = useMemo(() => {
    if (!search.trim()) return new Set<number>();
    const results = matchSpirits(search, spirits, 72);
    return new Set(results.map((r) => r.spirit.id));
  }, [search, spirits]);

  const filtered = useMemo(() => {
    let list = spirits;
    if (planetFilter) {
      list = list.filter((s) => s.planet === planetFilter);
    }
    return list;
  }, [spirits, planetFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by intent: wealth, love, knowledge, invisibility..."
            className="w-full rounded-lg border border-amber/20 bg-obsidian-light px-4 py-2.5 font-mono text-sm text-cream placeholder:text-cream/30 focus:border-amber/50 focus:outline-none focus:ring-1 focus:ring-amber/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
            >
              ×
            </button>
          )}
        </div>

        {/* Current planetary hour indicator */}
        {currentHour && (
          <div className="flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/10 px-3 py-2 font-mono text-xs text-amber">
            <span>{PLANET_SYMBOLS[currentHour.planet]}</span>
            <span>Hour of {currentHour.planet}</span>
          </div>
        )}
      </div>

      {/* Planet filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setPlanetFilter(null)}
          className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
            !planetFilter
              ? "bg-amber/20 text-amber"
              : "bg-obsidian-light text-cream/50 hover:text-cream"
          }`}
        >
          All
        </button>
        {ALL_PLANETS.map((planet) => (
          <button
            key={planet}
            onClick={() =>
              setPlanetFilter(planetFilter === planet ? null : planet)
            }
            className={`rounded-full px-3 py-1 font-mono text-xs transition-colors ${
              planetFilter === planet
                ? "bg-amber/20 text-amber"
                : "bg-obsidian-light text-cream/50 hover:text-cream"
            }`}
          >
            {PLANET_SYMBOLS[planet]} {planet}
          </button>
        ))}
      </div>

      {/* Honeycomb grid */}
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
        {filtered.map((spirit, index) => {
          // Offset every other row for honeycomb effect
          const cols =
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? 9
              : typeof window !== "undefined" && window.innerWidth >= 768
                ? 8
                : typeof window !== "undefined" && window.innerWidth >= 640
                  ? 6
                  : 4;
          const row = Math.floor(index / cols);
          const isOffsetRow = row % 2 === 1;

          return (
            <div
              key={spirit.id}
              className={isOffsetRow ? "translate-x-[50%]" : ""}
              style={{
                marginTop: index >= cols ? "-0.5rem" : undefined,
              }}
            >
              <HexCell
                spirit={spirit}
                isActive={currentHour?.planet === spirit.planet}
                isHighlighted={
                  search.trim().length > 0 && matchedIds.has(spirit.id)
                }
              />
            </div>
          );
        })}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-center font-mono text-xs text-cream/40">
          {matchedIds.size} spirit{matchedIds.size !== 1 ? "s" : ""} match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}

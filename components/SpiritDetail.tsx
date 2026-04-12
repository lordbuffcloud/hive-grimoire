"use client";

import { useState } from "react";
import Image from "next/image";
import type { Spirit, Planet } from "@/lib/types";
import { PLANET_SYMBOLS, PLANET_COLORS } from "@/lib/planetaryHours";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlanetaryHour } from "@/hooks/usePlanetaryHour";
import { getNextHourForPlanet } from "@/lib/planetaryHours";
import MeditationMode from "./MeditationMode";

interface SpiritDetailProps {
  spirit: Spirit;
}

export default function SpiritDetail({ spirit }: SpiritDetailProps) {
  const [meditating, setMeditating] = useState(false);
  const { lat, lng } = useGeolocation();
  const { currentHour } = usePlanetaryHour(lat, lng);

  const nextOptimal = getNextHourForPlanet(
    spirit.planet as Planet,
    lat,
    lng
  );
  const isOptimalNow = currentHour?.planet === spirit.planet;
  const planetColor = PLANET_COLORS[spirit.planet as Planet];

  if (meditating) {
    return (
      <MeditationMode
        spirit={spirit}
        onClose={() => setMeditating(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Sigil */}
      <div className="mb-8 flex justify-center">
        <div className="relative h-48 w-48 rounded-full border-2 border-amber/30 bg-obsidian-light p-4">
          <Image
            src={spirit.sigilPath}
            alt={`Sigil of ${spirit.name}`}
            fill
            className="object-contain p-4"
          />
        </div>
      </div>

      {/* Name and rank */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-4xl font-bold text-amber">
          {spirit.name}
        </h1>
        <p className="mt-1 font-mono text-sm uppercase tracking-widest text-cream/50">
          {spirit.rank} · {spirit.legions} Legions
        </p>
        <p className="mt-1 font-mono text-xs text-cream/30">
          Source: {spirit.manuscriptSource}
        </p>
      </div>

      {/* Description */}
      <p className="mb-8 text-center font-serif text-lg leading-relaxed text-cream/80">
        {spirit.description}
      </p>

      {/* Correspondences grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl" style={{ color: planetColor }}>
            {PLANET_SYMBOLS[spirit.planet as Planet]}
          </span>
          <p className="mt-1 font-mono text-xs text-cream/50">Planet</p>
          <p className="font-serif text-sm text-cream">{spirit.planet}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl text-amber">⬡</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Zodiac</p>
          <p className="font-serif text-sm text-cream">
            {spirit.zodiacQuinary}
          </p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl text-amber">⊕</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Direction</p>
          <p className="font-serif text-sm text-cream">{spirit.direction}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl text-amber">⚙</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Metal</p>
          <p className="font-serif text-sm text-cream">{spirit.metal}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl text-amber">☀</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Day</p>
          <p className="font-serif text-sm text-cream">{spirit.day}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3 text-center">
          <span className="text-2xl text-amber">#</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Number</p>
          <p className="font-serif text-sm text-cream">{spirit.id}</p>
        </div>
      </div>

      {/* Powers */}
      <div className="mb-8">
        <h2 className="mb-3 font-serif text-lg font-semibold text-amber">
          Powers & Domains
        </h2>
        <div className="flex flex-wrap gap-2">
          {spirit.powers.map((power) => (
            <span
              key={power}
              className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 font-mono text-xs text-amber"
            >
              {power}
            </span>
          ))}
        </div>
      </div>

      {/* Timing panel */}
      <div
        className={`mb-8 rounded-lg border p-4 ${
          isOptimalNow
            ? "border-amber/50 bg-amber/10"
            : "border-amber/10 bg-obsidian-light"
        }`}
      >
        <h2 className="mb-2 font-serif text-lg font-semibold text-amber">
          Timing
        </h2>
        {isOptimalNow ? (
          <p className="font-mono text-sm text-amber">
            ✦ NOW is an optimal time — Hour of {currentHour?.planet}
          </p>
        ) : nextOptimal ? (
          <p className="font-mono text-sm text-cream/70">
            Next optimal window:{" "}
            <span className="text-amber">
              {nextOptimal.start.toLocaleDateString(undefined, {
                weekday: "long",
              })}{" "}
              {nextOptimal.start.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {nextOptimal.end.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>{" "}
            (Hour of {spirit.planet})
          </p>
        ) : (
          <p className="font-mono text-sm text-cream/50">
            Calculating next window...
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setMeditating(true)}
          className="flex-1 rounded-lg bg-amber/20 px-4 py-3 font-serif text-sm font-semibold text-amber transition-colors hover:bg-amber/30"
        >
          Meditate on Sigil
        </button>
        <a
          href={`/journal?spirit=${spirit.id}`}
          className="flex-1 rounded-lg border border-amber/20 px-4 py-3 text-center font-serif text-sm font-semibold text-cream/70 transition-colors hover:border-amber/40 hover:text-cream"
        >
          Add to Journal
        </a>
      </div>
    </div>
  );
}

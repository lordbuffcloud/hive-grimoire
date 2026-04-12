"use client";

import { useState } from "react";
import Link from "next/link";
import type { Spirit, Planet } from "@/lib/types";
import { matchSpirits } from "@/lib/spiritMatcher";
import { PLANET_SYMBOLS, PLANET_COLORS, getNextHourForPlanet } from "@/lib/planetaryHours";
import { useGeolocation } from "@/hooks/useGeolocation";

interface IntentMatcherProps {
  spirits: Spirit[];
}

export default function IntentMatcher({ spirits }: IntentMatcherProps) {
  const [query, setQuery] = useState("");
  const { lat, lng } = useGeolocation();

  const results = query.trim()
    ? matchSpirits(query, spirits, 5)
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-amber">
        Intent Matcher
      </h1>
      <p className="mb-8 text-center font-mono text-sm text-cream/50">
        Describe your goal. The hive will find the right spirits.
      </p>

      {/* Query input */}
      <div className="mb-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you seek? e.g., &quot;I want to find hidden treasure&quot; or &quot;knowledge of herbs and healing&quot;"
          rows={3}
          className="w-full rounded-lg border border-amber/20 bg-obsidian-light px-4 py-3 font-serif text-sm text-cream placeholder:text-cream/30 focus:border-amber/50 focus:outline-none focus:ring-1 focus:ring-amber/30"
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="font-mono text-xs text-cream/40">
            {results.length} spirit{results.length !== 1 ? "s" : ""} matched
          </p>
          {results.map(({ spirit, score }) => {
            const nextHour = getNextHourForPlanet(
              spirit.planet as Planet,
              lat,
              lng
            );
            return (
              <Link
                key={spirit.id}
                href={`/spirit/${spirit.id}`}
                className="block rounded-lg border border-amber/10 bg-obsidian-light p-4 transition-colors hover:border-amber/30"
              >
                <div className="flex gap-4">
                  {/* Sigil thumbnail */}
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spirit.sigilPath}
                      alt={`Sigil of ${spirit.name}`}
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: PLANET_COLORS[spirit.planet as Planet],
                        }}
                      >
                        {PLANET_SYMBOLS[spirit.planet as Planet]}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-amber">
                        {spirit.name}
                      </h3>
                      <span className="font-mono text-xs text-cream/40">
                        {spirit.rank}
                      </span>
                    </div>

                    {/* Powers */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {spirit.powers.slice(0, 4).map((power) => (
                        <span
                          key={power}
                          className="rounded-full bg-amber/10 px-2 py-0.5 font-mono text-[10px] text-amber/70"
                        >
                          {power}
                        </span>
                      ))}
                    </div>

                    {/* Next timing */}
                    {nextHour && (
                      <p className="mt-2 font-mono text-xs text-cream/50">
                        Next window:{" "}
                        <span className="text-amber/70">
                          {nextHour.start.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}{" "}
                          {nextHour.start.toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Relevance score */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-mono text-lg text-amber/60">
                      {score}
                    </span>
                    <span className="font-mono text-[9px] text-cream/30">
                      score
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className="text-center font-mono text-sm text-cream/40">
          No spirits match that intent. Try different keywords.
        </p>
      )}

      {/* Example queries */}
      {!query.trim() && (
        <div className="mt-8">
          <p className="mb-3 font-mono text-xs text-cream/40">
            Try these intents:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "wealth and treasure",
              "love and desire",
              "hidden knowledge",
              "healing herbs",
              "protection",
              "eloquent speech",
              "war and victory",
              "alchemy and transformation",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="rounded-full border border-amber/15 px-3 py-1 font-mono text-xs text-cream/50 transition-colors hover:border-amber/30 hover:text-cream"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

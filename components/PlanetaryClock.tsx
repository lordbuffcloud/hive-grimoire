"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlanetaryHour } from "@/hooks/usePlanetaryHour";
import {
  PLANET_SYMBOLS,
  PLANET_COLORS,
  getDayRuler,
  getSunTimes,
} from "@/lib/planetaryHours";
import type { Planet } from "@/lib/types";
import { useState } from "react";

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlanetaryClock() {
  const { lat, lng, source, setManualLocation } = useGeolocation();
  const { currentHour, allHours, timeUntilNext, isBeforeSunrise } =
    usePlanetaryHour(lat, lng);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState(String(lat));
  const [manualLng, setManualLng] = useState(String(lng));

  const now = new Date();
  const calendarDayRuler = getDayRuler(now);

  // The planetary day ruler — if before sunrise, we're in yesterday's planetary day
  const planetaryDayRef = new Date(now);
  planetaryDayRef.setHours(12, 0, 0, 0);
  if (isBeforeSunrise) {
    planetaryDayRef.setDate(planetaryDayRef.getDate() - 1);
  }
  const planetaryDayRuler = getDayRuler(planetaryDayRef);
  const { sunrise, sunset } = getSunTimes(lat, lng, planetaryDayRef);

  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-amber">
        Planetary Hours
      </h1>
      <p className="mb-1 text-center font-mono text-sm text-cream/50">
        Chaldean order · Based on true sunrise/sunset
      </p>
      <p className="mb-8 text-center font-mono text-xs text-cream/40">
        {dayName} · {now.toLocaleDateString()}
      </p>

      {/* Before-sunrise notice */}
      {isBeforeSunrise && (
        <div className="mb-4 rounded-lg border border-cream/10 bg-obsidian-light px-4 py-2 text-center font-mono text-xs text-cream/50">
          Before sunrise — still in{" "}
          {planetaryDayRef.toLocaleDateString(undefined, { weekday: "long" })}
          &apos;s planetary night
        </div>
      )}

      {/* Current hour display */}
      {currentHour && (
        <div className="mb-8 rounded-lg border border-amber/30 bg-amber/10 p-6 text-center">
          <span
            className="text-5xl"
            style={{ color: PLANET_COLORS[currentHour.planet] }}
          >
            {PLANET_SYMBOLS[currentHour.planet]}
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold text-amber">
            Hour of {currentHour.planet}
          </h2>
          <p className="mt-1 font-mono text-sm text-cream/60">
            {currentHour.isDay ? "Day" : "Night"} hour{" "}
            {currentHour.hourNumber} of 12
          </p>
          <p className="mt-1 font-mono text-sm text-cream/60">
            {formatTime(currentHour.start)} – {formatTime(currentHour.end)}
          </p>
          <p className="mt-2 font-mono text-lg text-amber">
            {formatDuration(timeUntilNext)} remaining
          </p>
        </div>
      )}

      {/* Day info */}
      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3">
          <span
            className="text-xl"
            style={{ color: PLANET_COLORS[planetaryDayRuler] }}
          >
            {PLANET_SYMBOLS[planetaryDayRuler]}
          </span>
          <p className="mt-1 font-mono text-xs text-cream/50">
            {isBeforeSunrise ? "Planetary Day" : "Day Ruler"}
          </p>
          <p className="font-serif text-sm text-cream">{planetaryDayRuler}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3">
          <span className="text-xl text-amber">↑</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Sunrise</p>
          <p className="font-mono text-sm text-cream">{formatTime(sunrise)}</p>
        </div>
        <div className="rounded-lg border border-amber/10 bg-obsidian-light p-3">
          <span className="text-xl text-amber">↓</span>
          <p className="mt-1 font-mono text-xs text-cream/50">Sunset</p>
          <p className="font-mono text-sm text-cream">{formatTime(sunset)}</p>
        </div>
      </div>

      {/* Location info */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <p className="font-mono text-xs text-cream/30">
          {lat.toFixed(2)}°, {lng.toFixed(2)}° ({source})
        </p>
        <button
          onClick={() => setShowManual(!showManual)}
          className="font-mono text-xs text-amber/50 hover:text-amber"
        >
          {showManual ? "Hide" : "Set location"}
        </button>
      </div>

      {showManual && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <input
            type="number"
            step="any"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="Latitude"
            className="w-28 rounded border border-amber/20 bg-obsidian-light px-2 py-1 font-mono text-xs text-cream"
          />
          <input
            type="number"
            step="any"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            placeholder="Longitude"
            className="w-28 rounded border border-amber/20 bg-obsidian-light px-2 py-1 font-mono text-xs text-cream"
          />
          <button
            onClick={() => {
              const la = parseFloat(manualLat);
              const ln = parseFloat(manualLng);
              if (!isNaN(la) && !isNaN(ln)) {
                setManualLocation(la, ln);
                setShowManual(false);
              }
            }}
            className="rounded bg-amber/20 px-3 py-1 font-mono text-xs text-amber hover:bg-amber/30"
          >
            Set
          </button>
        </div>
      )}

      {/* 24-hour timeline */}
      <div className="space-y-1">
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber">
          {isBeforeSunrise
            ? `${planetaryDayRef.toLocaleDateString(undefined, { weekday: "long" })}'s Planetary Hours`
            : "Today\u2019s Hours"}
        </h3>
        {allHours.map((hour, i) => {
          const isCurrent =
            currentHour &&
            hour.start.getTime() === currentHour.start.getTime();
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
                isCurrent
                  ? "bg-amber/15 text-amber"
                  : "text-cream/60 hover:bg-obsidian-light"
              }`}
            >
              <span
                className="w-6 text-center text-base"
                style={{ color: PLANET_COLORS[hour.planet] }}
              >
                {PLANET_SYMBOLS[hour.planet]}
              </span>
              <span className="w-20">{hour.planet}</span>
              <span className="flex-1 text-xs text-cream/40">
                {formatTime(hour.start)} – {formatTime(hour.end)}
              </span>
              <span className="text-xs text-cream/30">
                {hour.isDay ? "\u2600" : "\u263D"} {hour.hourNumber}
              </span>
              {isCurrent && (
                <span className="text-xs text-amber">\u2190 now</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

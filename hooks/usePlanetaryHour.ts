"use client";

import { useState, useEffect } from "react";
import {
  getCurrentPlanetaryHour,
  getPlanetaryHours,
  getSunTimes,
} from "@/lib/planetaryHours";
import type { PlanetaryHour } from "@/lib/types";

interface PlanetaryHourState {
  currentHour: PlanetaryHour | null;
  allHours: PlanetaryHour[];
  timeUntilNext: number; // milliseconds
  isBeforeSunrise: boolean;
}

export function usePlanetaryHour(lat: number, lng: number) {
  const [state, setState] = useState<PlanetaryHourState>({
    currentHour: null,
    allHours: [],
    timeUntilNext: 0,
    isBeforeSunrise: false,
  });

  useEffect(() => {
    function update() {
      const now = new Date();
      const todayNoon = new Date(now);
      todayNoon.setHours(12, 0, 0, 0);

      const { sunrise } = getSunTimes(lat, lng, todayNoon);
      const isBeforeSunrise = now < sunrise;

      // If before sunrise, we're still in yesterday's planetary day.
      // Show yesterday's hours so the current hour appears in the timeline.
      const referenceDate = new Date(todayNoon);
      if (isBeforeSunrise) {
        referenceDate.setDate(referenceDate.getDate() - 1);
      }

      const currentHour = getCurrentPlanetaryHour(lat, lng, now);
      const allHours = getPlanetaryHours(lat, lng, referenceDate);
      const timeUntilNext = currentHour
        ? currentHour.end.getTime() - now.getTime()
        : 0;

      setState({ currentHour, allHours, timeUntilNext, isBeforeSunrise });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lat, lng]);

  return state;
}

"use client";

import { useState, useEffect } from "react";
import {
  getCurrentPlanetaryHour,
  getPlanetaryHours,
} from "@/lib/planetaryHours";
import type { PlanetaryHour } from "@/lib/types";

interface PlanetaryHourState {
  currentHour: PlanetaryHour | null;
  allHours: PlanetaryHour[];
  timeUntilNext: number; // milliseconds
}

export function usePlanetaryHour(lat: number, lng: number) {
  const [state, setState] = useState<PlanetaryHourState>({
    currentHour: null,
    allHours: [],
    timeUntilNext: 0,
  });

  useEffect(() => {
    function update() {
      const now = new Date();
      const todayNoon = new Date(now);
      todayNoon.setHours(12, 0, 0, 0);

      const currentHour = getCurrentPlanetaryHour(lat, lng, now);
      const allHours = getPlanetaryHours(lat, lng, todayNoon);
      const timeUntilNext = currentHour
        ? currentHour.end.getTime() - now.getTime()
        : 0;

      setState({ currentHour, allHours, timeUntilNext });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lat, lng]);

  return state;
}

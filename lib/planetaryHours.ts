import SunCalc from "suncalc";
import type { Planet, PlanetaryHour, PlanetaryDay } from "./types";

/**
 * Chaldean order of planets — the sequence used for planetary hours.
 * Each successive hour is ruled by the next planet in this cycle.
 */
const CHALDEAN_ORDER: Planet[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];

/**
 * Day rulers by weekday index (0 = Sunday).
 * The first hour of each day is ruled by the day's planet.
 */
const DAY_RULERS: Planet[] = [
  "Sun", // Sunday
  "Moon", // Monday
  "Mars", // Tuesday
  "Mercury", // Wednesday
  "Jupiter", // Thursday
  "Venus", // Friday
  "Saturn", // Saturday
];

/**
 * Returns the planetary ruler for a given date's weekday.
 */
export function getDayRuler(date: Date): Planet {
  return DAY_RULERS[date.getDay()];
}

/**
 * Gets the index in the Chaldean order for a given planet.
 */
function chaldeanIndex(planet: Planet): number {
  return CHALDEAN_ORDER.indexOf(planet);
}

/**
 * Returns the planet at offset positions after the given planet in Chaldean order.
 */
function chaldeanOffset(planet: Planet, offset: number): Planet {
  const idx = chaldeanIndex(planet);
  return CHALDEAN_ORDER[(idx + offset) % 7];
}

/**
 * Calculates sunrise and sunset for a given date and location.
 * Falls back to 6:00/18:00 if suncalc returns invalid values
 * (can happen at extreme latitudes).
 */
export function getSunTimes(
  lat: number,
  lng: number,
  date: Date
): { sunrise: Date; sunset: Date } {
  const times = SunCalc.getTimes(date, lat, lng);
  let sunrise = times.sunrise;
  let sunset = times.sunset;

  // Fallback for extreme latitudes where sun doesn't rise/set
  if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) {
    sunrise = new Date(date);
    sunrise.setHours(6, 0, 0, 0);
    sunset = new Date(date);
    sunset.setHours(18, 0, 0, 0);
  }

  return { sunrise, sunset };
}

/**
 * Calculates all 24 planetary hours for a given date and location.
 *
 * Day hours: sunrise to sunset, divided into 12 equal parts.
 * Night hours: sunset to next sunrise, divided into 12 equal parts.
 *
 * The first hour of the day is ruled by the day's planetary ruler.
 * Subsequent hours follow the Chaldean order.
 */
export function getPlanetaryHours(
  lat: number,
  lng: number,
  date: Date
): PlanetaryHour[] {
  const { sunrise, sunset } = getSunTimes(lat, lng, date);

  // Next day's sunrise for night hour calculation
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunrise = getSunTimes(lat, lng, nextDay).sunrise;

  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();
  const dayHourMs = dayDuration / 12;
  const nightHourMs = nightDuration / 12;

  const ruler = getDayRuler(date);
  const hours: PlanetaryHour[] = [];

  // 12 day hours
  for (let i = 0; i < 12; i++) {
    hours.push({
      planet: chaldeanOffset(ruler, i),
      start: new Date(sunrise.getTime() + i * dayHourMs),
      end: new Date(sunrise.getTime() + (i + 1) * dayHourMs),
      isDay: true,
      hourNumber: i + 1,
    });
  }

  // 12 night hours (continue Chaldean sequence from hour 13)
  for (let i = 0; i < 12; i++) {
    hours.push({
      planet: chaldeanOffset(ruler, 12 + i),
      start: new Date(sunset.getTime() + i * nightHourMs),
      end: new Date(sunset.getTime() + (i + 1) * nightHourMs),
      isDay: false,
      hourNumber: i + 1,
    });
  }

  return hours;
}

/**
 * Returns the full planetary day info for a given date and location.
 */
export function getPlanetaryDay(
  lat: number,
  lng: number,
  date: Date
): PlanetaryDay {
  const { sunrise, sunset } = getSunTimes(lat, lng, date);
  return {
    date,
    ruler: getDayRuler(date),
    sunrise,
    sunset,
    hours: getPlanetaryHours(lat, lng, date),
  };
}

/**
 * Finds which planetary hour is active at a given moment.
 * Checks today's hours first, then yesterday's night hours.
 */
export function getCurrentPlanetaryHour(
  lat: number,
  lng: number,
  now?: Date
): PlanetaryHour | null {
  const current = now ?? new Date();

  // Check today's hours
  const todayDate = new Date(current);
  todayDate.setHours(12, 0, 0, 0); // noon for suncalc date reference
  const todayHours = getPlanetaryHours(lat, lng, todayDate);

  for (const hour of todayHours) {
    if (current >= hour.start && current < hour.end) {
      return hour;
    }
  }

  // If before today's sunrise, check yesterday's night hours
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayHours = getPlanetaryHours(lat, lng, yesterday);

  for (const hour of yesterdayHours) {
    if (current >= hour.start && current < hour.end) {
      return hour;
    }
  }

  return null;
}

/**
 * Finds the next occurrence of a planetary hour ruled by the given planet.
 */
export function getNextHourForPlanet(
  planet: Planet,
  lat: number,
  lng: number,
  from?: Date
): PlanetaryHour | null {
  const now = from ?? new Date();

  // Check up to 7 days ahead (a full week covers all planet/day combos)
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + dayOffset);
    checkDate.setHours(12, 0, 0, 0);
    const hours = getPlanetaryHours(lat, lng, checkDate);

    for (const hour of hours) {
      if (hour.planet === planet && hour.end > now) {
        return hour;
      }
    }
  }

  return null;
}

/** Planet display symbols */
export const PLANET_SYMBOLS: Record<Planet, string> = {
  Saturn: "\u2644",
  Jupiter: "\u2643",
  Mars: "\u2642",
  Sun: "\u2609",
  Venus: "\u2640",
  Mercury: "\u263F",
  Moon: "\u263D",
};

/** Planet colors for UI */
export const PLANET_COLORS: Record<Planet, string> = {
  Saturn: "#6b7280", // gray
  Jupiter: "#7c3aed", // purple
  Mars: "#ef4444", // red
  Sun: "#f59e0b", // amber
  Venus: "#10b981", // emerald
  Mercury: "#f97316", // orange
  Moon: "#c4b5fd", // lavender
};

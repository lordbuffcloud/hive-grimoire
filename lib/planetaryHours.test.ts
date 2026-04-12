import { describe, it, expect } from "vitest";
import {
  getDayRuler,
  getPlanetaryHours,
  getCurrentPlanetaryHour,
  getSunTimes,
  getNextHourForPlanet,
} from "./planetaryHours";

// New York City coordinates for consistent testing
const NYC_LAT = 40.7128;
const NYC_LNG = -74.006;

describe("getDayRuler", () => {
  it("returns Sun for Sunday", () => {
    // 2024-03-17 is a Sunday
    expect(getDayRuler(new Date(2024, 2, 17))).toBe("Sun");
  });

  it("returns Moon for Monday", () => {
    expect(getDayRuler(new Date(2024, 2, 18))).toBe("Moon");
  });

  it("returns Mars for Tuesday", () => {
    expect(getDayRuler(new Date(2024, 2, 19))).toBe("Mars");
  });

  it("returns Mercury for Wednesday", () => {
    expect(getDayRuler(new Date(2024, 2, 20))).toBe("Mercury");
  });

  it("returns Jupiter for Thursday", () => {
    expect(getDayRuler(new Date(2024, 2, 21))).toBe("Jupiter");
  });

  it("returns Venus for Friday", () => {
    expect(getDayRuler(new Date(2024, 2, 22))).toBe("Venus");
  });

  it("returns Saturn for Saturday", () => {
    expect(getDayRuler(new Date(2024, 2, 23))).toBe("Saturn");
  });
});

describe("getSunTimes", () => {
  it("returns valid sunrise and sunset for NYC", () => {
    const date = new Date(2024, 2, 20); // March 20, 2024 (equinox)
    const { sunrise, sunset } = getSunTimes(NYC_LAT, NYC_LNG, date);

    expect(sunrise.getTime()).not.toBeNaN();
    expect(sunset.getTime()).not.toBeNaN();
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());

    // Around equinox, sunrise ~6:00-7:00 AM, sunset ~7:00-8:00 PM
    expect(sunrise.getHours()).toBeGreaterThanOrEqual(5);
    expect(sunrise.getHours()).toBeLessThanOrEqual(8);
    expect(sunset.getHours()).toBeGreaterThanOrEqual(17);
    expect(sunset.getHours()).toBeLessThanOrEqual(20);
  });
});

describe("getPlanetaryHours", () => {
  const date = new Date(2024, 2, 20); // Wednesday, March 20, 2024

  it("returns exactly 24 hours", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    expect(hours).toHaveLength(24);
  });

  it("has 12 day hours and 12 night hours", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    const dayHours = hours.filter((h) => h.isDay);
    const nightHours = hours.filter((h) => !h.isDay);
    expect(dayHours).toHaveLength(12);
    expect(nightHours).toHaveLength(12);
  });

  it("first day hour is ruled by the day's planet", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    // Wednesday → Mercury
    expect(hours[0].planet).toBe("Mercury");
  });

  it("follows Chaldean order for subsequent hours", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    // Wednesday: Mercury, Moon, Saturn, Jupiter, Mars, Sun, Venus, Mercury, ...
    expect(hours[0].planet).toBe("Mercury");
    expect(hours[1].planet).toBe("Moon");
    expect(hours[2].planet).toBe("Saturn");
    expect(hours[3].planet).toBe("Jupiter");
    expect(hours[4].planet).toBe("Mars");
    expect(hours[5].planet).toBe("Sun");
    expect(hours[6].planet).toBe("Venus");
    expect(hours[7].planet).toBe("Mercury"); // cycle repeats
  });

  it("hours are contiguous (no gaps)", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    for (let i = 0; i < hours.length - 1; i++) {
      // Each hour's end should equal the next hour's start (within 1ms tolerance)
      const gap = Math.abs(hours[i].end.getTime() - hours[i + 1].start.getTime());
      expect(gap).toBeLessThanOrEqual(1);
    }
  });

  it("day hours span from sunrise to sunset", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    const { sunrise, sunset } = getSunTimes(NYC_LAT, NYC_LNG, date);
    const firstDay = hours[0];
    const lastDay = hours[11];

    expect(Math.abs(firstDay.start.getTime() - sunrise.getTime())).toBeLessThanOrEqual(1);
    expect(Math.abs(lastDay.end.getTime() - sunset.getTime())).toBeLessThanOrEqual(1);
  });

  it("night hours span from sunset to next sunrise", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    const { sunset } = getSunTimes(NYC_LAT, NYC_LNG, date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextSunrise = getSunTimes(NYC_LAT, NYC_LNG, nextDay).sunrise;

    const firstNight = hours[12];
    const lastNight = hours[23];

    expect(Math.abs(firstNight.start.getTime() - sunset.getTime())).toBeLessThanOrEqual(1);
    expect(Math.abs(lastNight.end.getTime() - nextSunrise.getTime())).toBeLessThanOrEqual(1);
  });

  it("hour numbers are 1-12 for both day and night", () => {
    const hours = getPlanetaryHours(NYC_LAT, NYC_LNG, date);
    for (let i = 0; i < 12; i++) {
      expect(hours[i].hourNumber).toBe(i + 1);
      expect(hours[i + 12].hourNumber).toBe(i + 1);
    }
  });

  // Cross-check: Sunday's first hour should be Sun,
  // and the 1st hour of the following day (Monday) should be Moon.
  // Since the 13th hour of Sunday = first night hour,
  // and 24 hours later wraps back, the sequence from Sunday hour 1
  // through 24 hours should end such that the next day starts with Moon.
  it("Sunday sequence leads to Monday starting with Moon", () => {
    const sunday = new Date(2024, 2, 17); // Sunday
    const monday = new Date(2024, 2, 18); // Monday
    const sundayHours = getPlanetaryHours(NYC_LAT, NYC_LNG, sunday);
    const mondayHours = getPlanetaryHours(NYC_LAT, NYC_LNG, monday);

    expect(sundayHours[0].planet).toBe("Sun");
    expect(mondayHours[0].planet).toBe("Moon");
  });
});

describe("getCurrentPlanetaryHour", () => {
  it("returns a valid hour for a known time", () => {
    // Wednesday March 20, 2024, noon
    const noon = new Date(2024, 2, 20, 12, 0, 0);
    const hour = getCurrentPlanetaryHour(NYC_LAT, NYC_LNG, noon);

    expect(hour).not.toBeNull();
    expect(hour!.isDay).toBe(true);
    expect(noon >= hour!.start).toBe(true);
    expect(noon < hour!.end).toBe(true);
  });

  it("returns a night hour for midnight", () => {
    // Thursday March 21, 2024, 2:00 AM (night hours of Wednesday)
    const midnight = new Date(2024, 2, 21, 2, 0, 0);
    const hour = getCurrentPlanetaryHour(NYC_LAT, NYC_LNG, midnight);

    expect(hour).not.toBeNull();
    expect(hour!.isDay).toBe(false);
  });
});

describe("getNextHourForPlanet", () => {
  it("finds the next Mars hour", () => {
    const from = new Date(2024, 2, 20, 6, 0, 0); // early Wednesday
    const next = getNextHourForPlanet("Mars", NYC_LAT, NYC_LNG, from);

    expect(next).not.toBeNull();
    expect(next!.planet).toBe("Mars");
    expect(next!.end.getTime()).toBeGreaterThan(from.getTime());
  });

  it("always returns a future or current hour", () => {
    const from = new Date(2024, 2, 20, 12, 0, 0);
    const next = getNextHourForPlanet("Venus", NYC_LAT, NYC_LNG, from);

    expect(next).not.toBeNull();
    expect(next!.planet).toBe("Venus");
    // The hour's end must be after our query time
    expect(next!.end.getTime()).toBeGreaterThan(from.getTime());
  });
});

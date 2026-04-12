export type Planet =
  | "Saturn"
  | "Jupiter"
  | "Mars"
  | "Sun"
  | "Venus"
  | "Mercury"
  | "Moon";

export type Rank =
  | "King"
  | "Duke"
  | "Prince"
  | "Marquis"
  | "President"
  | "Earl"
  | "Knight";

export interface Spirit {
  id: number;
  name: string;
  rank: Rank;
  legions: number;
  powers: string[];
  planet: Planet;
  zodiacQuinary: string;
  direction: string;
  metal: string;
  day: string;
  sigilPath: string;
  manuscriptSource: string;
  description: string;
}

export interface PlanetaryHour {
  planet: Planet;
  start: Date;
  end: Date;
  isDay: boolean;
  hourNumber: number; // 1-12 within day or night
}

export interface PlanetaryDay {
  date: Date;
  ruler: Planet;
  sunrise: Date;
  sunset: Date;
  hours: PlanetaryHour[];
}

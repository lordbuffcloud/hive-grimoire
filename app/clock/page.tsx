import type { Metadata } from "next";
import PlanetaryClock from "@/components/PlanetaryClock";

export const metadata: Metadata = {
  title: "Planetary Hours — Hive Grimoire",
  description: "Real-time Chaldean planetary hours based on your location",
};

export default function ClockPage() {
  return <PlanetaryClock />;
}

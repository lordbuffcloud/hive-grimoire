"use client";

import { useState, useEffect, useCallback } from "react";

interface GeoState {
  lat: number;
  lng: number;
  loading: boolean;
  error: string | null;
  source: "gps" | "cached" | "manual" | "default";
}

const STORAGE_KEY = "hive-grimoire-location";

// Default: London (51.5074, -0.1278) as a reasonable fallback
const DEFAULT_LAT = 51.5074;
const DEFAULT_LNG = -0.1278;

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    loading: true,
    error: null,
    source: "default",
  });

  useEffect(() => {
    // Try cached location first
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const { lat, lng } = JSON.parse(cached);
        setState({ lat, lng, loading: false, error: null, source: "cached" });
      } catch {
        // Invalid cache, continue to GPS
      }
    }

    // Request GPS
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
        setState({ lat, lng, loading: false, error: null, source: "gps" });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.source === "cached" ? null : err.message,
        }));
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
    setState({ lat, lng, loading: false, error: null, source: "manual" });
  }, []);

  return { ...state, setManualLocation };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Spirit } from "@/lib/types";

interface MeditationModeProps {
  spirit: Spirit;
  onClose: () => void;
}

export default function MeditationMode({
  spirit,
  onClose,
}: MeditationModeProps) {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes default
  const [running, setRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Timer countdown
  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  // Breath pacing: 4s in, 4s hold, 4s out
  useEffect(() => {
    if (!running) return;
    const cycle = 12; // 4+4+4
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "in") return "hold";
        if (prev === "hold") return "out";
        return "in";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Breath ring */}
      <div
        className={`relative flex h-72 w-72 items-center justify-center rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${
          breathPhase === "in"
            ? "scale-110 border-amber/60"
            : breathPhase === "hold"
              ? "scale-110 border-amber/40"
              : "scale-90 border-amber/20"
        }`}
      >
        {/* Sigil */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spirit.sigilPath}
          alt={`Sigil of ${spirit.name}`}
          className="h-48 w-48 object-contain"
        />
      </div>

      {/* Breath instruction */}
      {running && (
        <p className="mt-6 font-mono text-sm uppercase tracking-widest text-amber/60">
          {breathPhase === "in"
            ? "Breathe in..."
            : breathPhase === "hold"
              ? "Hold..."
              : "Breathe out..."}
        </p>
      )}

      {/* Spirit name */}
      <h2 className="mt-4 font-serif text-2xl font-bold text-amber">
        {spirit.name}
      </h2>

      {/* Timer */}
      <p className="mt-2 font-mono text-lg text-cream/60">
        {formatTime(timeLeft)}
      </p>

      {/* Controls */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setRunning(!running)}
          className="rounded-lg bg-amber/20 px-6 py-2 font-mono text-sm text-amber hover:bg-amber/30"
        >
          {running ? "Pause" : "Begin"}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-cream/20 px-6 py-2 font-mono text-sm text-cream/60 hover:text-cream"
        >
          Close
        </button>
      </div>

      {/* Time presets */}
      {!running && (
        <div className="mt-4 flex gap-2">
          {[3, 5, 10, 15].map((mins) => (
            <button
              key={mins}
              onClick={() => setTimeLeft(mins * 60)}
              className={`rounded-full px-3 py-1 font-mono text-xs ${
                timeLeft === mins * 60
                  ? "bg-amber/20 text-amber"
                  : "text-cream/40 hover:text-cream"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

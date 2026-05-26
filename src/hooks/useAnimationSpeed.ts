"use client";

import { type Dispatch, type SetStateAction, useCallback } from "react";
import { ANIMATION_DURATIONS } from "@/lib/constants";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_STORAGE_KEY = "animation-speed";
const DEFAULT_SPEED = 1;
const MIN_SPEED = 0.25;
const MAX_SPEED = 3;

function clampSpeed(speed: number, minSpeed: number, maxSpeed: number) {
  return Math.min(Math.max(speed, minSpeed), maxSpeed);
}

export interface UseAnimationSpeedOptions {
  baseDuration?: number;
  defaultSpeed?: number;
  storageKey?: string;
  minSpeed?: number;
  maxSpeed?: number;
}

export function useAnimationSpeed(options: UseAnimationSpeedOptions = {}) {
  const {
    baseDuration = ANIMATION_DURATIONS.normal,
    defaultSpeed = DEFAULT_SPEED,
    storageKey = DEFAULT_STORAGE_KEY,
    minSpeed = MIN_SPEED,
    maxSpeed = MAX_SPEED,
  } = options;

  const [storedSpeed, setStoredSpeed] = useLocalStorage<number>(storageKey, defaultSpeed);
  const speed = Number.isFinite(storedSpeed)
    ? clampSpeed(storedSpeed, minSpeed, maxSpeed)
    : clampSpeed(defaultSpeed, minSpeed, maxSpeed);

  const setSpeed: Dispatch<SetStateAction<number>> = useCallback(
    (value) => {
      setStoredSpeed((currentSpeed) => {
        const normalizedCurrent = Number.isFinite(currentSpeed)
          ? clampSpeed(currentSpeed, minSpeed, maxSpeed)
          : clampSpeed(defaultSpeed, minSpeed, maxSpeed);
        const nextSpeed = value instanceof Function ? value(normalizedCurrent) : value;

        return clampSpeed(nextSpeed, minSpeed, maxSpeed);
      });
    },
    [defaultSpeed, maxSpeed, minSpeed, setStoredSpeed]
  );

  return {
    speed,
    setSpeed,
    duration: baseDuration / speed,
  };
}

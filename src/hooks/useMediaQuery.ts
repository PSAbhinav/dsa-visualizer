"use client";

import { useCallback, useSyncExternalStore } from "react";
import { BREAKPOINTS } from "@/lib/constants";

function getMediaQueryMatch(query: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(query).matches;
}

function subscribeToMediaQuery(query: string, onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQueryList = window.matchMedia(query);
  const listener = () => onStoreChange();

  mediaQueryList.addEventListener("change", listener);

  return () => mediaQueryList.removeEventListener("change", listener);
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToMediaQuery(query, onStoreChange),
    [query]
  );
  const getSnapshot = useCallback(() => getMediaQueryMatch(query), [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export const useIsMobile = () => useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
export const useIsTablet = () =>
  useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);

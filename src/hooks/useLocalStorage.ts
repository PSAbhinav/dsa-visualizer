"use client";

import { type Dispatch, type SetStateAction, useCallback, useSyncExternalStore } from "react";

type InitialValue<T> = T | (() => T);

const LOCAL_STORAGE_UPDATE_EVENT = "local-storage-update";

function resolveInitialValue<T>(initialValue: InitialValue<T>) {
  return initialValue instanceof Function ? initialValue() : initialValue;
}

function readLocalStorageValue<T>(key: string, initialValue: InitialValue<T>): T {
  if (typeof window === "undefined") {
    return resolveInitialValue(initialValue);
  }

  try {
    const item = window.localStorage.getItem(key);
    return item === null ? resolveInitialValue(initialValue) : (JSON.parse(item) as T);
  } catch {
    return resolveInitialValue(initialValue);
  }
}

function subscribeToLocalStorage(key: string, onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) {
      onStoreChange();
    }
  };

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ key?: string }>;
    if (!customEvent.detail?.key || customEvent.detail.key === key) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCAL_STORAGE_UPDATE_EVENT, handleCustomEvent as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCAL_STORAGE_UPDATE_EVENT, handleCustomEvent as EventListener);
  };
}

export function useLocalStorage<T>(key: string, initialValue: InitialValue<T>): [T, Dispatch<SetStateAction<T>>] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToLocalStorage(key, onStoreChange),
    [key]
  );
  const getSnapshot = useCallback(() => readLocalStorageValue<T>(key, initialValue), [initialValue, key]);
  const getServerSnapshot = useCallback(() => resolveInitialValue(initialValue), [initialValue]);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        const currentValue = readLocalStorageValue(key, initialValue);
        const nextValue = value instanceof Function ? value(currentValue) : value;

        window.localStorage.setItem(key, JSON.stringify(nextValue));
        window.dispatchEvent(
          new CustomEvent<{ key: string }>(LOCAL_STORAGE_UPDATE_EVENT, {
            detail: { key },
          })
        );
      } catch (error) {
        console.error(`Failed to write localStorage key "${key}".`, error);
      }
    },
    [initialValue, key]
  );

  return [storedValue, setValue];
}

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { loadUserProfile, saveUserProfile } from "@/lib/firestoreService";
import { getProgressSnapshot, useStore } from "@/store/useStore";

const serializeProgress = (value: ReturnType<typeof getProgressSnapshot>): string => JSON.stringify(value);

export function FirestoreSync(): null {
  const { data: session, status } = useSession();
  const setUserId = useStore((state) => state.setUserId);
  const loadFromCloud = useStore((state) => state.loadFromCloud);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const userId = session?.user?.id ?? session?.user?.email ?? null;

    if (!userId) {
      setUserId(null);
      return;
    }

    setUserId(userId);

    const syncCloudState = async (): Promise<void> => {
      const profile = await loadUserProfile(userId);

      if (cancelled) {
        return;
      }

      if (profile) {
        loadFromCloud(profile);
      } else {
        await saveUserProfile(userId, {
          email: session?.user?.email ?? "",
          name: session?.user?.name ?? "",
          image: session?.user?.image ?? "",
          ...getProgressSnapshot(useStore.getState()),
        });
      }

      if (cancelled) {
        return;
      }

      let previousSnapshot = serializeProgress(getProgressSnapshot(useStore.getState()));

      unsubscribe = useStore.subscribe((state) => {
        const nextSnapshot = getProgressSnapshot(state);
        const serializedSnapshot = serializeProgress(nextSnapshot);

        if (serializedSnapshot === previousSnapshot) {
          return;
        }

        previousSnapshot = serializedSnapshot;

        void saveUserProfile(userId, {
          email: session?.user?.email ?? "",
          name: session?.user?.name ?? "",
          image: session?.user?.image ?? "",
          ...nextSnapshot,
        });
      });
    };

    void syncCloudState();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [
    loadFromCloud,
    session?.user?.email,
    session?.user?.id,
    session?.user?.image,
    session?.user?.name,
    setUserId,
    status,
  ]);

  return null;
}

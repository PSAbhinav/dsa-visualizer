"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface VideoPlayerContextType {
  currentlyPlayingId: string | null;
  setCurrentlyPlaying: (videoId: string | null) => void;
  stopAllVideos: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const setCurrentlyPlaying = useCallback((videoId: string | null) => {
    setCurrentlyPlayingId(videoId);
  }, []);

  const stopAllVideos = useCallback(() => {
    setCurrentlyPlayingId(null);
  }, []);

  return (
    <VideoPlayerContext.Provider value={{ currentlyPlayingId, setCurrentlyPlaying, stopAllVideos }}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    // Return a default implementation for when used outside provider
    return {
      currentlyPlayingId: null,
      setCurrentlyPlaying: () => {},
      stopAllVideos: () => {},
    };
  }
  return context;
}

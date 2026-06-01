"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { YouTubeVideo } from "@/data/types";
import {
  MIN_VIDEO_COMPLETION_PERCENTAGE,
  isValidVideoPlaybackSpeed,
  isVideoProgressComplete,
  sanitizeVideoProgressEntry,
  type VideoProgressEntry,
} from "@/lib/videoProgress";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";

// Declare YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onPlaybackRateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YouTubeEmbedProps {
  video: YouTubeVideo;
  watched?: boolean;
  progress?: VideoProgressEntry;
  onPlay?: (video: YouTubeVideo) => void;
  onProgressChange?: (progress: VideoProgressEntry) => void;
  onComplete?: (videoId: string) => void;
}

function resolveYouTubeVideoId(value: string): string | null {
  const trimmedValue = value.trim();
  const pattern = /^[a-zA-Z0-9_-]{11}$/;

  if (pattern.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue);
    const candidates = [
      url.searchParams.get("v"),
      url.hostname.includes("youtu.be") ? url.pathname.split("/").filter(Boolean)[0] : null,
      url.pathname.includes("/embed/") ? url.pathname.split("/embed/")[1]?.split(/[?/&#]/)[0] : null,
      url.pathname.split("/").filter(Boolean).at(-1),
    ];

    const matchedCandidate = candidates.find((candidate) => candidate && pattern.test(candidate));
    return matchedCandidate ?? null;
  } catch {
    const matchedId = trimmedValue.match(/[a-zA-Z0-9_-]{11}/)?.[0] ?? null;
    return matchedId && pattern.test(matchedId) ? matchedId : null;
  }
}

// Hook to detect if page is visible (not in background tab/minimized)
function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    // Also track window focus/blur for additional safety
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Set initial state
    setIsVisible(document.visibilityState === "visible" && document.hasFocus());

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return isVisible;
}

// Load YouTube IFrame API
let apiLoadPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  
  if (typeof window !== "undefined" && window.YT?.Player) {
    return Promise.resolve();
  }

  apiLoadPromise = new Promise((resolve) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      resolve();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    } else if (window.YT?.Player) {
      resolve();
    }
  });

  return apiLoadPromise;
}

export function YouTubeEmbed({
  video,
  watched = false,
  progress,
  onPlay,
  onProgressChange,
  onComplete,
}: YouTubeEmbedProps) {
  const normalizedVideoId = useMemo(() => resolveYouTubeVideoId(video.id), [video.id]);
  
  // Generate unique instance ID for this video embed
  const instanceIdRef = useRef(`yt-${video.id}-${Math.random().toString(36).slice(2, 9)}`);
  const playerContainerId = `player-${instanceIdRef.current}`;
  
  // Video player context for single video playback
  const { currentlyPlayingId, setCurrentlyPlaying } = useVideoPlayer();
  
  const [playerState, setPlayerState] = useState<"idle" | "loading" | "ready" | "playing" | "paused">("idle");
  const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(1);
  const [watchMetrics, setWatchMetrics] = useState(() => ({
    watchedPercentage: progress?.watchedPercentage ?? 0,
    playbackSpeed: progress?.playbackSpeed ?? 1,
    completedAt: progress?.completedAt,
    lastWatchedPosition: progress?.lastWatchedPosition ?? 0,
    videoDuration: progress?.videoDuration ?? 0,
  }));
  
  const playerRef = useRef<YTPlayer | null>(null);
  const completionNotifiedRef = useRef(Boolean(progress?.completedAt) || watched);
  const isPageVisible = usePageVisibility();
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isThisVideoPlaying = currentlyPlayingId === instanceIdRef.current;

  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${normalizedVideoId ?? video.id}/hqdefault.jpg`,
    [normalizedVideoId, video.id]
  );

  const youtubeUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${normalizedVideoId ?? video.id}`,
    [normalizedVideoId, video.id]
  );

  // Save progress to parent
  const saveProgress = useCallback((currentTime: number, duration: number, speed: number) => {
    if (duration <= 0) return;
    
    const percentage = (currentTime / duration) * 100;
    const isValidSpeed = isValidVideoPlaybackSpeed(speed);
    
    // Only update if watching at valid speed
    const newWatchedPercentage = isValidSpeed 
      ? Math.max(watchMetrics.watchedPercentage, percentage)
      : watchMetrics.watchedPercentage;
    
    const isComplete = newWatchedPercentage >= MIN_VIDEO_COMPLETION_PERCENTAGE && isValidSpeed;
    
    const newProgress = sanitizeVideoProgressEntry({
      videoId: video.id,
      watchedPercentage: newWatchedPercentage,
      playbackSpeed: speed,
      lastWatchedPosition: currentTime,
      videoDuration: duration,
      completedAt: isComplete && !watchMetrics.completedAt ? new Date().toISOString() : watchMetrics.completedAt,
    }, progress);

    setWatchMetrics({
      watchedPercentage: newProgress.watchedPercentage,
      playbackSpeed: newProgress.playbackSpeed,
      completedAt: newProgress.completedAt,
      lastWatchedPosition: newProgress.lastWatchedPosition ?? 0,
      videoDuration: newProgress.videoDuration ?? 0,
    });

    onProgressChange?.(newProgress);

    if (isVideoProgressComplete(newProgress) && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.(video.id);
    }
  }, [video.id, watchMetrics, progress, onProgressChange, onComplete]);

  // Stop this video when another video starts playing
  useEffect(() => {
    if (currentlyPlayingId && currentlyPlayingId !== instanceIdRef.current && playerRef.current) {
      try {
        playerRef.current.pauseVideo();
        setPlayerState("paused");
      } catch {
        // Player might not be ready
      }
    }
  }, [currentlyPlayingId]);

  // Pause video when page becomes invisible
  useEffect(() => {
    if (!isPageVisible && playerRef.current && playerState === "playing") {
      try {
        playerRef.current.pauseVideo();
      } catch {
        // Player might not be ready
      }
    }
  }, [isPageVisible, playerState]);

  // Progress tracking interval - only when playing AND page visible AND valid speed
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (playerState !== "playing" || !isPageVisible || !playerRef.current) {
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      
      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        const speed = playerRef.current.getPlaybackRate();
        
        setCurrentPlaybackSpeed(speed);
        
        // Only save progress at valid speeds (1x or 1.5x)
        if (isPageVisible && document.visibilityState === "visible" && isValidVideoPlaybackSpeed(speed)) {
          saveProgress(currentTime, duration, speed);
        }
      } catch {
        // Player might be in invalid state
      }
    }, 2000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [playerState, isPageVisible, saveProgress]);

  // Initialize YouTube player
  const initializePlayer = useCallback(async () => {
    if (!normalizedVideoId || playerRef.current) return;
    
    setPlayerState("loading");
    
    try {
      await loadYouTubeApi();
      
      // Get resume position
      const startPosition = Math.floor(progress?.lastWatchedPosition ?? watchMetrics.lastWatchedPosition ?? 0);
      
      playerRef.current = new window.YT.Player(playerContainerId, {
        videoId: normalizedVideoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: startPosition > 5 ? startPosition - 2 : 0, // Resume slightly before to provide context
        },
        events: {
          onReady: (event) => {
            setPlayerState("ready");
            const duration = event.target.getDuration();
            if (duration > 0) {
              setWatchMetrics(prev => ({ ...prev, videoDuration: duration }));
            }
            event.target.playVideo();
          },
          onStateChange: (event) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setPlayerState("playing");
              setCurrentlyPlaying(instanceIdRef.current);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setPlayerState("paused");
              // Save position when paused
              try {
                const currentTime = event.target.getCurrentTime();
                const duration = event.target.getDuration();
                const speed = event.target.getPlaybackRate();
                saveProgress(currentTime, duration, speed);
              } catch {
                // Ignore errors
              }
            } else if (state === window.YT.PlayerState.ENDED) {
              setPlayerState("paused");
              // Mark as complete if watched enough at valid speed
              try {
                const duration = event.target.getDuration();
                saveProgress(duration, duration, 1);
              } catch {
                // Ignore errors
              }
            }
          },
          onPlaybackRateChange: (event) => {
            const newRate = event.data;
            setCurrentPlaybackSpeed(newRate);
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize YouTube player:", error);
      setPlayerState("idle");
    }
  }, [normalizedVideoId, playerContainerId, progress?.lastWatchedPosition, watchMetrics.lastWatchedPosition, setCurrentlyPlaying, saveProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          // Save final position before destroying
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const speed = playerRef.current.getPlaybackRate();
          saveProgress(currentTime, duration, speed);
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [saveProgress]);

  const handlePlay = useCallback(() => {
    if (!normalizedVideoId) return;
    
    if (playerState === "idle") {
      initializePlayer();
    } else if (playerRef.current) {
      playerRef.current.playVideo();
      setCurrentlyPlaying(instanceIdRef.current);
    }
    
    onPlay?.(video);
  }, [normalizedVideoId, playerState, initializePlayer, setCurrentlyPlaying, onPlay, video]);

  const handlePause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const displayWatchedPercentage = Math.max(watchMetrics.watchedPercentage, progress?.watchedPercentage ?? 0);
  const completionState = watched || isVideoProgressComplete(progress) || Boolean(progress?.completedAt ?? watchMetrics.completedAt);
  const showSpeedWarning = playerState === "playing" && !isValidVideoPlaybackSpeed(currentPlaybackSpeed);
  const isPlayerActive = playerState !== "idle";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.005 }}
      className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/70 shadow-[0_20px_70px_-30px_rgba(168,85,247,0.55)] backdrop-blur-xl"
    >
      <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-slate-900">
        <AnimatePresence mode="wait">
          {isPlayerActive ? (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div id={playerContainerId} className="h-full w-full" />
              
              {playerState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                    <p className="text-sm text-slate-300">Loading video...</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="thumbnail"
              type="button"
              onClick={handlePlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Play button */}
              <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110">
                <svg className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Resume indicator */}
              {(watchMetrics.lastWatchedPosition > 10 || (progress?.lastWatchedPosition ?? 0) > 10) && !completionState && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-purple-600/90 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                  Resume from {formatTime(Math.floor(progress?.lastWatchedPosition ?? watchMetrics.lastWatchedPosition))}
                </div>
              )}

              {/* Video info overlay */}
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                  {video.channel}
                </span>
                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                  {video.duration}
                </span>
              </div>

              {/* Completion badge */}
              {completionState && (
                <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  ✓ Watched
                </div>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Speed warning overlay */}
        {showSpeedWarning && (
          <div className="absolute left-3 top-3 z-10 rounded-xl bg-amber-500/90 px-3 py-2 text-xs font-semibold text-black backdrop-blur">
            ⚠️ {currentPlaybackSpeed}x - Progress not tracking (use 1x or 1.5x)
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div
            className={`h-full ${showSpeedWarning ? "bg-amber-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${displayWatchedPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Video info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{video.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{video.channel}</p>
          </div>
          {completionState ? (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              Completed
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              {Math.round(displayWatchedPercentage)}% tracked
            </span>
          )}
        </div>

        {/* Watch requirement info */}
        <div className="mt-3 rounded-xl bg-slate-900/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress</span>
            <span className={completionState ? "text-emerald-400" : showSpeedWarning ? "text-amber-400" : "text-cyan-400"}>
              {completionState ? "Complete ✓" : showSpeedWarning ? "Paused (speed)" : `${Math.round(displayWatchedPercentage)}%`}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completionState ? "bg-emerald-500" : showSpeedWarning ? "bg-amber-500" : "bg-cyan-500"
              }`}
              style={{ width: `${Math.min(100, displayWatchedPercentage)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
            {completionState 
              ? "Video marked as complete" 
              : showSpeedWarning 
                ? "Switch to 1x or 1.5x to track progress"
                : "Watch 75%+ at 1x or 1.5x speed to complete"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          {playerState === "playing" ? (
            <button
              type="button"
              onClick={handlePause}
              className="flex-1 rounded-xl bg-purple-500/20 px-4 py-2.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/30"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              {playerState === "loading" ? "Loading..." : playerState === "paused" ? "▶ Resume" : "▶ Play Video"}
            </button>
          )}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-red-600/20 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-600/30"
          >
            YouTube ↗
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// Helper to format seconds as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

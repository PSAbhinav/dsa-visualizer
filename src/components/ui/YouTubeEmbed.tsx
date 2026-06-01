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

interface YouTubePlayerEvent {
  target: {
    destroy: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlaybackRate: () => number;
  };
  data?: number;
}

interface YouTubePlayerConstructor {
  new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
      };
    }
  ): YouTubePlayerEvent["target"];
}

interface YouTubeNamespace {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youTubeIframeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube iframe API is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youTubeIframeApiPromise) {
    youTubeIframeApiPromise = new Promise<YouTubeNamespace>((resolve) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT?.Player) {
          resolve(window.YT);
        }
      };

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  return youTubeIframeApiPromise;
}

interface YouTubeEmbedProps {
  video: YouTubeVideo;
  watched?: boolean;
  progress?: VideoProgressEntry;
  onPlay?: (video: YouTubeVideo) => void;
  onProgressChange?: (progress: VideoProgressEntry) => void;
  onComplete?: (videoId: string) => void;
}

export function YouTubeEmbed({
  video,
  watched = false,
  progress,
  onPlay,
  onProgressChange,
  onComplete,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [watchMetrics, setWatchMetrics] = useState(() => ({
    currentTime: 0,
    durationSeconds: 0,
    watchedPercentage: progress?.watchedPercentage ?? 0,
    playbackSpeed: progress?.playbackSpeed ?? 1,
    completedAt: progress?.completedAt,
  }));
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerEvent["target"] | null>(null);
  const intervalRef = useRef<number | null>(null);
  const trackedSecondsRef = useRef(0);
  const lastPlaybackPositionRef = useRef(0);
  const completionNotifiedRef = useRef(Boolean(progress?.completedAt) || watched);
  const lastPersistedRef = useRef<VideoProgressEntry | null>(progress ?? null);
  const thumbnailUrl = useMemo(() => `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, [video.id]);
  const youtubeUrl = useMemo(() => `https://www.youtube.com/watch?v=${video.id}`, [video.id]);

  useEffect(() => {
    if (watchMetrics.durationSeconds > 0) {
      trackedSecondsRef.current = Math.max(
        trackedSecondsRef.current,
        ((progress?.watchedPercentage ?? 0) / 100) * watchMetrics.durationSeconds
      );
    }

    completionNotifiedRef.current = completionNotifiedRef.current || Boolean(progress?.completedAt) || watched;

    if (progress) {
      lastPersistedRef.current = progress;
    }
  }, [progress, watched, watchMetrics.durationSeconds]);

  const clearTrackingInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const persistProgress = useCallback(
    (nextProgress: VideoProgressEntry, force = false) => {
      const sanitized = sanitizeVideoProgressEntry(nextProgress, lastPersistedRef.current ?? progress);
      lastPersistedRef.current = sanitized;
      setWatchMetrics((current) => ({
        ...current,
        watchedPercentage: sanitized.watchedPercentage,
        playbackSpeed: sanitized.playbackSpeed,
        completedAt: sanitized.completedAt ?? current.completedAt,
      }));

      const hasChanged =
        force ||
        !progress ||
        progress.watchedPercentage !== sanitized.watchedPercentage ||
        progress.playbackSpeed !== sanitized.playbackSpeed ||
        progress.completedAt !== sanitized.completedAt;

      if (hasChanged) {
        onProgressChange?.(sanitized);
      }

      if (isVideoProgressComplete(sanitized) && !completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onComplete?.(video.id);
      }
    },
    [onComplete, onProgressChange, progress, video.id]
  );

  const syncPlayerProgress = useCallback(
    (force = false) => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const durationSeconds = player.getDuration() || 0;
      const currentTime = player.getCurrentTime() || 0;
      const playbackSpeed = player.getPlaybackRate() || 1;
      const deltaPosition = currentTime - lastPlaybackPositionRef.current;
      const naturalProgressLimit = Math.max(2.5, playbackSpeed * 2.25);

      if (durationSeconds > 0 && isValidVideoPlaybackSpeed(playbackSpeed) && deltaPosition > 0 && deltaPosition <= naturalProgressLimit) {
        trackedSecondsRef.current = Math.min(durationSeconds, trackedSecondsRef.current + deltaPosition);
      }

      lastPlaybackPositionRef.current = currentTime;

      const watchedPercentage = durationSeconds > 0 ? (trackedSecondsRef.current / durationSeconds) * 100 : 0;
      const nextProgress = sanitizeVideoProgressEntry(
        {
          videoId: video.id,
          watchedPercentage,
          playbackSpeed,
          completedAt: progress?.completedAt ?? watchMetrics.completedAt,
        },
        lastPersistedRef.current ?? progress
      );

      setWatchMetrics((current) => ({
        ...current,
        currentTime,
        durationSeconds,
        watchedPercentage: nextProgress.watchedPercentage,
        playbackSpeed: nextProgress.playbackSpeed,
        completedAt: nextProgress.completedAt ?? current.completedAt,
      }));
      persistProgress(nextProgress, force);
    },
    [persistProgress, progress, video.id, watchMetrics.completedAt]
  );

  useEffect(() => {
    if (!isPlaying || !playerHostRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !playerHostRef.current || playerRef.current) {
          return;
        }

        playerRef.current = new YT.Player(playerHostRef.current, {
          videoId: video.id,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              const durationSeconds = event.target.getDuration() || 0;
              trackedSecondsRef.current = Math.max(
                trackedSecondsRef.current,
                durationSeconds > 0 ? ((progress?.watchedPercentage ?? 0) / 100) * durationSeconds : 0
              );
              lastPlaybackPositionRef.current = event.target.getCurrentTime() || 0;
              setWatchMetrics((current) => ({
                ...current,
                durationSeconds,
                playbackSpeed: event.target.getPlaybackRate() || current.playbackSpeed,
              }));
            },
            onStateChange: (event) => {
              if (!window.YT) {
                return;
              }

              if (event.data === window.YT.PlayerState.PLAYING) {
                lastPlaybackPositionRef.current = event.target.getCurrentTime() || 0;
                clearTrackingInterval();
                intervalRef.current = window.setInterval(() => syncPlayerProgress(), 1000);
                return;
              }

              if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED ||
                event.data === window.YT.PlayerState.BUFFERING
              ) {
                clearTrackingInterval();
                syncPlayerProgress(true);
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setIframeError(true);
        }
      });

    return () => {
      cancelled = true;
      clearTrackingInterval();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [clearTrackingInterval, isPlaying, progress?.watchedPercentage, syncPlayerProgress, video.id]);

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      onPlay?.(video);
    }
  };

  const displayWatchedPercentage = Math.max(watchMetrics.watchedPercentage, progress?.watchedPercentage ?? 0);
  const displayPlaybackSpeed = progress?.playbackSpeed ?? watchMetrics.playbackSpeed;
  const completionState = watched || isVideoProgressComplete(progress) || Boolean(progress?.completedAt ?? watchMetrics.completedAt);
  const progressLabel = `${displayWatchedPercentage}% tracked`;
  const speedCountsTowardCompletion = isValidVideoPlaybackSpeed(displayPlaybackSpeed);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/70 shadow-[0_20px_70px_-30px_rgba(168,85,247,0.55)] backdrop-blur-xl"
    >
      <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-slate-900">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="iframe"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <div ref={playerHostRef} className="h-full w-full" />
              {iframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center text-sm text-slate-200">
                  Unable to load the YouTube player right now.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="preview"
              type="button"
              onClick={handlePlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.015 }}
              className="absolute inset-0 w-full text-left"
              aria-label={`Play ${video.title}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_45%),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.85))]" />
              <motion.div
                initial={{ scale: 0.94, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.8 }}
                className="absolute left-1/2 top-1/2 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-red-500/90 text-white shadow-2xl shadow-red-950/50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-8 w-8">
                  <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                </svg>
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-red-100 backdrop-blur-md">
                  Start tracked watching
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
            {video.channel}
          </span>
          {video.duration && (
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white/75 backdrop-blur-md">
              {video.duration}
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
          <div className="overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
            <motion.div
              initial={false}
              animate={{ width: `${displayWatchedPercentage}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`h-2 rounded-full ${completionState ? "bg-gradient-to-r from-emerald-400 to-cyan-300" : "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300"}`}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{video.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{video.channel}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
              completionState
                ? "border border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                : "border border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {completionState ? "Completed" : progressLabel}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>{progressLabel}</span>
            <span className={speedCountsTowardCompletion ? "text-emerald-200" : "text-amber-200"}>
              {displayPlaybackSpeed}x {speedCountsTowardCompletion ? "counts" : "does not count"}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${displayWatchedPercentage}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`h-full rounded-full ${completionState ? "bg-gradient-to-r from-emerald-400 to-cyan-300" : "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300"}`}
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
            Complete at {MIN_VIDEO_COMPLETION_PERCENTAGE}% while staying on 1x or 1.5x.
          </p>
          {isPlaying && watchMetrics.durationSeconds > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Position {Math.floor(watchMetrics.currentTime)}s / {Math.floor(watchMetrics.durationSeconds)}s
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-purple-400/40 hover:bg-purple-500/10"
          >
            {isPlaying ? "Resume in player" : "Start core video"}
          </button>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-400 hover:to-fuchsia-400"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </motion.article>
  );
}

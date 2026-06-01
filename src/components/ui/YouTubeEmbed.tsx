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

interface YouTubePlayer {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlaybackRate: () => number;
  playVideo: () => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data?: number;
}

interface YouTubePlayerConstructor {
  new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onError?: (event: YouTubePlayerEvent) => void;
      };
    }
  ): YouTubePlayer;
}

interface YouTubeNamespace {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

let youTubeIframeApiPromise: Promise<YouTubeNamespace> | null = null;

function resolveYouTubeVideoId(value: string): string | null {
  const trimmedValue = value.trim();

  if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmedValue)) {
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

    const matchedCandidate = candidates.find((candidate) => candidate && YOUTUBE_VIDEO_ID_PATTERN.test(candidate));
    return matchedCandidate ?? null;
  } catch {
    const matchedId = trimmedValue.match(/[a-zA-Z0-9_-]{11}/)?.[0] ?? null;
    return matchedId && YOUTUBE_VIDEO_ID_PATTERN.test(matchedId) ? matchedId : null;
  }
}

function getYouTubeErrorMessage(errorCode?: number): string {
  switch (errorCode) {
    case 2:
      return "Video unavailable right now.";
    case 5:
      return "This video format is not supported by your browser.";
    case 100:
      return "Video unavailable right now.";
    case 101:
    case 150:
      return "This video cannot be played in the embedded player.";
    default:
      return "Video unavailable right now.";
  }
}

function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube iframe API is only available in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youTubeIframeApiPromise) {
    youTubeIframeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${YOUTUBE_IFRAME_API_URL}"]`);
      const script = existingScript ?? document.createElement("script");
      const previousReady = window.onYouTubeIframeAPIReady;
      let settled = false;
      let timeoutId = 0;

      const settle = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        script.removeEventListener("error", handleError);
        callback();
      };

      const handleError = () => {
        youTubeIframeApiPromise = null;
        settle(() => reject(new Error("Unable to load the YouTube player.")));
      };

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();

        if (window.YT?.Player) {
          settle(() => resolve(window.YT!));
        }
      };

      script.addEventListener("error", handleError, { once: true });

      if (!existingScript) {
        script.src = YOUTUBE_IFRAME_API_URL;
        script.async = true;
        document.body.appendChild(script);
      }

      timeoutId = window.setTimeout(() => {
        if (window.YT?.Player) {
          settle(() => resolve(window.YT!));
          return;
        }

        handleError();
      }, 10000);

      if (window.YT?.Player) {
        settle(() => resolve(window.YT!));
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
  const normalizedVideoId = useMemo(() => resolveYouTubeVideoId(video.id), [video.id]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerErrorMessage, setPlayerErrorMessage] = useState<string | null>(null);
  const [watchMetrics, setWatchMetrics] = useState(() => ({
    currentTime: 0,
    durationSeconds: 0,
    watchedPercentage: progress?.watchedPercentage ?? 0,
    playbackSpeed: progress?.playbackSpeed ?? 1,
    completedAt: progress?.completedAt,
  }));
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);
  const trackedSecondsRef = useRef(0);
  const lastPlaybackPositionRef = useRef(0);
  const completionNotifiedRef = useRef(Boolean(progress?.completedAt) || watched);
  const lastPersistedRef = useRef<VideoProgressEntry | null>(progress ?? null);
  const progressRef = useRef(progress);
  const completionAtRef = useRef(progress?.completedAt);
  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${normalizedVideoId ?? video.id}/hqdefault.jpg`,
    [normalizedVideoId, video.id]
  );
  const youtubeUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${normalizedVideoId ?? video.id}`,
    [normalizedVideoId, video.id]
  );

  useEffect(() => {
    progressRef.current = progress;
    completionAtRef.current = progress?.completedAt;

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
      const previousProgress = progressRef.current;
      const sanitized = sanitizeVideoProgressEntry(nextProgress, lastPersistedRef.current ?? previousProgress);
      lastPersistedRef.current = sanitized;
      completionAtRef.current = sanitized.completedAt ?? completionAtRef.current;
      setWatchMetrics((current) => ({
        ...current,
        watchedPercentage: sanitized.watchedPercentage,
        playbackSpeed: sanitized.playbackSpeed,
        completedAt: sanitized.completedAt ?? current.completedAt,
      }));

      const hasChanged =
        force ||
        !previousProgress ||
        previousProgress.watchedPercentage !== sanitized.watchedPercentage ||
        previousProgress.playbackSpeed !== sanitized.playbackSpeed ||
        previousProgress.completedAt !== sanitized.completedAt;

      if (hasChanged) {
        onProgressChange?.(sanitized);
      }

      if (isVideoProgressComplete(sanitized) && !completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onComplete?.(video.id);
      }
    },
    [onComplete, onProgressChange, video.id]
  );

  const syncPlayerProgress = useCallback(
    (force = false) => {
      const player = playerRef.current;
      const previousProgress = progressRef.current;

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
          completedAt: completionAtRef.current,
        },
        lastPersistedRef.current ?? previousProgress
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
    [persistProgress, video.id]
  );

  useEffect(() => {
    if (!isPlaying || !playerHostRef.current) {
      return undefined;
    }

    if (!normalizedVideoId) {
      return undefined;
    }

    let cancelled = false;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !playerHostRef.current) {
          return;
        }

        if (playerRef.current) {
          playerRef.current.playVideo();
          return;
        }

        playerRef.current = new YT.Player(playerHostRef.current, {
          videoId: normalizedVideoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              const durationSeconds = event.target.getDuration() || 0;
              const savedPercentage = progressRef.current?.watchedPercentage ?? 0;

              trackedSecondsRef.current = Math.max(
                trackedSecondsRef.current,
                durationSeconds > 0 ? (savedPercentage / 100) * durationSeconds : 0
              );
              lastPlaybackPositionRef.current = event.target.getCurrentTime() || 0;
              setWatchMetrics((current) => ({
                ...current,
                durationSeconds,
                playbackSpeed: event.target.getPlaybackRate() || current.playbackSpeed,
              }));

              try {
                event.target.playVideo();
              } catch {
                setIsPlayerLoading(false);
                setPlayerErrorMessage("Video unavailable right now.");
              }
            },
            onStateChange: (event) => {
              if (!window.YT) {
                return;
              }

              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlayerLoading(false);
                setPlayerErrorMessage(null);
                lastPlaybackPositionRef.current = event.target.getCurrentTime() || 0;
                clearTrackingInterval();
                intervalRef.current = window.setInterval(() => syncPlayerProgress(), 1000);
                return;
              }

              if (event.data === window.YT.PlayerState.UNSTARTED || event.data === window.YT.PlayerState.BUFFERING) {
                setIsPlayerLoading(true);
              } else {
                setIsPlayerLoading(false);
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
            onError: (event) => {
              clearTrackingInterval();
              setIsPlayerLoading(false);
              setPlayerErrorMessage(getYouTubeErrorMessage(event.data));
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          clearTrackingInterval();
          setIsPlayerLoading(false);
          setPlayerErrorMessage("Video unavailable right now.");
        }
      });

    return () => {
      cancelled = true;
      clearTrackingInterval();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [clearTrackingInterval, isPlaying, normalizedVideoId, syncPlayerProgress]);

  const handlePlay = () => {
    if (!normalizedVideoId) {
      setIsPlaying(true);
      setPlayerErrorMessage("Video unavailable right now.");
      onPlay?.(video);
      return;
    }

    setPlayerErrorMessage(null);
    setIsPlayerLoading(true);

    if (!isPlaying) {
      setIsPlaying(true);
      onPlay?.(video);
      return;
    }

    try {
      playerRef.current?.playVideo();
    } catch {
      setIsPlayerLoading(false);
      setPlayerErrorMessage("Video unavailable right now.");
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
              {isPlayerLoading && !playerErrorMessage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 p-6 text-center text-sm text-slate-200">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-400" />
                  <span>Loading video...</span>
                </div>
              )}
              {playerErrorMessage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-6 text-center text-sm text-slate-200">
                  <span>{playerErrorMessage}</span>
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="pointer-events-auto rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
                  >
                    Retry
                  </button>
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

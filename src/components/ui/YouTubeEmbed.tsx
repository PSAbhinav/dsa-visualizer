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
  const [watchMetrics, setWatchMetrics] = useState(() => ({
    watchedPercentage: progress?.watchedPercentage ?? 0,
    playbackSpeed: progress?.playbackSpeed ?? 1,
    completedAt: progress?.completedAt,
  }));
  const completionNotifiedRef = useRef(Boolean(progress?.completedAt) || watched);

  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${normalizedVideoId ?? video.id}/hqdefault.jpg`,
    [normalizedVideoId, video.id]
  );

  const embedUrl = useMemo(
    () => normalizedVideoId 
      ? `https://www.youtube.com/embed/${normalizedVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
      : null,
    [normalizedVideoId]
  );

  const youtubeUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${normalizedVideoId ?? video.id}`,
    [normalizedVideoId, video.id]
  );

  // Simulate progress tracking (since we can't access iframe internals reliably)
  useEffect(() => {
    if (!isPlaying) return;

    // Start tracking watch time
    const startTime = Date.now();
    const videoDurationEstimate = 600; // Assume ~10 min average video
    
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const estimatedPercentage = Math.min(100, (elapsedSeconds / videoDurationEstimate) * 100);
      
      const newProgress = sanitizeVideoProgressEntry({
        videoId: video.id,
        watchedPercentage: Math.max(watchMetrics.watchedPercentage, estimatedPercentage),
        playbackSpeed: 1, // Assume 1x for iframe
        completedAt: estimatedPercentage >= MIN_VIDEO_COMPLETION_PERCENTAGE ? new Date().toISOString() : undefined,
      }, progress);

      setWatchMetrics({
        watchedPercentage: newProgress.watchedPercentage,
        playbackSpeed: newProgress.playbackSpeed,
        completedAt: newProgress.completedAt,
      });

      onProgressChange?.(newProgress);

      if (isVideoProgressComplete(newProgress) && !completionNotifiedRef.current) {
        completionNotifiedRef.current = true;
        onComplete?.(video.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, video.id, watchMetrics.watchedPercentage, onProgressChange, onComplete, progress]);

  const handlePlay = useCallback(() => {
    if (!normalizedVideoId) return;
    setIsPlaying(true);
    onPlay?.(video);
  }, [normalizedVideoId, onPlay, video]);

  const displayWatchedPercentage = Math.max(watchMetrics.watchedPercentage, progress?.watchedPercentage ?? 0);
  const completionState = watched || isVideoProgressComplete(progress) || Boolean(progress?.completedAt ?? watchMetrics.completedAt);

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
          {isPlaying && embedUrl ? (
            <motion.div
              key="iframe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <iframe
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
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

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
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
            <span className={completionState ? "text-emerald-400" : "text-cyan-400"}>
              {completionState ? "Complete ✓" : `${Math.round(displayWatchedPercentage)}%`}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completionState ? "bg-emerald-500" : "bg-cyan-500"
              }`}
              style={{ width: `${Math.min(100, displayWatchedPercentage)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">
            {completionState ? "Video marked as complete" : "Watch to track progress"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handlePlay}
            className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            {isPlaying ? "Playing" : "Play Video"}
          </button>
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

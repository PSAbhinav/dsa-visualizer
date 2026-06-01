"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { YouTubeVideo } from "@/data/types";
import {
  MIN_VIDEO_COMPLETION_PERCENTAGE,
  isVideoProgressComplete,
  sanitizeVideoProgressEntry,
  type VideoProgressEntry,
} from "@/lib/videoProgress";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";

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

// Hook to detect if page is visible
function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    setIsVisible(document.visibilityState === "visible" && document.hasFocus());

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return isVisible;
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
  
  // Video player context for single video playback
  const { currentlyPlayingId, setCurrentlyPlaying } = useVideoPlayer();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchMetrics, setWatchMetrics] = useState(() => ({
    watchedPercentage: progress?.watchedPercentage ?? 0,
    playbackSpeed: progress?.playbackSpeed ?? 1,
    completedAt: progress?.completedAt,
    lastWatchedPosition: progress?.lastWatchedPosition ?? 0,
  }));
  
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const completionNotifiedRef = useRef(Boolean(progress?.completedAt) || watched);
  const isPageVisible = usePageVisibility();
  const accumulatedSecondsRef = useRef(progress?.lastWatchedPosition ?? 0);
  const lastTickRef = useRef<number | null>(null);
  const videoDurationEstimate = 600; // ~10 min average
  
  // Store initial resume position in a ref so it doesn't cause re-renders
  const initialResumePositionRef = useRef(Math.floor(progress?.lastWatchedPosition ?? 0));

  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${normalizedVideoId ?? video.id}/hqdefault.jpg`,
    [normalizedVideoId, video.id]
  );

  // Build embed URL with resume position - ONLY use initial position to prevent flickering
  const embedUrl = useMemo(() => {
    if (!normalizedVideoId) return null;
    const startTime = initialResumePositionRef.current;
    const startParam = startTime > 5 ? `&start=${startTime - 2}` : '';
    return `https://www.youtube.com/embed/${normalizedVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1${startParam}`;
  }, [normalizedVideoId]); // Only depends on videoId, not on changing position

  const youtubeUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${normalizedVideoId ?? video.id}`,
    [normalizedVideoId, video.id]
  );

  // Stop this video when another video starts playing
  useEffect(() => {
    if (currentlyPlayingId && currentlyPlayingId !== instanceIdRef.current && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentlyPlayingId, isPlaying]);

  // Progress tracking - ONLY counts when page is visible
  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Only count time if page is visible
      if (isPageVisible && document.visibilityState === "visible") {
        if (lastTickRef.current !== null) {
          const deltaSeconds = (now - lastTickRef.current) / 1000;
          // Only add reasonable deltas (prevent huge jumps)
          if (deltaSeconds > 0 && deltaSeconds <= 10) {
            accumulatedSecondsRef.current += deltaSeconds;
          }
        }
        lastTickRef.current = now;
      } else {
        // Page not visible - don't count time
        lastTickRef.current = null;
      }

      const estimatedPercentage = Math.min(100, (accumulatedSecondsRef.current / videoDurationEstimate) * 100);
      
      // Use functional update to avoid dependency on watchMetrics
      setWatchMetrics(prev => {
        const newWatchedPercentage = Math.max(prev.watchedPercentage, estimatedPercentage);
        const isComplete = newWatchedPercentage >= MIN_VIDEO_COMPLETION_PERCENTAGE;
        
        const newMetrics = {
          watchedPercentage: newWatchedPercentage,
          playbackSpeed: 1,
          completedAt: isComplete && !prev.completedAt ? new Date().toISOString() : prev.completedAt,
          lastWatchedPosition: accumulatedSecondsRef.current,
        };
        
        // Call onProgressChange with the new progress
        const newProgress = sanitizeVideoProgressEntry({
          videoId: video.id,
          ...newMetrics,
          videoDuration: videoDurationEstimate,
        }, progress);
        
        onProgressChange?.(newProgress);
        
        // Check completion
        if (isVideoProgressComplete(newProgress) && !completionNotifiedRef.current) {
          completionNotifiedRef.current = true;
          onComplete?.(video.id);
        }
        
        return newMetrics;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, isPageVisible, video.id, onProgressChange, onComplete, progress]);

  const handlePlay = useCallback(() => {
    if (!normalizedVideoId) return;
    setIsPlaying(true);
    setCurrentlyPlaying(instanceIdRef.current);
    onPlay?.(video);
  }, [normalizedVideoId, setCurrentlyPlaying, onPlay, video]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    lastTickRef.current = null;
  }, []);

  const displayWatchedPercentage = Math.max(watchMetrics.watchedPercentage, progress?.watchedPercentage ?? 0);
  const completionState = watched || isVideoProgressComplete(progress) || Boolean(progress?.completedAt ?? watchMetrics.completedAt);
  const resumePosition = Math.floor(progress?.lastWatchedPosition ?? watchMetrics.lastWatchedPosition ?? 0);

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
                ref={iframeRef}
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

              {/* Resume indicator */}
              {resumePosition > 10 && !completionState && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-purple-600/90 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                  Resume from {formatTime(resumePosition)}
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

        {/* Visibility warning */}
        {isPlaying && !isPageVisible && (
          <div className="absolute left-3 top-3 z-10 rounded-xl bg-amber-500/90 px-3 py-2 text-xs font-semibold text-black backdrop-blur">
            ⏸ Progress paused (tab not active)
          </div>
        )}

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
            {completionState 
              ? "Video marked as complete" 
              : isPlaying && !isPageVisible
                ? "Keep this tab active to track progress"
                : "Watch 75%+ to complete • Progress saves automatically"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          {isPlaying ? (
            <button
              type="button"
              onClick={handleStop}
              className="flex-1 rounded-xl bg-purple-500/20 px-4 py-2.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/30"
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              {resumePosition > 10 && !completionState ? "▶ Resume" : "▶ Play Video"}
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

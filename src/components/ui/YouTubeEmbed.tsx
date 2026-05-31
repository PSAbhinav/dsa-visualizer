"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { YouTubeVideo } from "@/data/types";

interface YouTubeEmbedProps {
  video: YouTubeVideo;
  watched?: boolean;
  onPlay?: (video: YouTubeVideo) => void;
  onWatched?: (video: YouTubeVideo) => void;
}

export function YouTubeEmbed({ video, watched = false, onPlay, onWatched }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = useMemo(
    () => `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    [video.id]
  );
  const thumbnailUrl = useMemo(() => `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, [video.id]);

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      onPlay?.(video);
    }
  };

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
              <iframe
                src={embedUrl}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
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
                  Tap to play
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
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{video.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{video.channel}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${watched ? "border border-emerald-400/20 bg-emerald-500/15 text-emerald-200" : "border border-white/10 bg-white/5 text-slate-400"}`}>
            {watched ? "Watched" : "Queued"}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onWatched?.(video)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-purple-400/40 hover:bg-purple-500/10"
          >
            {watched ? "Watched" : "Mark watched"}
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
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

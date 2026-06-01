import type { YouTubeVideo } from "@/data/types";

export const VALID_VIDEO_PLAYBACK_SPEEDS = [1, 1.5] as const;
export const MIN_VIDEO_COMPLETION_PERCENTAGE = 75;

export interface VideoProgressEntry {
  videoId: string;
  watchedPercentage: number;
  playbackSpeed: number;
  completedAt?: string;
  lastWatchedPosition?: number; // in seconds - where user left off
  videoDuration?: number; // total duration in seconds
}

interface TopicVideoProgressShape {
  videosWatched?: string[];
  videoProgress?: VideoProgressEntry[];
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function isValidVideoPlaybackSpeed(speed?: number | null): boolean {
  return speed === 1 || speed === 1.5;
}

export function sanitizeVideoProgressEntry(
  entry: Partial<VideoProgressEntry> & Pick<VideoProgressEntry, "videoId">,
  previous?: VideoProgressEntry
): VideoProgressEntry {
  const watchedPercentage = clamp(
    Number.isFinite(entry.watchedPercentage) ? Number(entry.watchedPercentage) : previous?.watchedPercentage ?? 0,
    0,
    100
  );
  const playbackSpeed = Number.isFinite(entry.playbackSpeed) ? Number(entry.playbackSpeed) : previous?.playbackSpeed ?? 1;
  const lastWatchedPosition = Number.isFinite(entry.lastWatchedPosition) 
    ? Math.max(entry.lastWatchedPosition!, previous?.lastWatchedPosition ?? 0)
    : previous?.lastWatchedPosition;
  const videoDuration = Number.isFinite(entry.videoDuration) 
    ? entry.videoDuration 
    : previous?.videoDuration;
  const completedAt =
    previous?.completedAt ??
    entry.completedAt ??
    (watchedPercentage >= MIN_VIDEO_COMPLETION_PERCENTAGE && isValidVideoPlaybackSpeed(playbackSpeed)
      ? new Date().toISOString()
      : undefined);

  return {
    videoId: entry.videoId,
    watchedPercentage: Math.round(watchedPercentage),
    playbackSpeed: Number(playbackSpeed.toFixed(2)),
    completedAt,
    lastWatchedPosition,
    videoDuration,
  };
}

export function isVideoProgressComplete(progress?: VideoProgressEntry | null): boolean {
  if (!progress) {
    return false;
  }

  return Boolean(progress.completedAt) ||
    (progress.watchedPercentage >= MIN_VIDEO_COMPLETION_PERCENTAGE && isValidVideoPlaybackSpeed(progress.playbackSpeed));
}

export function getCompletedVideoIds(progress?: TopicVideoProgressShape | null): string[] {
  if (!progress) {
    return [];
  }

  const completedFromProgress = (progress.videoProgress ?? [])
    .filter((entry) => isVideoProgressComplete(entry))
    .map((entry) => entry.videoId);

  return [...new Set([...(progress.videosWatched ?? []), ...completedFromProgress])];
}

export function getVideoProgress(progress: TopicVideoProgressShape | undefined | null, videoId: string): VideoProgressEntry | undefined {
  return progress?.videoProgress?.find((entry) => entry.videoId === videoId);
}

export function getCoreVideos(videos: readonly YouTubeVideo[]): YouTubeVideo[] {
  const explicitCoreVideos = videos.filter((video) => video.isCore);
  return (explicitCoreVideos.length > 0 ? explicitCoreVideos : videos).slice(0, 2);
}

export function getCoreVideoIds(videos: readonly YouTubeVideo[]): string[] {
  return getCoreVideos(videos).map((video) => video.id);
}

export function getAdditionalVideos(videos: readonly YouTubeVideo[]): YouTubeVideo[] {
  const coreIds = new Set(getCoreVideoIds(videos));
  return videos.filter((video) => !coreIds.has(video.id));
}

export function getCompletedCoreVideoCount(progress: TopicVideoProgressShape | undefined | null, coreVideoIds: string[]): number {
  const completedIds = new Set(getCompletedVideoIds(progress));
  return coreVideoIds.filter((videoId) => completedIds.has(videoId)).length;
}

export function isVideoSectionComplete(progress: TopicVideoProgressShape | undefined | null, coreVideoIds: string[]): boolean {
  if (coreVideoIds.length === 0) {
    return getCompletedVideoIds(progress).length > 0;
  }

  return getCompletedCoreVideoCount(progress, coreVideoIds) === coreVideoIds.length;
}

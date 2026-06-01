import {
  getCompletedCoreVideoCount,
  getCoreVideoIds,
  getCoreVideos,
  isVideoProgressComplete,
  isVideoSectionComplete,
  sanitizeVideoProgressEntry,
} from '@/lib/videoProgress';
import type { YouTubeVideo } from '@/data/types';

describe('videoProgress helpers', () => {
  it('only completes videos at approved playback speeds', () => {
    expect(
      isVideoProgressComplete({
        videoId: 'core-1',
        watchedPercentage: 80,
        playbackSpeed: 1,
      })
    ).toBe(true);

    expect(
      isVideoProgressComplete({
        videoId: 'core-1',
        watchedPercentage: 80,
        playbackSpeed: 1.5,
      })
    ).toBe(true);

    expect(
      isVideoProgressComplete({
        videoId: 'core-1',
        watchedPercentage: 100,
        playbackSpeed: 2,
      })
    ).toBe(false);
  });

  it('preserves completion once a valid completion timestamp exists', () => {
    expect(
      isVideoProgressComplete({
        videoId: 'core-1',
        watchedPercentage: 80,
        playbackSpeed: 2,
        completedAt: '2025-01-01T00:00:00.000Z',
      })
    ).toBe(true);
  });

  it('requires both core videos to finish the video section', () => {
    const coreVideoIds = ['core-1', 'core-2'];
    const partialProgress = {
      videosWatched: [],
      videoProgress: [
        sanitizeVideoProgressEntry({ videoId: 'core-1', watchedPercentage: 90, playbackSpeed: 1 }),
        sanitizeVideoProgressEntry({ videoId: 'core-2', watchedPercentage: 60, playbackSpeed: 1.5 }),
      ],
    };

    expect(getCompletedCoreVideoCount(partialProgress, coreVideoIds)).toBe(1);
    expect(isVideoSectionComplete(partialProgress, coreVideoIds)).toBe(false);

    const completedProgress = {
      videosWatched: [],
      videoProgress: [
        sanitizeVideoProgressEntry({ videoId: 'core-1', watchedPercentage: 90, playbackSpeed: 1 }),
        sanitizeVideoProgressEntry({ videoId: 'core-2', watchedPercentage: 75, playbackSpeed: 1.5 }),
      ],
    };

    expect(getCompletedCoreVideoCount(completedProgress, coreVideoIds)).toBe(2);
    expect(isVideoSectionComplete(completedProgress, coreVideoIds)).toBe(true);
  });

  it('returns the first two videos as a fallback core set', () => {
    const videos: YouTubeVideo[] = [
      { id: 'a', title: 'One', channel: 'Channel' },
      { id: 'b', title: 'Two', channel: 'Channel' },
      { id: 'c', title: 'Three', channel: 'Channel' },
    ];

    expect(getCoreVideos(videos).map((video) => video.id)).toEqual(['a', 'b']);
    expect(getCoreVideoIds(videos)).toEqual(['a', 'b']);
  });
});

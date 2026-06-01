import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import type { YouTubeVideo } from "@/data/types";

jest.mock("framer-motion", () => {
  const React = jest.requireActual("react") as typeof import("react");

  const createMotionComponent = (tag: keyof HTMLElementTagNameMap) => {
    const MotionComponent = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => {
      const domProps = { ...(props as React.HTMLAttributes<HTMLElement> & Record<string, unknown>) };

      delete domProps.animate;
      delete domProps.exit;
      delete domProps.initial;
      delete domProps.layout;
      delete domProps.transition;
      delete domProps.whileHover;

      return React.createElement(tag, { ...domProps, ref }, children);
    });

    MotionComponent.displayName = `MockMotion(${tag})`;
    return MotionComponent;
  };

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_, tag: string) => createMotionComponent((tag as keyof HTMLElementTagNameMap) ?? "div"),
      }
    ),
  };
});

type MockPlayerOptions = {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: MockPlayer }) => void;
    onStateChange?: (event: { target: MockPlayer; data: number }) => void;
    onError?: (event: { target: MockPlayer; data?: number }) => void;
  };
};

type MockPlayer = {
  destroy: jest.Mock;
  getCurrentTime: jest.Mock<number, []>;
  getDuration: jest.Mock<number, []>;
  getPlaybackRate: jest.Mock<number, []>;
  playVideo: jest.Mock;
};

describe("YouTubeEmbed", () => {
  const video: YouTubeVideo = {
    id: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Tracked video",
    channel: "Test channel",
    duration: "10:00",
    isCore: true,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  function setupYouTubeApi() {
    let currentTime = 0;
    let playerOptions: MockPlayerOptions | undefined;

    const player: MockPlayer = {
      destroy: jest.fn(),
      getCurrentTime: jest.fn(() => currentTime),
      getDuration: jest.fn(() => 100),
      getPlaybackRate: jest.fn(() => 1),
      playVideo: jest.fn(),
    };

    window.YT = {
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
      Player: jest.fn((_: HTMLElement, options: MockPlayerOptions) => {
        playerOptions = options;
        return player;
      }),
    };

    return {
      player,
      setCurrentTime: (value: number) => {
        currentTime = value;
      },
      getOptions: () => playerOptions,
    };
  }

  it("shows the preview before playback starts", () => {
    render(<YouTubeEmbed video={video} />);

    expect(screen.getByRole("button", { name: /play tracked video/i })).toBeInTheDocument();
    expect(screen.queryByText(/loading video/i)).not.toBeInTheDocument();
  });

  it("creates the player with the resolved video id and starts playback", async () => {
    const { player, getOptions } = setupYouTubeApi();

    render(<YouTubeEmbed video={video} />);

    fireEvent.click(screen.getByRole("button", { name: /play tracked video/i }));

    await waitFor(() => expect(window.YT?.Player).toHaveBeenCalledTimes(1));
    expect(getOptions()?.videoId).toBe("dQw4w9WgXcQ");

    act(() => {
      getOptions()?.events?.onReady?.({ target: player });
      getOptions()?.events?.onStateChange?.({ target: player, data: window.YT!.PlayerState.PLAYING });
    });

    expect(player.playVideo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/loading video/i)).not.toBeInTheDocument();
  });

  it("shows a friendly error if the iframe api fails to load", async () => {
    render(<YouTubeEmbed video={video} />);

    fireEvent.click(screen.getByRole("button", { name: /play tracked video/i }));

    const apiScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    expect(apiScript).not.toBeNull();

    act(() => {
      apiScript?.dispatchEvent(new Event("error"));
    });

    await waitFor(() => expect(screen.getByText(/video unavailable right now/i)).toBeInTheDocument());
  });

  it("tracks progress and completes at 75 percent watched", async () => {
    const onProgressChange = jest.fn();
    const onComplete = jest.fn();
    const { player, setCurrentTime, getOptions } = setupYouTubeApi();

    render(<YouTubeEmbed video={video} onProgressChange={onProgressChange} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /play tracked video/i }));

    await waitFor(() => expect(window.YT?.Player).toHaveBeenCalledTimes(1));

    act(() => {
      getOptions()?.events?.onReady?.({ target: player });
      getOptions()?.events?.onStateChange?.({ target: player, data: window.YT!.PlayerState.PLAYING });
    });

    for (let second = 1; second <= 75; second += 1) {
      act(() => {
        setCurrentTime(second);
        jest.advanceTimersByTime(1000);
      });
    }

    const lastProgress = onProgressChange.mock.calls.at(-1)?.[0] as { watchedPercentage: number; completedAt?: string };

    expect(lastProgress.watchedPercentage).toBeGreaterThanOrEqual(75);
    expect(lastProgress.completedAt).toBeDefined();
    expect(onComplete).toHaveBeenCalledWith(video.id);
  });

  it("shows a friendly error when youtube reports playback failure", async () => {
    const { player, getOptions } = setupYouTubeApi();

    render(<YouTubeEmbed video={video} />);

    fireEvent.click(screen.getByRole("button", { name: /play tracked video/i }));

    await waitFor(() => expect(window.YT?.Player).toHaveBeenCalledTimes(1));

    act(() => {
      getOptions()?.events?.onReady?.({ target: player });
      getOptions()?.events?.onError?.({ target: player, data: 100 });
    });

    expect(await screen.findByText(/video unavailable right now/i)).toBeInTheDocument();
  });
});

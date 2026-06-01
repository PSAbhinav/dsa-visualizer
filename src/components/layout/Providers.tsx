"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { VideoPlayerProvider } from "@/contexts/VideoPlayerContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <VideoPlayerProvider>
        <ToastProvider>{children}</ToastProvider>
      </VideoPlayerProvider>
    </SessionProvider>
  );
}

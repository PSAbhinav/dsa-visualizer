"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  message?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  resetKey: number;
  error?: Error;
}

function ErrorFallback({
  title,
  message,
  error,
  onReset,
}: {
  title: string;
  message: string;
  error?: Error;
  onReset: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="error-fallback"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-gray-900/80 px-6 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-red-400/20 border-t-red-400/80"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-3xl"
          >
            ⚠️
          </motion.div>
        </div>

        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-gray-400 sm:text-base">{message}</p>
        {error?.message ? <p className="mt-2 text-xs text-red-200/80">{error.message}</p> : null}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
        >
          Try Again
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    resetKey: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  private handleReset = () => {
    this.setState((currentState) => ({
      hasError: false,
      error: undefined,
      resetKey: currentState.resetKey + 1,
    }));

    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title={this.props.title ?? "Something went wrong"}
          message={
            this.props.message ??
            "The visualizer hit an unexpected issue. Refresh this panel and try again."
          }
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}

export default ErrorBoundary;

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, "title">> {
  id: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
}

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 3000;
const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_STYLES: Record<ToastVariant, { accent: string; badge: string; label: string }> = {
  success: {
    accent: "border-green-400/40 bg-green-500/15 text-green-100",
    badge: "bg-green-500/20 text-green-200",
    label: "Success",
  },
  error: {
    accent: "border-red-400/40 bg-red-500/15 text-red-100",
    badge: "bg-red-500/20 text-red-200",
    label: "Error",
  },
  info: {
    accent: "border-blue-400/40 bg-blue-500/15 text-blue-100",
    badge: "bg-blue-500/20 text-blue-200",
    label: "Info",
  },
  warning: {
    accent: "border-yellow-400/40 bg-yellow-500/15 text-yellow-100",
    badge: "bg-yellow-500/20 text-yellow-200",
    label: "Warning",
  },
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIds = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      const existingTimeout = timeoutIds.current.get(id);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeoutId = setTimeout(() => {
        dismiss(id);
      }, duration);

      timeoutIds.current.set(id, timeoutId);
    },
    [dismiss]
  );

  const toast = useCallback(
    ({ title, description, variant = "info", duration = DEFAULT_DURATION }: ToastOptions): string => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          title,
          description,
          variant,
          duration,
        },
      ]);

      scheduleDismiss(id, duration);
      return id;
    },
    [scheduleDismiss]
  );

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIds.current.clear();
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      toast,
      dismiss,
      success: (title, description) => toast({ title, description, variant: "success" }),
      error: (title, description) => toast({ title, description, variant: "error" }),
      info: (title, description) => toast({ title, description, variant: "info" }),
      warning: (title, description) => toast({ title, description, variant: "warning" }),
    }),
    [dismiss, toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toastItem) => {
            const styles = TOAST_STYLES[toastItem.variant];

            return (
              <motion.div
                key={toastItem.id}
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-2xl backdrop-blur ${styles.accent}`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${styles.badge}`}>
                    {styles.label}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{toastItem.title}</p>
                    {toastItem.description ? (
                      <p className="mt-1 text-sm text-gray-200/90">{toastItem.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toastItem.id)}
                    className="rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

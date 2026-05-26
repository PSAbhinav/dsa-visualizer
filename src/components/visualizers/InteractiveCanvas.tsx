"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasDragPayload {
  dx: number;
  dy: number;
  clientX: number;
  clientY: number;
  contentX: number;
  contentY: number;
  transform: CanvasTransform;
}

interface InteractiveCanvasProps {
  children: ReactNode | ((props: { transform: CanvasTransform }) => ReactNode);
  className?: string;
  canvasClassName?: string;
  contentClassName?: string;
  minScale?: number;
  maxScale?: number;
  onNodeDragStart?: (nodeId: string) => void;
  onNodeDrag?: (nodeId: string, payload: CanvasDragPayload) => void;
  onNodeDragEnd?: (nodeId: string) => void;
}

type InteractionState =
  | {
      mode: "pan";
      lastClientX: number;
      lastClientY: number;
    }
  | {
      mode: "node";
      nodeId: string;
      lastClientX: number;
      lastClientY: number;
    };

const DEFAULT_TRANSFORM: CanvasTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function InteractiveCanvas({
  children,
  className,
  canvasClassName,
  contentClassName,
  minScale = 0.3,
  maxScale = 3,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
}: InteractiveCanvasProps) {
  const [transform, setTransform] = useState<CanvasTransform>(DEFAULT_TRANSFORM);
  const [interactionMode, setInteractionMode] = useState<"idle" | "pan" | "node">("idle");
  const viewportRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef(transform);
  const interactionRef = useRef<InteractionState | null>(null);
  const previousUserSelectRef = useRef("");

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const updateTransform = useCallback((updater: (current: CanvasTransform) => CanvasTransform) => {
    setTransform((current) => {
      const next = updater(current);
      transformRef.current = next;
      return next;
    });
  }, []);

  const toContentCoordinates = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const currentTransform = transformRef.current;

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - rect.left - currentTransform.x) / currentTransform.scale,
      y: (clientY - rect.top - currentTransform.y) / currentTransform.scale,
    };
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      const { x, y, scale } = transformRef.current;
      const contentX = (cursorX - x) / scale;
      const contentY = (cursorY - y) / scale;
      const scaleFactor = event.deltaY < 0 ? 1.12 : 0.88;
      const nextScale = clamp(scale * scaleFactor, minScale, maxScale);

      updateTransform(() => ({
        x: cursorX - contentX * nextScale,
        y: cursorY - contentY * nextScale,
        scale: nextScale,
      }));
    },
    [maxScale, minScale, updateTransform]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const target = event.target as Element | null;
      const draggableElement = target?.closest("[data-draggable]");
      previousUserSelectRef.current = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      if (draggableElement instanceof Element) {
        const nodeId = draggableElement.getAttribute("data-node-id");
        if (nodeId) {
          interactionRef.current = {
            mode: "node",
            nodeId,
            lastClientX: event.clientX,
            lastClientY: event.clientY,
          };
          setInteractionMode("node");
          onNodeDragStart?.(nodeId);
          return;
        }
      }

      interactionRef.current = {
        mode: "pan",
        lastClientX: event.clientX,
        lastClientY: event.clientY,
      };
      setInteractionMode("pan");
    },
    [onNodeDragStart]
  );

  const resetView = useCallback(() => {
    updateTransform(() => DEFAULT_TRANSFORM);
  }, [updateTransform]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) {
        return;
      }

      event.preventDefault();

      const dxClient = event.clientX - interaction.lastClientX;
      const dyClient = event.clientY - interaction.lastClientY;

      interaction.lastClientX = event.clientX;
      interaction.lastClientY = event.clientY;

      if (interaction.mode === "pan") {
        updateTransform((current) => ({
          ...current,
          x: current.x + dxClient,
          y: current.y + dyClient,
        }));
        return;
      }

      const currentTransform = transformRef.current;
      const contentCoordinates = toContentCoordinates(event.clientX, event.clientY);

      onNodeDrag?.(interaction.nodeId, {
        dx: dxClient / currentTransform.scale,
        dy: dyClient / currentTransform.scale,
        clientX: event.clientX,
        clientY: event.clientY,
        contentX: contentCoordinates.x,
        contentY: contentCoordinates.y,
        transform: currentTransform,
      });
    };

    const handleMouseUp = () => {
      const interaction = interactionRef.current;
      if (!interaction) {
        return;
      }

      if (interaction.mode === "node") {
        onNodeDragEnd?.(interaction.nodeId);
      }

      interactionRef.current = null;
      setInteractionMode("idle");
      document.body.style.userSelect = previousUserSelectRef.current;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = previousUserSelectRef.current;
    };
  }, [onNodeDrag, onNodeDragEnd, toContentCoordinates, updateTransform]);

  const renderedChildren =
    typeof children === "function"
      ? (children as (props: { transform: CanvasTransform }) => ReactNode)({ transform })
      : children;

  return (
    <div className={className}>
      <div className="mb-3 flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-gray-900/90 px-3 py-2 text-sm text-white shadow-lg"
        >
          <span className="rounded-lg bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
            {Math.round(transform.scale * 100)}%
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={resetView}
            className="rounded-lg border border-white/10 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-100 hover:border-purple-400/40 hover:text-white"
          >
            Reset view
          </motion.button>
        </motion.div>
      </div>

      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 ${
          interactionMode === "pan" ? "cursor-grabbing" : "cursor-grab"
        } ${canvasClassName ?? ""}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_55%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:auto,32px_32px,32px_32px] opacity-70" />
        <div className="absolute inset-0">
          <div
            className={contentClassName}
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            {renderedChildren}
          </div>
        </div>
      </div>
    </div>
  );
}

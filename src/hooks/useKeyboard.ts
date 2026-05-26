"use client";

import { useEffect, useMemo } from "react";

type KeyboardHandler = (event: KeyboardEvent) => void;

type KeyboardTarget = Window | Document | HTMLElement | null;

interface KeyboardOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  target?: KeyboardTarget;
}

interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const KEY_ALIASES: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  control: "ctrl",
  esc: "escape",
  option: "alt",
  return: "enter",
  space: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};

function normalizeKey(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  return KEY_ALIASES[normalizedKey] ?? normalizedKey;
}

function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.split("+").map((part) => normalizeKey(part)).filter(Boolean);

  return {
    key: parts.at(-1) ?? "",
    ctrl: parts.includes("ctrl"),
    meta: parts.includes("meta"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
  };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

function hasModifier(shortcut: ParsedShortcut) {
  return shortcut.ctrl || shortcut.meta || shortcut.alt || shortcut.shift;
}

export function useKeyboard(shortcut: string, handler: KeyboardHandler, options: KeyboardOptions = {}) {
  const { enabled = true, preventDefault = true, target } = options;
  const parsedShortcut = useMemo(() => parseShortcut(shortcut), [shortcut]);

  useEffect(() => {
    if (!enabled || !parsedShortcut.key || typeof window === "undefined") {
      return;
    }

    const eventTarget = target ?? window;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) && parsedShortcut.key.length === 1 && !hasModifier(parsedShortcut)) {
        return;
      }

      const key = normalizeKey(event.key);
      const matchesShortcut =
        key === parsedShortcut.key &&
        event.ctrlKey === parsedShortcut.ctrl &&
        event.metaKey === parsedShortcut.meta &&
        event.altKey === parsedShortcut.alt &&
        event.shiftKey === parsedShortcut.shift;

      if (!matchesShortcut) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      handler(event);
    };

    eventTarget.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      eventTarget.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [enabled, handler, parsedShortcut, preventDefault, target]);
}

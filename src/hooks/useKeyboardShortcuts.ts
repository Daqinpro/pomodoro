import { useEffect, useRef } from "react";
import type { Mode } from "../types";

interface ShortcutActions {
  toggleStartPause: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: Mode) => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions): void {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        // Let Escape still work in inputs
        if (e.code === "Escape") {
          actionsRef.current.onEscape?.();
        }
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          actionsRef.current.toggleStartPause();
          break;
        case "KeyR":
          actionsRef.current.reset();
          break;
        case "KeyS":
          actionsRef.current.skip();
          break;
        case "Digit1":
          actionsRef.current.switchMode("focus");
          break;
        case "Digit2":
          actionsRef.current.switchMode("shortBreak");
          break;
        case "Digit3":
          actionsRef.current.switchMode("longBreak");
          break;
        case "Escape":
          actionsRef.current.onEscape?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

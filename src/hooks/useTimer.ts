import { useState, useRef, useCallback, useEffect } from "react";
import type { Mode, TimerState, AppSettings } from "../types";
import { getDuration, MODE_COLORS, MODE_LABELS } from "../types";

interface UseTimerReturn {
  mode: Mode;
  timerState: TimerState;
  remaining: number;
  focusCount: number;
  flash: boolean;
  toggleStartPause: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (nextMode: Mode) => void;
  getProgress: () => number;
  getCircumference: () => number;
  getColor: () => string;
  getLabel: () => string;
  getModeDuration: () => number;
}

export function useTimer(
  settings: AppSettings,
  onSessionComplete: (focusMinutes: number) => void
): UseTimerReturn {
  const [mode, setMode] = useState<Mode>("focus");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [remaining, setRemaining] = useState(settings.focusDuration);
  const [focusCount, setFocusCount] = useState(0);
  const [flash, setFlash] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(remaining);
  const modeRef = useRef(mode);
  const focusCountRef = useRef(focusCount);
  const settingsRef = useRef(settings);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { focusCountRef.current = focusCount; }, [focusCount]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchMode = useCallback(
    (nextMode: Mode) => {
      clearTimer();
      setMode(nextMode);
      setRemaining(getDuration(nextMode, settingsRef.current));
      setTimerState("idle");
    },
    [clearTimer]
  );

  const switchModeRef = useRef(switchMode);
  useEffect(() => { switchModeRef.current = switchMode; }, [switchMode]);

  const handleTimerEnd = useCallback(() => {
    clearTimer();
    setTimerState("idle");
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;

    if (currentMode === "focus") {
      const focusMinutes = Math.round(currentSettings.focusDuration / 60);
      onSessionCompleteRef.current(focusMinutes);
      const newCount = focusCountRef.current + 1;
      setFocusCount(newCount);
      if (newCount % currentSettings.sessionsBeforeLongBreak === 0) {
        switchModeRef.current("longBreak");
      } else {
        switchModeRef.current("shortBreak");
      }
    } else {
      switchModeRef.current("focus");
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setTimeout(() => handleTimerEnd(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleTimerEnd]);

  const pause = useCallback(() => {
    clearTimer();
    setTimerState("paused");
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(getDuration(modeRef.current, settingsRef.current));
    setTimerState("idle");
  }, [clearTimer]);

  const skip = useCallback(() => {
    handleTimerEnd();
  }, [handleTimerEnd]);

  const toggleStartPause = useCallback(() => {
    if (timerState === "running") pause();
    else start();
  }, [timerState, start, pause]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const getProgress = useCallback(() => {
    const duration = getDuration(mode, settings);
    return 1 - remaining / duration;
  }, [mode, settings, remaining]);

  const getCircumference = useCallback(() => 2 * Math.PI * 140, []);
  const getColor = useCallback(() => MODE_COLORS[mode], [mode]);
  const getLabel = useCallback(() => MODE_LABELS[mode], [mode]);
  const getModeDuration = useCallback(() => getDuration(mode, settings), [mode, settings]);

  return {
    mode,
    timerState,
    remaining,
    focusCount,
    flash,
    toggleStartPause,
    reset,
    skip,
    switchMode,
    getProgress,
    getCircumference,
    getColor,
    getLabel,
    getModeDuration,
  };
}

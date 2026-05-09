import { useState, useRef, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

type Mode = "focus" | "shortBreak" | "longBreak";
type TimerState = "idle" | "running" | "paused";

const MODES: Record<Mode, { label: string; duration: number; color: string }> = {
  focus: { label: "专注", duration: 25 * 60, color: "#ff6b6b" },
  shortBreak: { label: "短休", duration: 5 * 60, color: "#4ecdc4" },
  longBreak: { label: "长休", duration: 15 * 60, color: "#45b7d1" },
};

const FOCUS_SESSIONS_BEFORE_LONG_BREAK = 4;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function App() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [remaining, setRemaining] = useState(MODES.focus.duration);
  const [focusCount, setFocusCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // default alwaysOnTop: true
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(remaining);
  const modeRef = useRef(mode);
  const focusCountRef = useRef(focusCount);

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { focusCountRef.current = focusCount; }, [focusCount]);

  // Get initial pin state
  useEffect(() => {
    invoke<boolean>("get_always_on_top").then(setIsPinned).catch(() => {});
  }, []);

  // Hide window on close instead of quitting
  useEffect(() => {
    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onCloseRequested((e) => {
      e.preventDefault();
      appWindow.hide();
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const current = MODES[mode];
  const progress = 1 - remaining / current.duration;
  const circumference = 2 * Math.PI * 140;

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
      setRemaining(MODES[nextMode].duration);
      setTimerState("idle");
    },
    [clearTimer]
  );

  const handleTimerEnd = useCallback(() => {
    clearTimer();
    setTimerState("idle");
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    if (modeRef.current === "focus") {
      const newCount = focusCountRef.current + 1;
      setFocusCount(newCount);
      if (newCount % FOCUS_SESSIONS_BEFORE_LONG_BREAK === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("focus");
    }
  }, [clearTimer, switchMode]);

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
    setRemaining(MODES[modeRef.current].duration);
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

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode !== mode) switchMode(newMode);
    },
    [mode, switchMode]
  );

  // Window controls
  const handlePin = useCallback(async () => {
    const result = await invoke<boolean>("toggle_always_on_top");
    setIsPinned(result);
  }, []);

  const handleMinimize = useCallback(() => {
    getCurrentWindow().minimize();
  }, []);

  const handleClose = useCallback(() => {
    getCurrentWindow().hide();
  }, []);

  return (
    <div className={`app-container ${flash ? "flash" : ""}`} data-tauri-drag-region>
      <div className="glass-card">
        {/* Title bar: dots + window controls */}
        <div className="title-bar" data-tauri-drag-region>
          <div className="drag-bar" data-tauri-drag-region>
            <span
              className={`drag-dot red ${hoveredDot === "close" ? "hover" : ""}`}
              onMouseEnter={() => setHoveredDot("close")}
              onMouseLeave={() => setHoveredDot(null)}
              onClick={handleClose}
            >
              {hoveredDot === "close" && (
                <svg width="8" height="8" viewBox="0 0 8 8" stroke="#4d0000" strokeWidth="1.5">
                  <line x1="1" y1="1" x2="7" y2="7" />
                  <line x1="7" y1="1" x2="1" y2="7" />
                </svg>
              )}
            </span>
            <span
              className={`drag-dot yellow ${hoveredDot === "minimize" ? "hover" : ""}`}
              onMouseEnter={() => setHoveredDot("minimize")}
              onMouseLeave={() => setHoveredDot(null)}
              onClick={handleMinimize}
            >
              {hoveredDot === "minimize" && (
                <svg width="8" height="2" viewBox="0 0 8 2" stroke="#995700" strokeWidth="1.5">
                  <line x1="0" y1="1" x2="8" y2="1" />
                </svg>
              )}
            </span>
            <span
              className={`drag-dot green ${hoveredDot === "pin" ? "hover" : ""}`}
              onMouseEnter={() => setHoveredDot("pin")}
              onMouseLeave={() => setHoveredDot(null)}
              onClick={handlePin}
            >
              {hoveredDot === "pin" && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#006500" strokeWidth="2.5">
                  {isPinned ? (
                    <path d="M12 17v5M9 3h6l-1 7h3l-7 8-1-5H7z" />
                  ) : (
                    <path d="M9 3h6l-1 7h3l-7 8-1-5H7z" />
                  )}
                </svg>
              )}
            </span>
          </div>

          {/* Pin indicator */}
          {isPinned && (
            <span className="pin-badge" title="窗口已置顶">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                <path d="M12 17v5M9 3h6l-1 7h3l-7 8-1-5H7z" />
              </svg>
            </span>
          )}
        </div>

        {/* Mode tabs */}
        <div className="mode-tabs">
          {(Object.keys(MODES) as Mode[]).map((key) => (
            <button
              key={key}
              className={`mode-tab ${key === mode ? "active" : ""}`}
              onClick={() => handleModeChange(key)}
            >
              {MODES[key].label}
            </button>
          ))}
        </div>

        {/* Ring progress */}
        <div className="ring-container">
          <svg className="ring-svg" viewBox="0 0 300 300">
            <circle className="ring-bg" cx="150" cy="150" r="140" fill="none" strokeWidth="6" />
            <circle
              className="ring-progress"
              cx="150"
              cy="150"
              r="140"
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ stroke: current.color }}
            />
          </svg>
          <div className="time-display">
            <span className="time-text">{formatTime(remaining)}</span>
            <span className="time-label">{current.label}</span>
          </div>
        </div>

        {/* Session dots */}
        {mode === "focus" && (
          <div className="session-dots">
            {Array.from({ length: FOCUS_SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
              <span
                key={i}
                className={`session-dot ${i < focusCount % FOCUS_SESSIONS_BEFORE_LONG_BREAK ? "filled" : ""}`}
                style={{
                  background:
                    i < focusCount % FOCUS_SESSIONS_BEFORE_LONG_BREAK
                      ? current.color
                      : undefined,
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          <button className="btn btn-secondary" onClick={reset} title="重置">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>

          <button
            className="btn btn-primary"
            onClick={toggleStartPause}
            style={{ background: current.color, boxShadow: `0 4px 16px ${current.color}55` }}
            title={timerState === "running" ? "暂停" : "开始"}
          >
            {timerState === "running" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            )}
          </button>

          <button className="btn btn-secondary" onClick={skip} title="跳过">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

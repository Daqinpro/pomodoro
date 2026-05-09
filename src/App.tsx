import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { Mode } from "./types";
import { ALL_MODES, MODE_LABELS, formatTime } from "./types";
import { useSettings } from "./hooks/useSettings";
import { useTimer } from "./hooks/useTimer";
import { useStats } from "./hooks/useStats";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { StatsDisplay } from "./components/StatsDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import "./App.css";

function App() {
  const [settings, updateSettings] = useSettings();
  const { stats, recordSession } = useStats(settings);
  const timer = useTimer(settings, recordSession);
  const [isPinned, setIsPinned] = useState(true);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode !== timer.mode) timer.switchMode(newMode);
    },
    [timer.mode, timer.switchMode]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    toggleStartPause: timer.toggleStartPause,
    reset: timer.reset,
    skip: timer.skip,
    switchMode: handleModeChange,
    onEscape: showSettings ? () => setShowSettings(false) : undefined,
  });

  const progress = timer.getProgress();
  const circumference = timer.getCircumference();
  const color = timer.getColor();
  const label = timer.getLabel();

  return (
    <div className={`app-container ${timer.flash ? "flash" : ""}`} data-tauri-drag-region>
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

          <div className="title-bar-right">
            {isPinned && (
              <span className="pin-badge" title="窗口已置顶">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                  <path d="M12 17v5M9 3h6l-1 7h3l-7 8-1-5H7z" />
                </svg>
              </span>
            )}
            <button
              className="settings-btn"
              onClick={() => setShowSettings((v) => !v)}
              title="设置"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="mode-tabs">
          {ALL_MODES.map((key) => (
            <button
              key={key}
              className={`mode-tab ${key === timer.mode ? "active" : ""}`}
              onClick={() => handleModeChange(key)}
            >
              {MODE_LABELS[key]}
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
              style={{ stroke: color }}
            />
          </svg>
          <div className="time-display">
            <span className="time-text">{formatTime(timer.remaining)}</span>
            <span className="time-label">{label}</span>
          </div>
        </div>

        {/* Session dots */}
        {timer.mode === "focus" && (
          <div className="session-dots">
            {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
              <span
                key={i}
                className={`session-dot ${i < timer.focusCount % settings.sessionsBeforeLongBreak ? "filled" : ""}`}
                style={{
                  background:
                    i < timer.focusCount % settings.sessionsBeforeLongBreak
                      ? color
                      : undefined,
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          <button className="btn btn-secondary" onClick={timer.reset} title="重置 (R)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>

          <button
            className="btn btn-primary"
            onClick={timer.toggleStartPause}
            style={{ background: color, boxShadow: `0 4px 16px ${color}55` }}
            title={timer.timerState === "running" ? "暂停 (Space)" : "开始 (Space)"}
          >
            {timer.timerState === "running" ? (
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

          <button className="btn btn-secondary" onClick={timer.skip} title="跳过 (S)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <StatsDisplay stats={stats} dailyGoal={settings.dailyGoal} />

        {/* Settings overlay */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdate={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;

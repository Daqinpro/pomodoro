export type Mode = "focus" | "shortBreak" | "longBreak";
export type TimerState = "idle" | "running" | "paused";

export interface AppSettings {
  focusDuration: number;       // seconds
  shortBreakDuration: number;  // seconds
  longBreakDuration: number;   // seconds
  sessionsBeforeLongBreak: number;
  dailyGoal: number;           // sessions per day
}

export interface SessionRecord {
  date: string;     // "YYYY-MM-DD"
  timestamp: number; // Date.now()
  duration: number;  // focus minutes
}

export interface AppStats {
  totalSessions: number;
  totalMinutes: number;
  todaySessions: number;
  currentStreak: number;
  lastActiveDate: string;
  sessions: SessionRecord[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  dailyGoal: 8,
};

export const MODE_COLORS: Record<Mode, string> = {
  focus: "#ff6b6b",
  shortBreak: "#4ecdc4",
  longBreak: "#45b7d1",
};

export const MODE_LABELS: Record<Mode, string> = {
  focus: "专注",
  shortBreak: "短休",
  longBreak: "长休",
};

export function getDuration(mode: Mode, settings: AppSettings): number {
  switch (mode) {
    case "focus": return settings.focusDuration;
    case "shortBreak": return settings.shortBreakDuration;
    case "longBreak": return settings.longBreakDuration;
  }
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const ALL_MODES: Mode[] = ["focus", "shortBreak", "longBreak"];

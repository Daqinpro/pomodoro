import { useState, useCallback, useMemo, useEffect } from "react";
import type { AppSettings, AppStats, SessionRecord } from "../types";
import { loadJSON, saveJSON } from "../utils/storage";

const STORAGE_KEY = "pomodoro-stats";
const MAX_SESSIONS = 100;

const EMPTY_STATS: AppStats = {
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  currentStreak: 0,
  lastActiveDate: "",
  sessions: [],
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function calcTodaySessions(sessions: SessionRecord[]): number {
  const today = todayStr();
  return sessions.filter((s) => s.date === today).length;
}

function calcStreak(sessions: SessionRecord[], dailyGoal: number): number {
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    byDate.set(s.date, (byDate.get(s.date) || 0) + 1);
  }

  let streak = 0;
  const todayCount = byDate.get(todayStr()) || 0;
  if (todayCount >= dailyGoal) {
    streak = 1;
  }
  for (let i = 1; i < 365; i++) {
    const date = daysAgo(i);
    const count = byDate.get(date) || 0;
    if (count >= dailyGoal) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function useStats(settings: AppSettings) {
  const [stats, setStats] = useState<AppStats>(EMPTY_STATS);

  useEffect(() => {
    loadJSON(STORAGE_KEY, EMPTY_STATS).then((loaded) => {
      setStats({
        ...loaded,
        todaySessions: calcTodaySessions(loaded.sessions),
        currentStreak: calcStreak(loaded.sessions, settings.dailyGoal),
      });
    });
  }, []); // only on mount

  const recordSession = useCallback((focusMinutes: number) => {
    setStats((prev) => {
      const record: SessionRecord = {
        date: todayStr(),
        timestamp: Date.now(),
        duration: focusMinutes,
      };
      const sessions = [...prev.sessions, record];
      if (sessions.length > MAX_SESSIONS) {
        sessions.splice(0, sessions.length - MAX_SESSIONS);
      }
      const next: AppStats = {
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + focusMinutes,
        todaySessions: calcTodaySessions(sessions),
        currentStreak: calcStreak(sessions, settings.dailyGoal),
        lastActiveDate: todayStr(),
        sessions,
      };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, [settings.dailyGoal]);

  const todayProgress = useMemo(
    () => Math.min(1, stats.todaySessions / settings.dailyGoal),
    [stats.todaySessions, settings.dailyGoal]
  );

  return { stats, recordSession, todayProgress };
}

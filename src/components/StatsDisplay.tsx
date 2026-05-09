import type { AppStats } from "../types";
import "./StatsDisplay.css";

interface StatsDisplayProps {
  stats: AppStats;
  dailyGoal: number;
}

export function StatsDisplay({ stats, dailyGoal }: StatsDisplayProps) {
  return (
    <div className="stats-row">
      <span className="stats-item">
        <span className="stats-value">{stats.todaySessions}</span>
        <span className="stats-sep">/</span>
        <span className="stats-value">{dailyGoal}</span>
        <span className="stats-unit">今日</span>
      </span>
      <span className="stats-divider">|</span>
      <span className="stats-item">
        <span className="stats-value">{stats.totalMinutes}</span>
        <span className="stats-unit">min</span>
      </span>
      <span className="stats-divider">|</span>
      <span className="stats-item">
        <span className="stats-value">{stats.currentStreak}</span>
        <span className="stats-unit">天连续</span>
      </span>
    </div>
  );
}

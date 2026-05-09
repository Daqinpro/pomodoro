import type { AppSettings } from "../types";
import "./SettingsPanel.css";

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (update: Partial<AppSettings>) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">设置</span>
          <button className="settings-close" onClick={onClose} title="关闭 (Esc)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          <SettingRow
            label="专注时长"
            value={settings.focusDuration / 60}
            unit="分钟"
            min={1}
            max={60}
            onChange={(v) => onUpdate({ focusDuration: v * 60 })}
          />
          <SettingRow
            label="短休时长"
            value={settings.shortBreakDuration / 60}
            unit="分钟"
            min={1}
            max={30}
            onChange={(v) => onUpdate({ shortBreakDuration: v * 60 })}
          />
          <SettingRow
            label="长休时长"
            value={settings.longBreakDuration / 60}
            unit="分钟"
            min={1}
            max={60}
            onChange={(v) => onUpdate({ longBreakDuration: v * 60 })}
          />
          <SettingRow
            label="长休间隔"
            value={settings.sessionsBeforeLongBreak}
            unit="轮"
            min={2}
            max={10}
            onChange={(v) => onUpdate({ sessionsBeforeLongBreak: v })}
          />
          <SettingRow
            label="每日目标"
            value={settings.dailyGoal}
            unit="次"
            min={1}
            max={20}
            onChange={(v) => onUpdate({ dailyGoal: v })}
          />
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="setting-row">
      <div className="setting-label">{label}</div>
      <div className="setting-control">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="setting-slider"
        />
        <span className="setting-value">
          {value}
          <span className="setting-unit">{unit}</span>
        </span>
      </div>
    </div>
  );
}

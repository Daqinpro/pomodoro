import { useState, useCallback, useEffect } from "react";
import type { AppSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { loadJSON, saveJSON } from "../utils/storage";

const STORAGE_KEY = "pomodoro-settings";

export function useSettings(): [AppSettings, (update: Partial<AppSettings>) => void] {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadJSON(STORAGE_KEY, DEFAULT_SETTINGS).then(setSettings);
  }, []);

  const updateSettings = useCallback((update: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...update };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return [settings, updateSettings];
}

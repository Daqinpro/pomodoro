import { invoke } from "@tauri-apps/api/core";

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await invoke<string | null>("load_data", { key });
    if (raw === null) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await invoke("save_data", { key, value: JSON.stringify(value) });
  } catch {
    // silently ignore
  }
}

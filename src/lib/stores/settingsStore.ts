import { writable, type Readable } from "svelte/store";

export interface SettingsStoreState {
  disclaimer: boolean;
}

export interface SettingsStore extends Readable<SettingsStoreState> {
  acceptDisclaimer(): void;
  setDisclaimer(value: boolean): void;
}

const STORAGE_KEY = "cafe-booking:settings-store";

const DEFAULT_STATE: SettingsStoreState = { disclaimer: true };

function loadState(): SettingsStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<SettingsStoreState>;
    return { disclaimer: parsed.disclaimer ?? true };
  } catch {
    return DEFAULT_STATE;
  }
}

function createSettingsStore(): SettingsStore {
  const { subscribe, update } = writable<SettingsStoreState>(loadState());

  subscribe((state: SettingsStoreState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  return {
    subscribe,
    acceptDisclaimer(): void {
      update((state: SettingsStoreState) => ({ ...state, disclaimer: false }));
    },
    setDisclaimer(value: boolean): void {
      update((state: SettingsStoreState) => ({ ...state, disclaimer: value }));
    },
  };
}

export const settingsStore: SettingsStore = createSettingsStore();

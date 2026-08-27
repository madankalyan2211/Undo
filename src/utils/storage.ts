import { Thought, AppSettings, PurgeDuration, EmotionItem } from '../types';

const THOUGHTS_KEY = 'undo_thoughts_v1';
const SETTINGS_KEY = 'undo_settings_v1';
const CUSTOM_EMOJIS_KEY = 'undo_custom_emojis_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTimer: '24h',
  customHours: 12,
  hapticsEnabled: true,
  soundEnabled: true,
  securityLockEnabled: false,
  autoPurgeNotice: true,
  cloudSyncSimulated: false,

  // Undo Plus Premium Settings
  isPlusMember: false,
  releaseRitual: 'dust',
  ambientSoundscape: 'off',
  ambientVolume: 0.5,
  typingSoundPack: 'classic',
  themePalette: 'oled',
  fontStyle: 'sans',
  stealthDisguise: false,
  stealthPin: '1234',
  duressPanicEnabled: true,
  mindfulReframerEnabled: true,
  retrievalGracePeriodEnabled: true,
};


// Initial empty thoughts array for fresh user onboarding
const INITIAL_THOUGHTS: Thought[] = [];

export function getStoredThoughts(): Thought[] {
  if (typeof window === 'undefined') return INITIAL_THOUGHTS;
  try {
    const raw = localStorage.getItem(THOUGHTS_KEY);
    if (!raw) {
      localStorage.setItem(THOUGHTS_KEY, JSON.stringify(INITIAL_THOUGHTS));
      return INITIAL_THOUGHTS;
    }
    const parsed: Thought[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired items and legacy dummy placeholder IDs
    const dummyIds = ['th-1', 'th-2', 'th-3', 'th-saved-1'];
    const activeAndSaved = parsed.filter(t => !dummyIds.includes(t.id) && (t.isSaved || t.expiresAt > now));
    
    // Save cleaned list back if any expired or purged
    if (activeAndSaved.length !== parsed.length) {
      localStorage.setItem(THOUGHTS_KEY, JSON.stringify(activeAndSaved));
    }
    return activeAndSaved;
  } catch (e) {
    console.error('Failed to load thoughts:', e);
    return INITIAL_THOUGHTS;
  }
}

export function saveThoughts(thoughts: Thought[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts));
  } catch (e) {
    console.error('Failed to save thoughts:', e);
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredCustomEmojis(): EmotionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EMOJIS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom emojis:', e);
    return [];
  }
}

export function saveCustomEmojis(emojis: EmotionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_EMOJIS_KEY, JSON.stringify(emojis));
  } catch (e) {
    console.error('Failed to save custom emojis:', e);
  }
}


export function calculateExpiryTime(duration: PurgeDuration, customHours = 12): number {
  const now = Date.now();
  switch (duration) {
    case '10m':
      return now + 1000 * 60 * 10;
    case '1h':
      return now + 1000 * 60 * 60;
    case '3h':
      return now + 1000 * 60 * 60 * 3;
    case '24h':
      return now + 1000 * 60 * 60 * 24;
    case '7d':
      return now + 1000 * 60 * 60 * 24 * 7;
    case '30d':
      return now + 1000 * 60 * 60 * 24 * 30;
    case 'custom':
      return now + 1000 * 60 * 60 * (customHours || 12);
    default:
      return now + 1000 * 60 * 60 * 24;
  }
}


export function formatTimeRemaining(expiresAt: number): { text: string; percent: number; isUrgent: boolean } {
  const now = Date.now();
  const diff = expiresAt - now;
  if (diff <= 0) return { text: 'Expired', percent: 0, isUrgent: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let text = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    text = `${days}d ${remHours}h`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`;
  } else {
    text = `${seconds}s`;
  }

  // Calculate percentage remaining based on standard 24h or relative
  const isUrgent = diff < 1000 * 60 * 30; // less than 30 mins
  const percent = Math.min(100, Math.max(0, Math.round((diff / (1000 * 60 * 60 * 24)) * 100)));

  return { text, percent, isUrgent };
}

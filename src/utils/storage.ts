import { Thought, AppSettings, PurgeDuration } from '../types';

const THOUGHTS_KEY = 'undo_thoughts_v1';
const SETTINGS_KEY = 'undo_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTimer: '24h',
  customHours: 12,
  hapticsEnabled: true,
  soundEnabled: true,
  securityLockEnabled: false,
  autoPurgeNotice: true,
  cloudSyncSimulated: false,
};

// Initial realistic placeholder thoughts to populate timeline & saved views
const INITIAL_THOUGHTS: Thought[] = [
  {
    id: 'th-1',
    content: "Overthinking the presentation response from earlier today. Need to trust that I did my absolute best and let it fade.",
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 20, // 20 hours remaining
    duration: '24h',
    isSaved: false,
    tags: ['work', 'clarity'],
    moodEmoji: '💭',
  },
  {
    id: 'th-2',
    content: "Unsent message to Alex: 'I felt hurt when you cancelled our plans without checking, but I choose peace instead of holding onto resentment.'",
    createdAt: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 6, // 6 hours remaining
    duration: '24h',
    isSaved: false,
    tags: ['unsent', 'relationships'],
    moodEmoji: '🌿',
  },
  {
    id: 'th-3',
    content: "Worrying about next month's project deadline. Writing it down to clear my mental canvas before sleep.",
    createdAt: Date.now() - 1000 * 60 * 25, // 25 mins ago
    expiresAt: Date.now() + 1000 * 60 * 35, // 35 mins remaining
    duration: '1h',
    isSaved: false,
    tags: ['anxiety'],
    moodEmoji: '⚡',
  },
  {
    id: 'th-saved-1',
    content: "Perspective anchor: 'You don't need to control every outcome to be at peace with where you are.'",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // Permanent / saved
    duration: '7d',
    isSaved: true,
    tags: ['mantra', 'peace'],
    moodEmoji: '✨',
  },
];

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
    // Auto purge thoughts that have expired and are NOT saved
    const activeAndSaved = parsed.filter(t => t.isSaved || t.expiresAt > now);
    
    // Save cleaned list back if any expired
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

export function calculateExpiryTime(duration: PurgeDuration, customHours = 12): number {
  const now = Date.now();
  switch (duration) {
    case '1h':
      return now + 1000 * 60 * 60;
    case '24h':
      return now + 1000 * 60 * 60 * 24;
    case '7d':
      return now + 1000 * 60 * 60 * 24 * 7;
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

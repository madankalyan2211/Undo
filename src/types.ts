export type PurgeDuration = '10m' | '1h' | '3h' | '24h' | '7d' | '30d' | 'custom';

export type ReleaseRitual = 'dust' | 'fire' | 'ocean' | 'supernova' | 'crumple' | 'shatter';

export type AmbientSoundscape = 'off' | 'rain' | 'zen432' | 'breeze' | 'brown' | 'stream';

export type TypingSoundPack = 'classic' | 'typewriter' | 'mechanical' | 'waterdrop' | 'bubble' | 'kalimba';

export type ThemePalette = 'oled' | 'obsidian' | 'matcha' | 'lavender' | 'indigo' | 'cyberpunk';

export type FontStyle = 'sans' | 'serif' | 'mono' | 'typewriter';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider: 'google' | 'guest';
  isPlusMember?: boolean;
  plusTier?: PlusTier;
  createdAt: number;
}

export interface EmotionItem {
  emoji: string;
  label: string;
  isCustom?: boolean;
}

export interface Thought {
  id: string;
  content: string;
  createdAt: number; // timestamp ms
  expiresAt: number; // timestamp ms
  duration: PurgeDuration;
  customHours?: number;
  isSaved: boolean;
  tags?: string[];
  releasedAt?: number;
  moodEmoji?: string;
  ritualUsed?: ReleaseRitual;
  perspectiveReflection?: string;
}

export type TodoPriority = 'focus' | 'light' | 'mindful';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  expiresAt?: number;
  priority: TodoPriority;
  isPermanent: boolean;
}

export type TabType = 'write' | 'todos' | 'timeline' | 'saved' | 'settings';

export type PlusTier = 'free' | 'weekly' | 'monthly' | 'annual' | 'lifetime';

export interface AppSettings {
  defaultTimer: PurgeDuration;
  customHours: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  securityLockEnabled: boolean;
  autoPurgeNotice: boolean;
  cloudSyncSimulated: boolean;

  // Undo Plus Premium Settings
  isPlusMember: boolean;
  plusTier?: PlusTier;
  razorpayPaymentId?: string;
  plusActivatedAt?: number;
  releaseRitual: ReleaseRitual;
  ambientSoundscape: AmbientSoundscape;
  ambientVolume: number;
  typingSoundPack: TypingSoundPack;
  themePalette: ThemePalette;
  fontStyle: FontStyle;
  stealthDisguise: boolean;
  stealthPin: string;
  duressPanicEnabled: boolean;
  mindfulReframerEnabled: boolean;
  retrievalGracePeriodEnabled: boolean;
}



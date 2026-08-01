export type PurgeDuration = '1h' | '24h' | '7d' | 'custom';

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
}

export type TabType = 'write' | 'timeline' | 'saved' | 'settings';

export interface AppSettings {
  defaultTimer: PurgeDuration;
  customHours: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  securityLockEnabled: boolean;
  autoPurgeNotice: boolean;
  cloudSyncSimulated: boolean;
}

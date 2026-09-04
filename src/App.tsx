/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, Thought, AppSettings, PurgeDuration, ReleaseRitual, UserProfile } from './types';
import {
  getStoredThoughts,
  saveThoughts,
  getStoredSettings,
  saveSettings,
  calculateExpiryTime,
} from './utils/storage';
import { getStoredUser, subscribeToAuthChanges } from './utils/auth';
import { soundEffects } from './utils/audio';

import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { WriteCanvas } from './components/WriteCanvas';
import { TimelineView } from './components/TimelineView';
import { SavedView } from './components/SavedView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Toast } from './components/Toast';
import { SecurityLock } from './components/SecurityLock';
import { PlusModal } from './components/PlusModal';
import { DecoyCalculator } from './components/DecoyCalculator';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';

export default function App() {
  // Handle /auth/callback route or oauth redirect with tokens in hash
  if (
    window.location.pathname.includes('/auth/callback') ||
    window.location.hash.includes('access_token=')
  ) {
    return <AuthCallback />;
  }

  const [activeTab, setActiveTab] = useState<TabType>('write');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isStealthUnlocked, setIsStealthUnlocked] = useState<boolean>(false);
  const [isPlusModalOpen, setIsPlusModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Particle state
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [activeRitual, setActiveRitual] = useState<ReleaseRitual>(settings.releaseRitual || 'dust');

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    subMessage?: string;
    type?: 'success' | 'warning' | 'info';
  } | null>(null);

  // Initial load & automatic expired cleanup
  useEffect(() => {
    const loaded = getStoredThoughts();
    setThoughts(loaded);

    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
    setActiveRitual(loadedSettings.releaseRitual || 'dust');

    if (loadedSettings.securityLockEnabled) {
      setIsLocked(true);
    }

    // Initialize ambient audio if enabled
    if (loadedSettings.ambientSoundscape && loadedSettings.ambientSoundscape !== 'off') {
      soundEffects.setAmbientSoundscape(loadedSettings.ambientSoundscape, loadedSettings.ambientVolume);
    }

    // Interval to clean up expired thoughts in state
    const interval = setInterval(() => {
      const now = Date.now();
      setThoughts((prev) => {
        const remaining = prev.filter((t) => t.isSaved || t.expiresAt > now);
        if (remaining.length !== prev.length) {
          saveThoughts(remaining);
        }
        return remaining;
      });
    }, 15000);

    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      setUser(updatedUser);
      if (updatedUser?.isPlusMember) {
        setSettings((prev) => {
          const next = { ...prev, isPlusMember: true, plusTier: updatedUser.plusTier || 'lifetime' };
          saveSettings(next);
          return next;
        });
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const showToast = (message: string, subMessage?: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);

    if (newSettings.releaseRitual) {
      setActiveRitual(newSettings.releaseRitual);
    }
  };

  const handleTestRitual = (ritual: ReleaseRitual) => {
    setActiveRitual(ritual);
    setParticleTrigger(true);
  };

  const handleReleaseThought = (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string,
    ritual?: ReleaseRitual
  ) => {
    const fadingCount = thoughts.filter((t) => !t.isSaved).length;
    if (!settings.isPlusMember && fadingCount >= 5) {
      showToast('Fading Limit Reached (5/5)', 'Free tier allows up to 5 active fading thoughts. Upgrade to Plus for unlimited thoughts.');
      setIsPlusModalOpen(true);
      return;
    }

    const expiresAt = calculateExpiryTime(duration, customHours);

    // Auto extract basic hashtags if any exist in text
    const extractedTags = Array.from(content.matchAll(/#(\w+)/g)).map((m) => m[1]);

    const newThought: Thought = {
      id: `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content,
      createdAt: Date.now(),
      expiresAt,
      duration,
      customHours,
      isSaved: false,
      tags: extractedTags.length > 0 ? extractedTags : undefined,
      releasedAt: Date.now(),
      moodEmoji,
    };

    const updated = [newThought, ...thoughts];
    setThoughts(updated);
    saveThoughts(updated);

    // Trigger particle dissolve animation
    if (ritual) {
      setActiveRitual(ritual);
    }
    setParticleTrigger(true);

    // Duration label for toast
    const durationLabelMap: Record<PurgeDuration, string> = {
      '10m': '10 Minutes',
      '1h': '1 Hour',
      '3h': '3 Hours',
      '24h': '24 Hours',
      '7d': '7 Days',
      '30d': '30 Days',
      'custom': `${customHours || 12} Hours`,
    };

    showToast(
      '✓ Thought Released',
      `Your thought will disappear in ${durationLabelMap[duration]}.`
    );
  };

  const handleEmptyRelease = () => {
    showToast('Nothing to release', 'Type your thoughts first before letting go.', 'warning');
  };

  const handleDeleteThought = (id: string) => {
    const updated = thoughts.filter((t) => t.id !== id);
    setThoughts(updated);
    saveThoughts(updated);
    showToast('Thought Purged', 'Permanently removed from your canvas.');
  };

  const handleSaveForever = (id: string) => {
    const keptCount = thoughts.filter((t) => t.isSaved).length;
    if (!settings.isPlusMember && keptCount >= 10) {
      showToast('Kept Limit Reached (10/10)', 'Free tier allows keeping up to 10 thoughts. Upgrade to Plus for unlimited kept thoughts.');
      setIsPlusModalOpen(true);
      return;
    }

    const updated = thoughts.map((t) => {
      if (t.id === id) {
        return { ...t, isSaved: true };
      }
      return t;
    });
    setThoughts(updated);
    saveThoughts(updated);
    showToast('Saved to Permanent Vault', 'This thought will never auto-purge.');
  };

  const handleUnsaveToTimeline = (id: string) => {
    const fadingCount = thoughts.filter((t) => !t.isSaved).length;
    if (!settings.isPlusMember && fadingCount >= 5) {
      showToast('Fading Limit Reached (5/5)', 'Free tier allows up to 5 active fading thoughts. Upgrade to Plus for unlimited thoughts.');
      setIsPlusModalOpen(true);
      return;
    }

    const updated = thoughts.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          isSaved: false,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24, // Reset to 24h timeline
        };
      }
      return t;
    });
    setThoughts(updated);
    saveThoughts(updated);
    showToast('Returned to Timeline', 'Thought will purge in 24 hours.');
  };

  const handleExportData = () => {
    const savedOnly = thoughts.filter((t) => t.isSaved);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedOnly, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `undo_saved_thoughts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export Complete', `${savedOnly.length} saved thoughts exported to JSON file.`);
  };

  const handleClearAll = () => {
    const onlySaved = thoughts.filter((t) => t.isSaved);
    setThoughts(onlySaved);
    saveThoughts(onlySaved);
    showToast('Canvas Cleared', 'All temporary thoughts have been purged.');
  };

  const activeExpiringCount = thoughts.filter((t) => !t.isSaved).length;
  const activeSavedCount = thoughts.filter((t) => t.isSaved).length;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'write':
        return { title: 'Undo', subtitle: 'Write it. Let it go.' };
      case 'timeline':
        return { title: 'Fading', subtitle: 'Swipe left to delete · Swipe right to keep' };
      case 'saved':
        return { title: 'Kept', subtitle: 'Thoughts you chose to keep, always.' };
      case 'settings':
        return { title: 'Preferences', subtitle: 'Keep it silent. Keep it private.' };
    }
  };

  // If stealth mode is active and not unlocked, show Decoy Calculator
  if (settings.stealthDisguise && !isStealthUnlocked) {
    return (
      <div className={`relative min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-style-${settings.fontStyle}`}>
        <AmbientBackground theme={settings.themePalette} />
        <DecoyCalculator
          correctPin={settings.stealthPin || '1234'}
          onUnlock={() => setIsStealthUnlocked(true)}
          onExitStealth={() => handleUpdateSettings({ stealthDisguise: false })}
        />
      </div>
    );
  }


  return (
    <div className={`theme-${settings.themePalette} font-style-${settings.fontStyle} relative min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] flex justify-center overflow-x-clip antialiased`}>
      {/* Soft Ambient Floating Background */}
      <AmbientBackground theme={settings.themePalette} />

      {/* Particle Dissolve Explosion Effect (5 Rituals) */}
      <ParticleCanvas
        trigger={particleTrigger}
        ritual={activeRitual}
        onComplete={() => setParticleTrigger(false)}
      />

      {/* Floating Toast Notification */}
      <Toast
        message={toast?.message || null}
        subMessage={toast?.subMessage}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Biometric Security Lock Overlay */}
      <SecurityLock
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
      />

      {/* Undo Plus Perks Hub Modal */}
      <PlusModal
        isOpen={isPlusModalOpen}
        onClose={() => setIsPlusModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onTestRitual={handleTestRitual}
        onShowToast={showToast}
      />

      {/* Google Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        user={user}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={setUser}
        onShowToast={showToast}
      />

      {/* Mobile Application Frame Container */}
      <main className="relative z-10 w-full max-w-md min-h-screen px-4 pt-2 flex flex-col justify-start">
        {/* Top Header for Active View */}
        <Header
          key={activeTab}
          title={getHeaderInfo().title}
          subtitle={getHeaderInfo().subtitle}
          user={user}
          onOpenPlusModal={() => setIsPlusModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic View Views */}
        <div className="flex-1 w-full mt-1">
          <AnimatePresence mode="wait">
            {activeTab === 'write' && (
              <motion.div
                key="write"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full pb-28 pt-2"
              >
                <WriteCanvas
                  onRelease={handleReleaseThought}
                  onEmptyRelease={handleEmptyRelease}
                  defaultTimer={settings.defaultTimer}
                  settings={settings}
                  onOpenPlusModal={() => setIsPlusModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <TimelineView
                  thoughts={thoughts}
                  onDelete={handleDeleteThought}
                  onSaveForever={handleSaveForever}
                  onNavigateToWrite={() => setActiveTab('write')}
                  onShowToast={showToast}
                />
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SavedView
                  thoughts={thoughts}
                  onDeletePermanent={handleDeleteThought}
                  onUnsaveToTimeline={handleUnsaveToTimeline}
                  onShowToast={(msg) => showToast(msg)}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SettingsView
                  settings={settings}
                  thoughts={thoughts}
                  user={user}
                  onUpdateSettings={handleUpdateSettings}
                  onExportData={handleExportData}
                  onClearAll={handleClearAll}
                  onShowToast={(msg, sub) => showToast(msg, sub)}
                  onTestRitual={handleTestRitual}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Bottom Navigation Dock */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          timelineCount={activeExpiringCount}
          savedCount={activeSavedCount}
        />
      </main>
    </div>
  );
}


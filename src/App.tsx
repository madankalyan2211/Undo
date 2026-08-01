/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, Thought, AppSettings, PurgeDuration } from './types';
import {
  getStoredThoughts,
  saveThoughts,
  getStoredSettings,
  saveSettings,
  calculateExpiryTime,
} from './utils/storage';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('write');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Particle state
  const [particleTrigger, setParticleTrigger] = useState(false);

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
    if (loadedSettings.securityLockEnabled) {
      setIsLocked(true);
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

    return () => clearInterval(interval);
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
  };

  const handleReleaseThought = (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string
  ) => {
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
    setParticleTrigger(true);

    // Duration label for toast
    const durationLabelMap: Record<PurgeDuration, string> = {
      '1h': '1 Hour',
      '24h': '24 Hours',
      '7d': '7 Days',
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
    showToast('Restored to Timeline', 'Will auto-expire in 24 Hours.');
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

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex justify-center font-sans overflow-x-clip antialiased">
      {/* Soft Ambient Floating Background */}
      <AmbientBackground />

      {/* Particle Dissolve Explosion Effect */}
      <ParticleCanvas
        trigger={particleTrigger}
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

      {/* Mobile Application Frame Container */}
      <main className="relative z-10 w-full max-w-md min-h-screen px-4 pt-2 flex flex-col justify-start">
        {/* Top Header for Active View */}
        <Header
          key={activeTab}
          title={getHeaderInfo().title}
          subtitle={getHeaderInfo().subtitle}
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
                  onUpdateSettings={handleUpdateSettings}
                  onExportData={handleExportData}
                  onClearAll={handleClearAll}
                  onShowToast={(msg) => showToast(msg)}
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

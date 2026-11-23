import React, { useEffect, useState } from 'react';
import { AppSettings, PurgeDuration, ReleaseRitual, TabType, Thought } from './types';
import { calculateExpiryTime, getStoredSettings, getStoredThoughts, saveSettings, saveThoughts } from './utils/storage';
import { soundEffects } from './utils/audio';
import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { WriteCanvas } from './components/WriteCanvas';
import { TimelineView } from './components/TimelineView';
import { SavedView } from './components/SavedView';
import { MobileSettingsView } from './components/MobileSettingsView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileTodosView } from './components/MobileTodosView';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Toast } from './components/Toast';
import { SecurityLock } from './components/SecurityLock';
import { DecoyCalculator } from './components/DecoyCalculator';

const withoutAsmrSettings = (settings: AppSettings): AppSettings => ({
  ...settings,
  ambientSoundscape: 'off',
  ambientVolume: 0,
  typingSoundPack: 'classic',
});

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<TabType>('write');
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => withoutAsmrSettings(getStoredSettings()));
  const [isLocked, setIsLocked] = useState(false);
  const [isStealthUnlocked, setIsStealthUnlocked] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [activeRitual, setActiveRitual] = useState<ReleaseRitual>(settings.releaseRitual || 'dust');
  const [toast, setToast] = useState<{ message: string; subMessage?: string; type?: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    const loadedSettings = withoutAsmrSettings(getStoredSettings());
    const loadedThoughts = getStoredThoughts();
    setThoughts(loadedThoughts);
    setSettings(loadedSettings);
    setActiveRitual(loadedSettings.releaseRitual || 'dust');
    setIsLocked(loadedSettings.securityLockEnabled);
    saveSettings(loadedSettings);
    soundEffects.setSoundEnabled(loadedSettings.soundEnabled !== false);

    const interval = setInterval(() => {
      const now = Date.now();
      setThoughts((previous) => {
        const remaining = previous.filter((thought) => thought.isSaved || thought.expiresAt > now);
        if (remaining.length !== previous.length) saveThoughts(remaining);
        return remaining;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, subMessage?: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, subMessage, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    const next = withoutAsmrSettings({ ...settings, ...patch });
    setSettings(next);
    saveSettings(next);
    if (patch.releaseRitual) setActiveRitual(patch.releaseRitual);
    if (patch.soundEnabled !== undefined) soundEffects.setSoundEnabled(patch.soundEnabled);
  };

  const handleRelease = (content: string, duration: PurgeDuration, customHours?: number, moodEmoji?: string, ritual?: ReleaseRitual) => {
    const expiresAt = calculateExpiryTime(duration, customHours);
    const tags = Array.from(content.matchAll(/#(\w+)/g)).map((match) => match[1]);
    const thought: Thought = {
      id: `th-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      createdAt: Date.now(),
      expiresAt,
      duration,
      customHours,
      isSaved: false,
      tags: tags.length ? tags : undefined,
      releasedAt: Date.now(),
      moodEmoji,
      ritualUsed: ritual,
    };
    setThoughts((previous) => {
      const next = [thought, ...previous];
      saveThoughts(next);
      return next;
    });
    if (ritual) setActiveRitual(ritual);
    setParticleTrigger(true);
    if (!settings.retrievalGracePeriodEnabled) {
      showToast('✓ Thought Released', `Your thought will disappear in ${duration}.`);
    }
  };

  const deleteThought = (id: string) => {
    setThoughts((previous) => {
      const next = previous.filter((thought) => thought.id !== id);
      saveThoughts(next);
      return next;
    });
    showToast('Thought Purged', 'Permanently removed from your canvas.');
  };

  const saveForever = (id: string) => {
    setThoughts((previous) => {
      const next = previous.map((thought) => thought.id === id ? { ...thought, isSaved: true } : thought);
      saveThoughts(next);
      return next;
    });
    showToast('Saved to Permanent Vault', 'This thought will never auto-purge.');
  };

  const unsaveToTimeline = (id: string) => {
    setThoughts((previous) => {
      const next = previous.map((thought) => thought.id === id
        ? { ...thought, isSaved: false, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }
        : thought);
      saveThoughts(next);
      return next;
    });
    showToast('Returned to Timeline', 'Thought will purge in 24 hours.');
  };

  const exportData = () => {
    const saved = thoughts.filter((thought) => thought.isSaved);
    const data = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = `undo_saved_thoughts_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Export Complete', `${saved.length} saved thoughts exported.`);
  };

  const clearTemporary = () => {
    const kept = thoughts.filter((thought) => thought.isSaved);
    setThoughts(kept);
    saveThoughts(kept);
    showToast('Canvas Cleared', 'Temporary thoughts have been purged.');
  };

  if (settings.stealthDisguise && !isStealthUnlocked) {
    return (
      <div className={`relative min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-style-${settings.fontStyle}`}>
        <AmbientBackground theme={settings.themePalette} showTexture={false} />
        <DecoyCalculator correctPin={settings.stealthPin || '1234'} onUnlock={() => setIsStealthUnlocked(true)} onExitStealth={() => updateSettings({ stealthDisguise: false })} />
      </div>
    );
  }

  const titles: Record<TabType, { title: string; subtitle: string }> = {
    write: { title: 'Undo', subtitle: 'Write it. Let it go.' },
    todos: { title: 'Tasks', subtitle: 'Small steps, gently.' },
    timeline: { title: 'Fading', subtitle: 'Swipe left to delete · Swipe right to keep' },
    saved: { title: 'Kept', subtitle: 'Thoughts you chose to keep, always.' },
    settings: { title: 'Preferences', subtitle: 'Keep it silent. Keep it private.' },
  };
  const current = titles[activeTab];

  return (
    <div className={`theme-${settings.themePalette} font-style-${settings.fontStyle} relative min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] flex justify-center overflow-x-clip antialiased`}>
      <AmbientBackground theme={settings.themePalette} showTexture={false} />
      <ParticleCanvas trigger={particleTrigger} ritual={activeRitual} onComplete={() => setParticleTrigger(false)} />
      <Toast message={toast?.message || null} subMessage={toast?.subMessage} type={toast?.type} onClose={() => setToast(null)} />
      <SecurityLock isLocked={isLocked} onUnlock={() => setIsLocked(false)} />

      <main className="relative z-10 w-full max-w-md min-h-screen px-4 pt-2 flex flex-col justify-start">
        <Header title={current.title} subtitle={current.subtitle} />
        <div className="flex-1 w-full mt-1">
          {activeTab === 'write' && <div className="w-full pb-28 pt-2"><WriteCanvas onRelease={handleRelease} onEmptyRelease={() => showToast('Nothing to release', 'Type your thoughts first.', 'warning')} defaultTimer={settings.defaultTimer} settings={settings} /></div>}
          {activeTab === 'todos' && <div className="w-full"><MobileTodosView onShowToast={(message) => showToast(message)} /></div>}
          {activeTab === 'timeline' && <div className="w-full"><TimelineView thoughts={thoughts} onDelete={deleteThought} onSaveForever={saveForever} onNavigateToWrite={() => setActiveTab('write')} onShowToast={showToast} /></div>}
          {activeTab === 'saved' && <div className="w-full"><SavedView thoughts={thoughts} onDeletePermanent={deleteThought} onUnsaveToTimeline={unsaveToTimeline} onShowToast={showToast} /></div>}
          {activeTab === 'settings' && <div className="w-full"><MobileSettingsView settings={settings} thoughts={thoughts} onUpdateSettings={updateSettings} onExportData={exportData} onClearAll={clearTemporary} onShowToast={showToast} /></div>}
        </div>
        <MobileBottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </main>
    </div>
  );
}


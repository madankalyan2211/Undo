import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Fingerprint,
  Shield,
  Clock,
  Vibrate,
  Moon,
  Download,
  Cloud,
  Info,
  Sparkles,
  Flame,
  Music,
  Palette,
  EyeOff,
  Trash2,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { AppSettings, PurgeDuration, Thought, ReleaseRitual, UserProfile } from '../types';
import { soundEffects } from '../utils/audio';
import { EmotionalInsightCard } from './EmotionalInsightCard';
import { PlusModal } from './PlusModal';

interface SettingsViewProps {
  settings: AppSettings;
  thoughts: Thought[];
  user?: UserProfile | null;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onClearAll: () => void;
  onShowToast: (msg: string, sub?: string) => void;
  onTestRitual?: (ritual: ReleaseRitual) => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  thoughts,
  user,
  onUpdateSettings,
  onExportData,
  onClearAll,
  onShowToast,
  onTestRitual,
  onOpenAuthModal,
}) => {
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const toggleSetting = (key: keyof AppSettings) => {
    soundEffects.playClickSound();
    onUpdateSettings({ [key]: !settings[key] });
  };

  const cycleDefaultTimer = () => {
    soundEffects.playClickSound();
    const sequence: PurgeDuration[] = ['10m', '1h', '3h', '24h', '7d', '30d'];
    const currentIndex = sequence.indexOf(settings.defaultTimer);
    const nextTimer = sequence[(currentIndex + 1) % sequence.length];
    onUpdateSettings({ defaultTimer: nextTimer });
    const labels: Record<PurgeDuration, string> = {
      '10m': '10 Minutes',
      '1h': '1 Hour',
      '3h': '3 Hours',
      '24h': '24 Hours',
      '7d': '7 Days',
      '30d': '30 Days',
      'custom': 'Custom',
    };
    onShowToast(`Default timer set to ${labels[nextTimer]}`);
  };

  const handlePanicDuressWipe = () => {
    soundEffects.playDeleteSound();
    onClearAll();
    setShowPanicConfirm(false);
    onShowToast('Panic Wipe Executed', 'All thoughts permanently purged.');
  };

  const handleExportBurnBook = () => {
    soundEffects.playClickSound();
    const saved = thoughts.filter((t) => t.isSaved);
    if (saved.length === 0) {
      onShowToast('No Kept Thoughts', 'Save thoughts to export a Burn Book.');
      return;
    }

    const formattedText = `# UNDO — THE KEPT REFLECTIONS
Exported on ${new Date().toLocaleDateString()}
Total Reflections: ${saved.length}

` + saved.map((t, idx) => `
---
[${idx + 1}] ${new Date(t.createdAt).toLocaleDateString()} ${t.moodEmoji || ''}
${t.content}
${t.tags ? `Tags: ${t.tags.join(', ')}` : ''}
`).join('\n');

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(formattedText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `undo_burn_book_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Burn Book Exported', `${saved.length} reflections exported.`);
  };

  return (
    <>
      <PlusModal
        isOpen={isPlusModalOpen}
        onClose={() => setIsPlusModalOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onTestRitual={(r) => onTestRitual?.(r)}
        onShowToast={onShowToast}
      />

      <div className="relative w-full pb-28 pt-2">
        <div className="flex flex-col gap-6 select-none">
          {/* SECTION 0: UNDO PLUS MEMBERSHIP HERO CARD */}
          <div
            onClick={() => {
              soundEffects.playClickSound();
              setIsPlusModalOpen(true);
            }}
            className="group rounded-[32px] bg-gradient-to-r from-amber-500/15 via-white/[0.06] to-purple-500/15 border border-amber-400/30 p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">Undo Plus</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-[9px] font-bold text-amber-300 uppercase">
                    {settings.isPlusMember ? 'ACTIVE' : 'PREMIUM'}
                  </span>
                </div>
                <span className="text-xs text-white/60 mt-0.5">
                  {settings.isPlusMember
                    ? `${settings.plusTier ? settings.plusTier.toUpperCase() : 'LIFETIME'} · All features unlocked`
                    : 'Rituals · Soundscapes · Stealth · Themes'}
                </span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider group-hover:scale-105 transition-transform shrink-0">
              {settings.isPlusMember ? 'Perks ✦' : 'Upgrade ✦'}
            </div>
          </div>

          {/* SECTION 0.5: WRITER PROFILE CARD */}
          {onOpenAuthModal && (
            <div
              onClick={() => {
                soundEffects.playClickSound();
                onOpenAuthModal();
              }}
              className="rounded-[28px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0 shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '✦'}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {user ? user.name : 'Mindful Writer'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-[9px] font-bold text-emerald-400 uppercase shrink-0">
                      ACTIVE
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50 truncate mt-0.5">
                    {user ? user.email : 'writer@undo.app'}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider shrink-0 hover:bg-white/20 transition-colors">
                Profile
              </div>
            </div>
          )}

          {/* SECTION 1: EMOTIONAL INSIGHTS & WEATHER */}
          <EmotionalInsightCard thoughts={thoughts} onShowToast={onShowToast} />

          {/* SECTION 2: PLUS PERKS QUICK CONTROLS */}
          <div className="flex flex-col gap-2.5">
            <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold tracking-[0.12em] text-amber-300/80 uppercase">
                PLUS RITUALS & SENSES
              </span>
            </div>

            <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
              {/* Release Ritual */}
              <div
                onClick={() => setIsPlusModalOpen(true)}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Release Ritual
                    </span>
                    <span className="text-xs text-white/60">
                      Current: {settings.releaseRitual.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white uppercase">
                  {settings.releaseRitual}
                </span>
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Ambient Soundscape */}
              <div
                onClick={() => setIsPlusModalOpen(true)}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Ambient Audio
                    </span>
                    <span className="text-xs text-white/60">
                      {settings.ambientSoundscape === 'off' ? 'Off' : `Playing: ${settings.ambientSoundscape}`}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white uppercase">
                  {settings.ambientSoundscape}
                </span>
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Themes & Typography */}
              <div
                onClick={() => setIsPlusModalOpen(true)}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Theme & Typography
                    </span>
                    <span className="text-xs text-white/60">
                      {settings.themePalette} · {settings.fontStyle}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white uppercase">
                  Customize
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRIVACY & DISGUISE */}
          <div className="flex flex-col gap-2.5">
            <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
                PRIVACY & DISGUISE
              </span>
            </div>

            <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
              {/* Biometrics */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Face ID / Biometric Lock
                    </span>
                    <span className="text-xs text-white/60">
                      Require unlock on app launch
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSetting('securityLockEnabled')}
                  type="button"
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                    settings.securityLockEnabled ? 'bg-white' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#050505] transition-transform duration-200 ${
                      settings.securityLockEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Stealth Calculator Disguise */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Stealth Disguise Mode
                    </span>
                    <span className="text-xs text-white/60">
                      Disguises Undo as a calculator
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = !settings.stealthDisguise;
                    onUpdateSettings({ stealthDisguise: next });
                    onShowToast(next ? 'Stealth Mode Activated' : 'Stealth Mode Disabled');
                  }}
                  type="button"
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                    settings.stealthDisguise ? 'bg-amber-400' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#050505] transition-transform duration-200 ${
                      settings.stealthDisguise ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Panic Duress Wipe */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Panic Duress Wipe
                    </span>
                    <span className="text-xs text-white/60">
                      Instantly purge all temporary thoughts
                    </span>
                  </div>
                </div>

                {showPanicConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPanicConfirm(false)}
                      className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePanicDuressWipe}
                      className="px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-[10px] uppercase"
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPanicConfirm(true)}
                    type="button"
                    className="px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                  >
                    Wipe
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: DEFAULTS */}
          <div className="flex flex-col gap-2.5">
            <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
                DEFAULTS
              </span>
            </div>

            <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
              {/* Default Timer */}
              <div
                onClick={cycleDefaultTimer}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Default Timer
                    </span>
                    <span className="text-xs text-white/60">
                      Tap to cycle durations
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest text-white uppercase">
                  {settings.defaultTimer}
                </div>
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Haptics */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                    <Vibrate className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Haptics
                    </span>
                    <span className="text-xs text-white/60">
                      Tactile vibrational feedback
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleSetting('hapticsEnabled')}
                  type="button"
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                    settings.hapticsEnabled ? 'bg-emerald-400' : 'bg-white/15'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#050505] transition-transform duration-200 ${
                      settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: DATA & EXPORT */}
          <div className="flex flex-col gap-2.5">
            <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
                EXPORT & ARCHIVE
              </span>
            </div>

            <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
              {/* Burn Book Markdown Export */}
              <div
                onClick={handleExportBurnBook}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Export "The Burn Book"
                    </span>
                    <span className="text-xs text-white/60">
                      Formatted reflection journal for printing/archiving
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>

              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* JSON Raw Export */}
              <div
                onClick={() => {
                  soundEffects.playClickSound();
                  onExportData();
                }}
                className="flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                      Export JSON Backup
                    </span>
                    <span className="text-xs text-white/60">
                      Raw JSON export of kept thoughts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: ABOUT */}
          <div className="flex flex-col gap-2.5">
            <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
                ABOUT
              </span>
            </div>

            <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                    Undo Plus
                  </span>
                  <span className="text-xs text-white/60">
                    Write it. Let it go. · v2.0 Plus Edition
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-300">✦ Premium</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


import React from 'react';
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
} from 'lucide-react';
import { AppSettings, PurgeDuration, Thought } from '../types';
import { soundEffects } from '../utils/audio';
import { EmotionalInsightCard } from './EmotionalInsightCard';

interface SettingsViewProps {
  settings: AppSettings;
  thoughts: Thought[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onClearAll: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  thoughts,
  onUpdateSettings,
  onExportData,
  onClearAll,
  onShowToast,
}) => {
  const toggleSetting = (key: keyof AppSettings) => {
    soundEffects.playClickSound();
    onUpdateSettings({ [key]: !settings[key] });
  };

  const cycleDefaultTimer = () => {
    soundEffects.playClickSound();
    const sequence: PurgeDuration[] = ['1h', '24h', '7d'];
    const currentIndex = sequence.indexOf(settings.defaultTimer);
    const nextTimer = sequence[(currentIndex + 1) % sequence.length];
    onUpdateSettings({ defaultTimer: nextTimer });
    const labels: Record<string, string> = {
      '1h': '1 Hour',
      '24h': '24 Hours',
      '7d': '7 Days',
    };
    onShowToast(`Default timer set to ${labels[nextTimer]}`);
  };

  return (
    <div className="relative w-full pb-28 pt-2">
      <div className="flex flex-col gap-6 select-none">
        {/* SECTION 0: EMOTIONAL INSIGHTS */}
        <EmotionalInsightCard thoughts={thoughts} onShowToast={onShowToast} />

        {/* SECTION 1: PRIVACY */}
        <div className="flex flex-col gap-2.5">
          {/* Section Pill Badge */}
          <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
              PRIVACY
            </span>
          </div>

          {/* Card Box */}
          <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
            {/* Row 1: Face ID / Fingerprint */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                    Face ID / Fingerprint Lock
                  </span>
                  <span className="text-xs text-white/60">
                    Require biometrics to open Undo
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

            {/* Row 2: Privacy */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                    Privacy
                  </span>
                  <span className="text-xs text-white/60">
                    All thoughts are stored only on this device.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DEFAULTS */}
        <div className="flex flex-col gap-2.5">
          {/* Section Pill Badge */}
          <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
              DEFAULTS
            </span>
          </div>

          <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
            {/* Row 1: Default Timer */}
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
                    {settings.defaultTimer === '1h' ? '1 Hour' : settings.defaultTimer === '7d' ? '7 Days' : '24 Hours'}
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest text-white uppercase">
                {settings.defaultTimer === '1h' ? '1 HOUR' : settings.defaultTimer === '7d' ? '7 DAYS' : '24 HOURS'}
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/[0.06]" />

            {/* Row 2: Haptics */}
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
                    Gentle feedback on interactions
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleSetting('hapticsEnabled')}
                type="button"
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                  settings.hapticsEnabled ? 'bg-[#00D2B4]' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="w-full h-[1px] bg-white/[0.06]" />

            {/* Row 3: Dark Theme */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                    Dark Theme
                  </span>
                  <span className="text-xs text-white/60">
                    Always on. This is Undo.
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest text-white uppercase">
                ALWAYS
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA */}
        <div className="flex flex-col gap-2.5">
          {/* Section Pill Badge */}
          <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
              DATA
            </span>
          </div>

          <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col gap-5">
            {/* Export Saved Notes */}
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
                    Export Saved Notes
                  </span>
                  <span className="text-xs text-white/60">
                    Copy your kept thoughts to clipboard
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/[0.06]" />

            {/* Cloud Backup */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                    Cloud Backup
                  </span>
                  <span className="text-xs text-white/60">
                    Off — everything stays on device
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-widest text-white uppercase">
                OFF
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ABOUT */}
        <div className="flex flex-col gap-2.5">
          {/* Section Pill Badge */}
          <div className="self-start px-3.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase">
              ABOUT
            </span>
          </div>

          <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold text-white leading-tight mb-0.5">
                Undo
              </span>
              <span className="text-xs text-white/60">
                Write it. Let it go. · v1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppSettings, FontStyle, PurgeDuration, ReleaseRitual, ThemePalette, Thought } from '../types';

interface MobileSettingsViewProps {
  settings: AppSettings;
  thoughts: Thought[];
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onClearAll: () => void;
  onShowToast: (message: string, subMessage?: string) => void;
}

const RITUALS: { id: ReleaseRitual; label: string; icon: string; detail: string }[] = [
  { id: 'dust', label: 'Classic Dust', icon: '✨', detail: 'Dissolves into celestial dust' },
  { id: 'fire', label: 'Burn to Ash', icon: '🔥', detail: 'Fades into glowing embers' },
  { id: 'ocean', label: 'Deep Ocean Sink', icon: '🌊', detail: 'Sinks into a calm abyss' },
  { id: 'supernova', label: 'Supernova Burst', icon: '💥', detail: 'Breaks into bright stardust' },
  { id: 'crumple', label: 'Origami Crumple', icon: '📄', detail: 'Crushes the thought and lets it go' },
  { id: 'shatter', label: 'Glass Shatter', icon: '🫨', detail: 'Breaks into crystals' },
];

const TIMERS: PurgeDuration[] = ['10m', '1h', '3h', '24h', '7d', '30d'];
const THEMES: { id: ThemePalette; label: string }[] = [
  { id: 'oled', label: 'OLED' }, { id: 'obsidian', label: 'Obsidian' },
  { id: 'matcha', label: 'Matcha' }, { id: 'lavender', label: 'Lavender' },
  { id: 'indigo', label: 'Indigo' }, { id: 'cyberpunk', label: 'Cyberpunk' },
];
const FONTS: { id: FontStyle; label: string }[] = [
  { id: 'sans', label: 'Sans' }, { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' }, { id: 'typewriter', label: 'Typewriter' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-2.5">
    <h2 className="self-start px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] font-bold tracking-[0.12em] text-white/75 uppercase">
      {title}
    </h2>
    <div className="rounded-[28px] bg-[rgba(255,255,255,0.065)] backdrop-blur-[32px] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.16)] p-4 flex flex-col gap-3">
      {children}
    </div>
  </section>
);

const Toggle: React.FC<{ label: string; detail: string; checked: boolean; onChange: () => void }> = ({ label, detail, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <div className="min-w-0">
      <div className="text-sm font-bold text-white">{label}</div>
      <div className="text-xs text-white/55 mt-0.5">{detail}</div>
    </div>
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className={`w-12 h-6 rounded-full p-0.5 shrink-0 transition-colors ${checked ? 'bg-white' : 'bg-white/15'}`}>
      <span className={`block w-5 h-5 rounded-full bg-[#050505] transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);

export const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({
  settings, thoughts, onUpdateSettings, onExportData, onClearAll, onShowToast,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeSection, setActiveSection] = useState('release');
  const cycleTimer = () => {
    const next = TIMERS[(TIMERS.indexOf(settings.defaultTimer) + 1) % TIMERS.length];
    onUpdateSettings({ defaultTimer: next });
    onShowToast(`Default timer set to ${next}`);
  };

  return (
    <div className="w-full pb-28 pt-2 flex flex-col gap-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none" role="tablist" aria-label="Preference sections">
        {[
          { id: 'release', label: 'Release' }, { id: 'privacy', label: 'Privacy' },
          { id: 'defaults', label: 'Defaults' }, { id: 'appearance', label: 'Appearance' }, { id: 'data', label: 'Data' },
        ].map((section) => <button key={section.id} type="button" role="tab" aria-selected={activeSection === section.id} onClick={() => setActiveSection(section.id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${activeSection === section.id ? 'border-white bg-white text-[#11131e] shadow-[0_2px_14px_rgba(255,255,255,0.12)]' : 'border-white/10 bg-white/[0.045] text-white/65 backdrop-blur-xl'}`}>{section.label}</button>)}
      </div>

      {activeSection === 'release' && <Section title="Release action">
        <p className="text-xs text-white/55">Choose which action appears on the writing page.</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none" role="group" aria-label="Writing page release action">
          {[
            { id: 'release', label: 'Release', icon: '✨' },
            { id: 'breathe', label: 'Breathe', icon: '🌬️' },
            { id: 'shatter', label: 'Shatter', icon: '🫨' },
          ].map((action) => {
            const selected = (settings.releaseAction || 'release') === action.id;
            return <button key={action.id} type="button" aria-pressed={selected} onClick={() => onUpdateSettings({ releaseAction: action.id as 'release' | 'breathe' | 'shatter' })} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold backdrop-blur-xl transition-colors ${selected ? 'border-white/70 bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]' : 'border-white/10 bg-white/[0.045] text-white/65'}`}>
              <span className="mr-1.5" aria-hidden="true">{action.icon}</span>{action.label}
            </button>;
          })}
        </div>
        <div className="h-px bg-white/[0.06]" />
        <p className="text-xs font-bold tracking-wide text-white/60 uppercase">Release effect</p>
        <p className="text-xs text-white/55">Choose the visual effect used by Release and Breathe.</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none" role="group" aria-label="Release style">
          {RITUALS.map((ritual) => {
            const selected = settings.releaseRitual === ritual.id;
            return <button key={ritual.id} type="button" aria-pressed={selected} onClick={() => onUpdateSettings({ releaseRitual: ritual.id })} className={`shrink-0 min-w-[120px] rounded-2xl border px-3 py-3 text-left backdrop-blur-xl transition-colors ${selected ? 'border-white/70 bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]' : 'border-white/10 bg-white/[0.045] text-white/65'}`}>
              <span className="block text-xl">{ritual.icon}</span><span className="mt-1 block text-xs font-bold">{ritual.label}</span>
            </button>;
          })}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><span>{RITUALS.find((ritual) => ritual.id === settings.releaseRitual)?.icon}</span>{RITUALS.find((ritual) => ritual.id === settings.releaseRitual)?.label}<span className="ml-auto text-xs text-white/55">Selected</span></div>
          <p className="mt-1 text-xs text-white/55">{RITUALS.find((ritual) => ritual.id === settings.releaseRitual)?.detail}</p>
        </div>
      </Section>}

      {activeSection === 'privacy' && <Section title="Privacy">
        <Toggle label="App lock" detail="Require device unlock when opening Undo" checked={settings.securityLockEnabled} onChange={() => onUpdateSettings({ securityLockEnabled: !settings.securityLockEnabled })} />
        <div className="h-px bg-white/[0.06]" />
        <Toggle label="Stealth calculator" detail="Open Undo as a calculator" checked={settings.stealthDisguise} onChange={() => onUpdateSettings({ stealthDisguise: !settings.stealthDisguise })} />
      </Section>}

      {activeSection === 'defaults' && <Section title="Defaults">
        <button type="button" onClick={cycleTimer} className="flex items-center justify-between gap-3 py-1 text-left">
          <span><span className="block text-sm font-bold text-white">Default timer</span><span className="block text-xs text-white/55 mt-0.5">Tap to cycle durations</span></span>
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold uppercase text-white">{settings.defaultTimer}</span>
        </button>
        <div className="h-px bg-white/[0.06]" />
        <Toggle label="Haptics" detail="Tactile feedback when releasing thoughts" checked={settings.hapticsEnabled} onChange={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })} />
        <div className="h-px bg-white/[0.06]" />
        <Toggle label="Auto purge notice" detail="Show a reminder before thoughts expire" checked={settings.autoPurgeNotice} onChange={() => onUpdateSettings({ autoPurgeNotice: !settings.autoPurgeNotice })} />
      </Section>}

      {activeSection === 'appearance' && <Section title="Appearance">
        <div className="text-xs font-bold tracking-wide text-white/60 uppercase">Theme</div>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => <button key={theme.id} type="button" onClick={() => onUpdateSettings({ themePalette: theme.id })} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${settings.themePalette === theme.id ? 'bg-white text-black border-white' : 'bg-white/[0.04] text-white border-white/10'}`}>{theme.label}</button>)}
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="text-xs font-bold tracking-wide text-white/60 uppercase">Type style</div>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((font) => <button key={font.id} type="button" onClick={() => onUpdateSettings({ fontStyle: font.id })} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${settings.fontStyle === font.id ? 'bg-white text-black border-white' : 'bg-white/[0.04] text-white border-white/10'}`}>{font.label}</button>)}
        </div>
      </Section>}

      {activeSection === 'data' && <Section title="Your data">
        <div className="flex items-center justify-between gap-3 py-1"><span className="text-sm text-white/80">{thoughts.length} thoughts stored</span><button type="button" onClick={onExportData} className="px-3 py-2 rounded-full bg-white/10 text-xs font-bold text-white">Export kept</button></div>
        <div className="h-px bg-white/[0.06]" />
        {confirmClear ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/70">Clear all temporary thoughts?</span>
            <span className="flex gap-2"><button type="button" onClick={() => setConfirmClear(false)} className="px-3 py-2 rounded-full bg-white/10 text-xs font-bold text-white">Cancel</button><button type="button" onClick={() => { onClearAll(); setConfirmClear(false); }} className="px-3 py-2 rounded-full bg-rose-500/80 text-xs font-bold text-white">Clear</button></span>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmClear(true)} className="py-1 text-left text-sm text-rose-300">Clear temporary thoughts</button>
        )}
      </Section>}
    </div>
  );
};

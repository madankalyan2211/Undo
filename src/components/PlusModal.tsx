import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Volume2,
  Lock,
  Flame,
  Music,
  Check,
  Shield,
  Palette,
  EyeOff,
  CreditCard,
} from 'lucide-react';
import {
  AppSettings,
  ReleaseRitual,
  AmbientSoundscape,
  TypingSoundPack,
  ThemePalette,
  FontStyle,
} from '../types';
import { soundEffects } from '../utils/audio';
import { PRICING_PLANS, PricingPlan, openWebRazorpayCheckout } from '../utils/razorpay';
import { supabase } from '../utils/supabase';

interface PlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestRitual?: (ritual: ReleaseRitual) => void;
  onShowToast: (msg: string, sub?: string) => void;
}

const RITUALS: { id: ReleaseRitual; name: string; desc: string; icon: string; color: string }[] = [
  { id: 'dust', name: 'Classic Dust', desc: 'Gentle white particulate dissolving', icon: '✨', color: '#FFFFFF' },
  { id: 'fire', name: 'Burn to Ash', desc: 'Rising golden embers & fiery flame sparks', icon: '🔥', color: '#FF7828' },
  { id: 'ocean', name: 'Deep Ocean Sink', desc: 'Bioluminescent ripples & water drops', icon: '🌊', color: '#2DD4BF' },
  { id: 'supernova', name: 'Supernova Burst', desc: 'Cosmic nebula blast & expanding ring', icon: '⚡', color: '#C084FC' },
  { id: 'crumple', name: 'Paper Disintegrate', desc: 'Physics-based origami void collapse', icon: '📄', color: '#E2E8F0' },
];

const SOUNDSCAPES: { id: AmbientSoundscape; name: string; icon: string }[] = [
  { id: 'off', name: 'Silent', icon: '🔇' },
  { id: 'zen432', name: '432Hz Zen Binaural', icon: '🧘' },
  { id: 'rain', name: 'Rain on Window', icon: '🌧️' },
  { id: 'breeze', name: 'Night Breeze', icon: '🌌' },
  { id: 'brown', name: 'Deep Brown Noise', icon: '🌊' },
  { id: 'stream', name: 'Forest Stream', icon: '🌿' },
];

const THEMES: { id: ThemePalette; name: string; color: string; bg: string }[] = [
  { id: 'oled', name: 'OLED Pitch', color: '#FFFFFF', bg: '#050505' },
  { id: 'obsidian', name: 'Obsidian Gold', color: '#E2B86E', bg: '#090806' },
  { id: 'matcha', name: 'Matcha Sage', color: '#9ECBA0', bg: '#060907' },
  { id: 'lavender', name: 'Twilight Lilac', color: '#C4B5FD', bg: '#08060E' },
  { id: 'indigo', name: 'Midnight Indigo', color: '#818CF8', bg: '#050711' },
  { id: 'cyberpunk', name: 'Neon Cyber', color: '#2DD4BF', bg: '#040308' },
];

const TYPING_PACKS: { id: TypingSoundPack; name: string; desc: string }[] = [
  { id: 'classic', name: 'Tactile Click', desc: 'Clean modern click' },
  { id: 'typewriter', name: 'Vintage Typewriter', desc: 'Mechanical clack & bell' },
  { id: 'mechanical', name: 'Thocky Switches', desc: 'Deep custom keyboard thock' },
  { id: 'waterdrop', name: 'Water Resonance', desc: 'Calming melodic droplets' },
  { id: 'bubble', name: 'Soft Pop', desc: 'Gentle airy bubbles' },
  { id: 'kalimba', name: 'Singing Kalimba', desc: 'Harmonic musical tines' },
];

const FONTS: { id: FontStyle; name: string; preview: string }[] = [
  { id: 'sans', name: 'Modern Sans', preview: 'Clean & minimalist' },
  { id: 'serif', name: 'Editorial Serif', preview: 'Timeless luxury' },
  { id: 'mono', name: 'Minimal Monospace', preview: 'Raw & focused' },
  { id: 'typewriter', name: 'Courier Prime', preview: 'Classic typewriter' },
];

export const PlusModal: React.FC<PlusModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestRitual,
  onShowToast,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[1]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectSoundscape = (s: AmbientSoundscape) => {
    soundEffects.playClickSound();
    onUpdateSettings({ ambientSoundscape: s });
    soundEffects.setAmbientSoundscape(s, settings.ambientVolume);
    onShowToast(s === 'off' ? 'Ambient audio silenced' : `Playing ${s.toUpperCase()} soundscape`);
  };

  const handleVolumeChange = (vol: number) => {
    onUpdateSettings({ ambientVolume: vol });
    soundEffects.setAmbientVolume(vol);
  };

  const handleRazorpayCheckout = (planToBuy?: PricingPlan, isTrial: boolean = false) => {
    const targetPlan = planToBuy || selectedPlan;
    setIsProcessing(true);
    soundEffects.playClickSound();

    openWebRazorpayCheckout(
      targetPlan,
      isTrial,
      async (paymentId, plan, trialUsed) => {
        setIsProcessing(false);
        onUpdateSettings({
          isPlusMember: true,
          plusTier: plan.id,
          razorpayPaymentId: paymentId,
          plusActivatedAt: Date.now(),
        });

        try {
          await supabase.auth.updateUser({
            data: {
              isPlusMember: true,
              plusTier: plan.id,
              razorpayPaymentId: paymentId,
              plusActivatedAt: Date.now(),
              isTrial: !!trialUsed,
            },
          });
        } catch {}

        soundEffects.playReleaseSound();
        onShowToast(
          trialUsed
            ? `⚡ 3-Day Trial Active (${plan.trialPriceDisplay})`
            : `✦ Undo Plus Unlocked (${plan.name})`,
          `Active · Payment ID: ${paymentId}`
        );
      },
      (errMsg) => {
        setIsProcessing(false);
        onShowToast('Payment Error', errMsg);
      },
      () => {
        setIsProcessing(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-[36px] sm:rounded-[36px] bg-[#111111] border border-amber-400/20 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.9)] text-white scrollbar-none"
      >
        {/* Undo Plus Hero Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-white/10 to-amber-200/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Undo Plus</h2>
                {settings.isPlusMember ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 tracking-wider uppercase">
                    ACTIVE MEMBER
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white/80 tracking-wider uppercase">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {settings.isPlusMember
                  ? `${settings.plusTier ? settings.plusTier.toUpperCase() : 'LIFETIME'} · All sensory rituals & tools unlocked`
                  : 'Unlock all rituals, soundscapes, ASMR keyboards & privacy tools'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Member Status & Test Switcher */}
        {settings.isPlusMember ? (
          <div className="mt-5 p-4 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-amber-300">✦ Active Undo Plus Member</p>
              <p className="text-xs text-white/60 mt-0.5">
                {settings.plusTier ? settings.plusTier.toUpperCase() : 'LIFETIME'} · All features unlocked
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                soundEffects.playClickSound();
                onUpdateSettings({
                  isPlusMember: false,
                  plusTier: undefined,
                  razorpayPaymentId: undefined,
                  releaseRitual: 'dust',
                  ambientSoundscape: 'off',
                  typingSoundPack: 'classic',
                  themePalette: 'oled',
                  stealthDisguise: false,
                  mindfulReframerEnabled: false,
                });
                try {
                  await supabase.auth.updateUser({
                    data: {
                      isPlusMember: false,
                      plusTier: null,
                      razorpayPaymentId: null,
                    },
                  });
                } catch {}
                onShowToast('Switched to Free Tier (Test Mode)');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-colors"
            >
              Switch to Free (Test)
            </button>
          </div>
        ) : (
          /* Razorpay Paywall & Tier Selector for Non-Members */
          <div className="mt-5 p-5 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/[0.03] to-transparent border border-amber-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Choose Your Sanctuary Plan</h3>
              <p className="text-xs text-white/50 mt-0.5">Instant activation via Razorpay (UPI, Cards, NetBanking)</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      soundEffects.playClickSound();
                    }}
                    className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                        : plan.popular
                        ? 'bg-amber-500/[0.07] border-amber-400/50 hover:bg-amber-500/10'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {plan.savings && (
                      <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase whitespace-nowrap ${
                        plan.popular
                          ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)] scale-105'
                          : 'bg-white/20 text-white/90 border border-white/20'
                      }`}>
                        {plan.savings}
                      </span>
                    )}
                    <div className="text-[10px] font-semibold text-white/70">{plan.name}</div>
                    <div className="flex items-baseline justify-center gap-1 mt-1">
                      {plan.originalPriceDisplay && (
                        <span className="text-[10px] text-white/40 line-through font-semibold">
                          {plan.originalPriceDisplay}
                        </span>
                      )}
                      <span className="text-base font-extrabold text-amber-300">
                        {plan.priceDisplay}
                      </span>
                    </div>
                    <div className="text-[9px] text-white/40">{plan.interval}</div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Plan Perks Box */}
            <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.04] border border-amber-400/20 text-left">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                  ✦ What's included in {selectedPlan.name}
                </span>
                <span className="text-[10px] text-white/50">{selectedPlan.tagline}</span>
              </div>
              <div className="space-y-1.5">
                {selectedPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedPlan.id === 'free' ? (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center mb-2">
                <div className="text-sm font-bold text-white">Current Plan: Free Basic</div>
                <p className="text-xs text-white/60 mt-1">
                  Limited to 5 thoughts in fading at a time and 10 in kept. Tap Weekly, Monthly, or Annual above to unlock unlimited thoughts and sensory rituals.
                </p>
              </div>
            ) : (
              <>
                {/* 3-Day 5% Trial Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleRazorpayCheckout(undefined, true)}
                  className="w-full relative py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-black font-extrabold text-sm tracking-wide transition-all shadow-[0_10px_25px_rgba(251,191,36,0.3)] flex flex-col items-center justify-center cursor-pointer mb-2"
                >
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-black border border-amber-400 text-amber-400 text-[8px] font-black tracking-wider uppercase">
                    5% INTRO OFFER
                  </span>
                  <div className="flex items-center gap-1.5 font-black text-sm">
                    <span>⚡ Try 3 Days for {selectedPlan.trialPriceDisplay}</span>
                    {selectedPlan.trialOriginalPriceDisplay && (
                      <span className="text-xs text-black/50 line-through font-bold">
                        {selectedPlan.trialOriginalPriceDisplay}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-black/75 font-medium">
                    Full sanctuary access · No automatic surprises
                  </span>
                </button>

                {/* Full Plan Access Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleRazorpayCheckout(undefined, false)}
                  className="w-full py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 active:scale-[0.99] text-white/85 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isProcessing ? 'Connecting...' : `✦ Unlock Full ${selectedPlan.name} (${selectedPlan.originalPriceDisplay ? `${selectedPlan.originalPriceDisplay} → ` : ''}${selectedPlan.priceDisplay})`}
                  </span>
                </button>
              </>
            )}

            <div className="text-center mt-2.5 text-[10px] text-white/40 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>256-bit Encrypted · UPI, Google Pay, Cards & NetBanking</span>
            </div>
          </div>
        )}

        {/* 1. SENSORY RELEASE RITUALS */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold tracking-wider text-amber-300/80 uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensory Release Rituals</span>
            </div>
            <span className="text-[10px] text-white/40 font-mono">5 Visual Styles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RITUALS.map((r) => {
              const isSelected = settings.releaseRitual === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    if (!settings.isPlusMember && r.id !== 'dust') {
                      handleRazorpayCheckout();
                      return;
                    }
                    soundEffects.playClickSound();
                    onUpdateSettings({ releaseRitual: r.id });
                    onShowToast(`Release ritual: ${r.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/10 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{r.icon}</span>
                      <span className="text-sm font-bold text-white">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                      {onTestRitual && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTestRitual(r.id);
                          }}
                          className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white/80 transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. AMBIENT SOUNDSCAPES */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold tracking-wider text-amber-300/80 uppercase flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Ambient Soundscapes</span>
            </div>
            {settings.ambientSoundscape !== 'off' && (
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                PLAYING
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOUNDSCAPES.map((s) => {
              const isSelected = settings.ambientSoundscape === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (!settings.isPlusMember && s.id !== 'off') {
                      handleRazorpayCheckout();
                      return;
                    }
                    handleSelectSoundscape(s.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <div className="text-xs truncate">{s.name}</div>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {settings.ambientSoundscape !== 'off' && (
            <div className="mt-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[10px] font-mono text-white/60 w-8 text-right">
                {Math.round(settings.ambientVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* 3. ASMR TYPING SOUND PACKS */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-bold tracking-wider text-amber-300/80 uppercase mb-3 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>ASMR Keyboard Sound Packs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPING_PACKS.map((p) => {
              const isSelected = settings.typingSoundPack === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (!settings.isPlusMember && p.id !== 'classic') {
                      handleRazorpayCheckout();
                      return;
                    }
                    onUpdateSettings({ typingSoundPack: p.id });
                    soundEffects.playTypingSound(p.id, 'harmony', 'h', false);
                    onShowToast(`Keyboard sound: ${p.name}`);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{p.name}</div>
                  <div className="text-[9px] opacity-60 mt-0.5 truncate">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. LUXURY THEMES */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-bold tracking-wider text-amber-300/80 uppercase mb-3 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Luxury Themes & Palettes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const isSelected = settings.themePalette === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (!settings.isPlusMember && t.id !== 'oled') {
                      handleRazorpayCheckout();
                      return;
                    }
                    soundEffects.playClickSound();
                    onUpdateSettings({ themePalette: t.id });
                    onShowToast(`Theme: ${t.name}`);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-white/15 border-white text-white font-bold'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="text-xs truncate">{t.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. COGNITIVE & PRIVACY TOOLS */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="text-[11px] font-bold tracking-wider text-amber-300/80 uppercase mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Advanced Privacy & Cognitive Tools</span>
          </div>

          <div className="space-y-2.5">
            {/* Stealth Calculator Disguise */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stealth Math Disguise</span>
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  Opens app as a working calculator until your PIN is keyed
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!settings.isPlusMember && !settings.stealthDisguise) {
                    handleRazorpayCheckout();
                    return;
                  }
                  soundEffects.playClickSound();
                  onUpdateSettings({ stealthDisguise: !settings.stealthDisguise });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.stealthDisguise ? 'bg-amber-400' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.stealthDisguise ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.stealthDisguise && (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/70">Stealth Unlock PIN:</span>
                <input
                  type="password"
                  maxLength={6}
                  value={settings.stealthPin || '1234'}
                  onChange={(e) => onUpdateSettings({ stealthPin: e.target.value })}
                  className="w-20 text-center font-mono text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Mindful Reframer Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">AI Mindful Perspective</div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  Instant reframing prompts on the write canvas before release
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!settings.isPlusMember && !settings.mindfulReframerEnabled) {
                    handleRazorpayCheckout();
                    return;
                  }
                  soundEffects.playClickSound();
                  onUpdateSettings({ mindfulReframerEnabled: !settings.mindfulReframerEnabled });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.mindfulReframerEnabled ? 'bg-amber-400' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.mindfulReframerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 5-second Retrieval Grace Period */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Retrieval Grace Period</div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  5-second banner to retrieve accidentally released thoughts
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!settings.isPlusMember && !settings.retrievalGracePeriodEnabled) {
                    handleRazorpayCheckout();
                    return;
                  }
                  soundEffects.playClickSound();
                  onUpdateSettings({ retrievalGracePeriodEnabled: !settings.retrievalGracePeriodEnabled });
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.retrievalGracePeriodEnabled ? 'bg-amber-400' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.retrievalGracePeriodEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Done Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-full bg-gradient-to-r from-amber-300 via-white to-amber-200 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-[0_10px_30px_rgba(251,191,36,0.25)]"
        >
          Save & Return to Canvas
        </button>
      </motion.div>
    </div>
  );
};

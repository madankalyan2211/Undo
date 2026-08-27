import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Plus, X, Trash2, Sparkles, Lightbulb, RotateCcw } from 'lucide-react';
import { PurgeDuration, EmotionItem, AppSettings, ReleaseRitual } from '../types';
import { soundEffects } from '../utils/audio';
import { getStoredCustomEmojis, saveCustomEmojis } from '../utils/storage';
import { generateMindfulPerspective } from '../utils/insights';
import { BreathExhaleModal } from './BreathExhaleModal';
import { GlassShatterModal } from './GlassShatterModal';

interface WriteCanvasProps {
  onRelease: (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string,
    ritual?: ReleaseRitual
  ) => void;
  onEmptyRelease: () => void;
  defaultTimer?: PurgeDuration;
  settings?: AppSettings;
  onOpenPlusModal?: () => void;
}

const DEFAULT_EMOTIONS: EmotionItem[] = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '💭', label: 'Reflective' },
  { emoji: '🌧️', label: 'Heavy' },
  { emoji: '⚡', label: 'Anxious' },
  { emoji: '🔥', label: 'Intense' },
  { emoji: '🌿', label: 'Peaceful' },
  { emoji: '✨', label: 'Hopeful' },
  { emoji: '🍃', label: 'Released' },
];

const PRESET_EMOTIONS: { emoji: string; label: string }[] = [
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🥱', label: 'Exhausted' },
  { emoji: '🥺', label: 'Vulnerable' },
  { emoji: '😮‍💨', label: 'Relieved' },
  { emoji: '😵‍💫', label: 'Overwhelmed' },
  { emoji: '🥀', label: 'Grieving' },
  { emoji: '🦁', label: 'Brave' },
  { emoji: '😶', label: 'Numb' },
  { emoji: '😨', label: 'Scared' },
  { emoji: '🩹', label: 'Healing' },
  { emoji: '💡', label: 'Inspired' },
  { emoji: '🌊', label: 'Flow' },
  { emoji: '🌱', label: 'Growing' },
  { emoji: '🤍', label: 'Serene' },
];

const QUICK_EMOJI_SUGGESTIONS = ['🌸', '🕊️', '🔮', '🪐', '🧸', '🕯️', '☕', '🌙', '☀️', '🌈', '🧗', '🧘'];

const ALL_PURGE_TIMERS: { value: PurgeDuration; label: string; short: string }[] = [
  { value: '10m', label: '10 Mins (Vent)', short: '10M' },
  { value: '1h', label: '1 Hour', short: '1H' },
  { value: '3h', label: '3 Hours', short: '3H' },
  { value: '24h', label: '24 Hours', short: '24H' },
  { value: '7d', label: '7 Days', short: '7D' },
  { value: '30d', label: '30 Days (Month)', short: '30D' },
  { value: 'custom', label: 'Custom', short: 'CTM' },
];

export const WriteCanvas: React.FC<WriteCanvasProps> = ({
  onRelease,
  onEmptyRelease,
  defaultTimer = '24h',
  settings,
  onOpenPlusModal,
}) => {
  const [content, setContent] = useState('');
  const [timerOption, setTimerOption] = useState<PurgeDuration>(defaultTimer);
  const [customHours, setCustomHours] = useState(12);
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined);
  const [isBreathModalOpen, setIsBreathModalOpen] = useState(false);
  const [isShatterModalOpen, setIsShatterModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Web Devicemotion Shake Detection for mobile browsers
  useEffect(() => {
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const force = Math.sqrt(x * x + y * y + z * z);
      if (force > 26 && content.trim().length > 0 && !isShatterModalOpen && !isBreathModalOpen) {
        setIsShatterModalOpen(true);
      }
    };

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
    return () => {
      if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [content, isShatterModalOpen, isBreathModalOpen]);

  // Custom emotions state
  const [customEmotions, setCustomEmotions] = useState<EmotionItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmoji, setNewEmoji] = useState('');
  const [newLabel, setNewLabel] = useState('');

  // Retrieval grace period state
  const [graceThought, setGraceThought] = useState<{ content: string; emoji?: string } | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Load custom emotions on mount
  useEffect(() => {
    const saved = getStoredCustomEmojis();
    setCustomEmotions(saved);
  }, []);

  const allEmotions = [...DEFAULT_EMOTIONS, ...customEmotions];

  const getShortTimerLabel = (option: PurgeDuration) => {
    const found = ALL_PURGE_TIMERS.find((t) => t.value === option);
    if (option === 'custom') return `${customHours}H`;
    return found ? found.short : '24H';
  };

  const prevContentRef = useRef('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const prev = prevContentRef.current;
    prevContentRef.current = val;
    setContent(val);

    if (settings?.soundEnabled) {
      if (val.length > prev.length) {
        const lastChar = val.slice(-1);
        const isWordBoundary = /[\s\n.,!?;:()[\]{}"'\-]/.test(lastChar);
        const words = val.trim().split(/\s+/);
        const currentWord = words.length > 0 ? words[words.length - 1] : '';
        const wordToScore = isWordBoundary && words.length > 1 ? words[words.length - 2] : currentWord;

        soundEffects.playTypingSound(
          settings?.typingSoundPack || 'classic',
          wordToScore || 'zen',
          lastChar,
          isWordBoundary
        );
      } else if (val.length < prev.length) {
        soundEffects.playDeleteSound();
      }
    }
  };

  const handleRelease = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setIsShaking(true);
      soundEffects.playClickSound();
      onEmptyRelease();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    soundEffects.playReleaseSound();
    const currentRitual = settings?.releaseRitual || 'dust';

    onRelease(
      trimmed,
      timerOption,
      timerOption === 'custom' ? customHours : undefined,
      selectedEmoji,
      currentRitual
    );

    // If grace period is enabled, show 5-second retrieval window
    if (settings?.retrievalGracePeriodEnabled) {
      setGraceThought({ content: trimmed, emoji: selectedEmoji });
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      graceTimerRef.current = setTimeout(() => {
        setGraceThought(null);
      }, 5000);
    }

    setContent('');
    setSelectedEmoji(undefined);
  };

  const handleRetrieveGrace = () => {
    if (!graceThought) return;
    soundEffects.playSaveSound();
    setContent(graceThought.content);
    if (graceThought.emoji) setSelectedEmoji(graceThought.emoji);
    setGraceThought(null);
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
  };


  const handleSelectPreset = (preset: { emoji: string; label: string }) => {
    soundEffects.playClickSound();
    // Check if preset already exists in default or custom
    const exists = allEmotions.some((e) => e.emoji === preset.emoji);
    if (!exists) {
      const newItem: EmotionItem = { emoji: preset.emoji, label: preset.label, isCustom: true };
      const updated = [...customEmotions, newItem];
      setCustomEmotions(updated);
      saveCustomEmojis(updated);
    }
    setSelectedEmoji(preset.emoji);
    setIsModalOpen(false);
  };

  const handleAddCustomEmotion = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmoji = newEmoji.trim();
    const cleanLabel = newLabel.trim();

    if (!cleanEmoji) return;

    const labelToUse = cleanLabel || 'Mood';
    const newItem: EmotionItem = {
      emoji: cleanEmoji,
      label: labelToUse,
      isCustom: true,
    };

    // Avoid duplicates
    const filtered = customEmotions.filter((item) => item.emoji !== cleanEmoji);
    const updated = [...filtered, newItem];
    setCustomEmotions(updated);
    saveCustomEmojis(updated);

    soundEffects.playClickSound();
    setSelectedEmoji(cleanEmoji);
    setNewEmoji('');
    setNewLabel('');
    setIsModalOpen(false);
  };

  const handleDeleteCustomEmotion = (emojiToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClickSound();
    const updated = customEmotions.filter((item) => item.emoji !== emojiToDelete);
    setCustomEmotions(updated);
    saveCustomEmojis(updated);
    if (selectedEmoji === emojiToDelete) {
      setSelectedEmoji(undefined);
    }
  };

  return (
    <>
      {/* 5-second Grace Period Floating Toast */}
      <AnimatePresence>
        {graceThought && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 z-40 inset-x-4 max-w-sm mx-auto p-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-amber-400/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 text-white"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <div className="text-xs font-medium">
                <span className="font-bold text-amber-300">Thought Released.</span> Undo?
              </div>
            </div>
            <button
              onClick={handleRetrieveGrace}
              type="button"
              className="px-3 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Retrieve (5s)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={cardRef}
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative w-full rounded-[36px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[40px] border ${
          isFocused
            ? 'border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.6)]'
            : 'border-[rgba(255,255,255,0.1)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
        } p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 select-none`}
      >
        {/* Top Bar Badges inside text box */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Left Badge: UNSENT THOUGHT */}
          <div className="flex items-center gap-1.5">
            <div className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] shrink-0">
              <span className="text-[10px] font-bold tracking-[0.1em] text-white/90 uppercase">
                UNSENT THOUGHT
              </span>
            </div>

            {/* Undo Plus Ritual Badge Button */}
            {onOpenPlusModal && (
              <button
                type="button"
                onClick={onOpenPlusModal}
                className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/10 to-amber-200/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1 hover:bg-amber-400/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{settings?.releaseRitual || 'Plus ✦'}</span>
              </button>
            )}
          </div>

          {/* Right Badge: Short duration e.g. 24H */}
          <div className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">
              {getShortTimerLabel(timerOption)}
            </span>
          </div>
        </div>

        {/* Main Multiline Input Field */}
        <div className="relative flex-1 min-h-[140px] sm:min-h-[160px] my-1 flex flex-col">
          <textarea
            value={content}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What are you ready to let go of?"
            rows={5}
            className="w-full h-full bg-transparent text-white placeholder-[rgba(255,255,255,0.35)] text-xl sm:text-2xl font-medium leading-relaxed resize-none focus:outline-none border-none p-1 selection:bg-white/20"
          />

          {content.length > 0 && (
            <div className="self-end text-[11px] text-white/40 font-mono tracking-wider mt-1">
              {content.trim().split(/\s+/).filter(Boolean).length} words · {content.length} chars
            </div>
          )}
        </div>

        {/* Ephemeral Mindful Perspective Suggestion */}
        {settings?.mindfulReframerEnabled && content.trim().length > 10 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-3 rounded-2xl bg-amber-400/[0.06] border border-amber-400/20 flex items-start gap-2.5"
          >
            <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-medium">
              {generateMindfulPerspective(content, selectedEmoji)}
            </p>
          </motion.div>
        )}

        {/* Divider line inside text box */}
        <div className="w-full h-[1px] bg-[rgba(255,255,255,0.06)] my-4" />

        {/* Mood Emoji Selector with Names & Add '+' Button */}
        <div className="flex flex-col gap-2.5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] font-bold tracking-[0.12em] text-white/60 uppercase">
                EMOTION (OPTIONAL)
              </span>
              {selectedEmoji && (
                <span className="text-[11px] font-semibold text-white/90">
                  · {allEmotions.find((e) => e.emoji === selectedEmoji)?.label || 'Selected'}
                </span>
              )}
            </div>
            {selectedEmoji && (
              <button
                type="button"
                onClick={() => setSelectedEmoji(undefined)}
                className="text-[11px] font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Emotion Items Horizontal Scroll with Names Underneath & + Button */}
          <div className="flex items-start gap-3 overflow-x-auto w-full max-w-full py-1.5 pb-2 scrollbar-none touch-pan-x overscroll-x-contain">
            {allEmotions.map((item) => {
              const isSelected = selectedEmoji === item.emoji;
              return (
                <div
                  key={item.emoji}
                  className="flex flex-col items-center gap-1.5 shrink-0 group relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClickSound();
                      setSelectedEmoji(isSelected ? undefined : item.emoji);
                    }}
                    title={item.label}
                    className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-lg sm:text-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-bold scale-105 shadow-[0_0_20px_rgba(255,255,255,0.5)] border border-white'
                        : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/20 text-white/90'
                    }`}
                  >
                    <span className="select-none leading-none">{item.emoji}</span>
                  </button>

                  {/* Emotion Name Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium tracking-tight text-center max-w-[54px] truncate transition-colors ${
                      isSelected ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/80'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Delete badge for custom emotions */}
                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomEmotion(item.emoji, e)}
                      title="Remove custom emotion"
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-md"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* '+' Add Custom Emoji Button */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClickSound();
                  setIsModalOpen(true);
                }}
                title="Add custom emotion"
                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.25)] hover:border-white hover:bg-white/10 hover:scale-105 text-white/80 hover:text-white transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight text-white/40 group-hover:text-white/80">
                Custom
              </span>
            </div>
          </div>
        </div>

        {/* Integrated Auto Purge Section */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] font-bold tracking-[0.12em] text-white/60 uppercase">
              AUTO PURGE
            </span>
            {timerOption === 'custom' && (
              <span className="text-xs text-white/70 font-mono">
                {customHours} Hours
              </span>
            )}
          </div>

          {/* Timer Option Pills - Horizontal Scroll with Undo Plus 10m & 30d */}
          <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full py-1.5 scrollbar-none touch-pan-x overscroll-x-contain">
            {ALL_PURGE_TIMERS.map(({ value, label }) => {
              const isSelected = timerOption === value;

              return (
                <button
                  key={value}
                  onClick={() => {
                    setTimerOption(value);
                    soundEffects.playClickSound();
                  }}
                  type="button"
                  className={`py-2 px-4 rounded-full text-xs font-semibold text-center transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#050505] font-bold shadow-lg scale-105'
                      : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-white/80 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Custom Hours Slider if custom is selected */}
          {timerOption === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-1 pt-1"
            >
              <Sliders className="w-3.5 h-3.5 text-white/50" />
              <input
                type="range"
                min="1"
                max="72"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                className="w-full accent-white h-1 bg-white/20 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-white/80 w-10 text-right">
                {customHours}h
              </span>
            </motion.div>
          )}
        </div>

        {/* Release Action Buttons (Standard + Breathe & Burn + Shake Shatter) */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (!content.trim()) {
                onEmptyRelease();
                return;
              }
              soundEffects.playClickSound();
              setIsBreathModalOpen(true);
            }}
            type="button"
            className="h-[60px] sm:h-[64px] px-4 sm:px-5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span className="text-base">🌬️</span>
            <span>Breathe</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (!content.trim()) {
                onEmptyRelease();
                return;
              }
              setIsShatterModalOpen(true);
            }}
            type="button"
            className="h-[60px] sm:h-[64px] px-4 sm:px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span className="text-base">🫨</span>
            <span>Shatter</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 0.99 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRelease}
            type="button"
            className="flex-1 h-[60px] sm:h-[64px] rounded-full bg-white text-[#050505] font-bold text-xs sm:text-sm tracking-[0.05em] uppercase flex items-center justify-center shadow-[0_12px_24px_rgba(255,255,255,0.12)] hover:bg-[#EAEAEA] active:bg-[#EAEAEA] transition-colors cursor-pointer"
          >
            <span>Release</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Shake to Shatter Screen Break Modal */}
      <GlassShatterModal
        isOpen={isShatterModalOpen}
        thoughtContent={content}
        duration={timerOption}
        customHours={timerOption === 'custom' ? customHours : undefined}
        moodEmoji={selectedEmoji}
        onClose={() => setIsShatterModalOpen(false)}
        onCompleteRelease={(txt, dur, ch, me) => {
          onRelease(txt, dur, ch, me, 'shatter');
          setContent('');
          setSelectedEmoji(undefined);
        }}
      />

      {/* Breathe & Burn Mic Exhale Modal */}
      <BreathExhaleModal
        isOpen={isBreathModalOpen}
        thoughtContent={content}
        duration={timerOption}
        customHours={timerOption === 'custom' ? customHours : undefined}
        moodEmoji={selectedEmoji}
        ritual={settings?.releaseRitual || 'fire'}
        onClose={() => setIsBreathModalOpen(false)}
        onCompleteRelease={(txt, dur, ch, me, rit) => {
          onRelease(txt, dur, ch, me, rit);
          setContent('');
          setSelectedEmoji(undefined);
        }}
      />


      {/* Custom Emoji / Emotion Picker Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
            {/* Backdrop click dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-[#141414] border border-white/15 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white scrollbar-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-none">
                      Choose Emotion
                    </h3>
                    <p className="text-[11px] text-white/50 mt-1">
                      Pick a preset or create your own custom feeling
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Presets Grid */}
              <div className="mt-5">
                <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase mb-3">
                  Popular Feelings
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {PRESET_EMOTIONS.map((preset) => {
                    const isSelected = selectedEmoji === preset.emoji;
                    return (
                      <button
                        key={preset.emoji}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
                        }`}
                      >
                        <span className="text-xl shrink-0">{preset.emoji}</span>
                        <span className="text-xs font-medium truncate">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input Form */}
              <form onSubmit={handleAddCustomEmotion} className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3.5">
                <div className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                  Or Create Custom Emotion
                </div>

                {/* Quick Emoji Bar for Fast Selection */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {QUICK_EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewEmoji(emoji)}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-sm cursor-pointer shrink-0 transition-transform active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-[10px] text-white/40 block mb-1">Emoji</label>
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      placeholder="✨"
                      maxLength={4}
                      className="w-full text-center text-xl py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/20 focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-white/40 block mb-1">Emotion Name</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Nostalgic"
                      maxLength={15}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newEmoji.trim() || !newLabel.trim()}
                  className="w-full py-3 rounded-full bg-white text-[#050505] font-bold text-xs uppercase tracking-wider hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer mt-1"
                >
                  Add & Select Emotion
                </button>
              </form>

              {/* My Custom Emotions List with Delete Option if any exist */}
              {customEmotions.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-2">
                    My Custom Emotions ({customEmotions.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customEmotions.map((item) => (
                      <div
                        key={item.emoji}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/90"
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomEmotion(item.emoji, e)}
                          className="ml-1 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

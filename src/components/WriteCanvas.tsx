import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sliders } from 'lucide-react';
import { PurgeDuration } from '../types';
import { soundEffects } from '../utils/audio';

interface WriteCanvasProps {
  onRelease: (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string
  ) => void;
  onEmptyRelease: () => void;
  defaultTimer?: PurgeDuration;
}

const MOOD_EMOJIS = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '💭', label: 'Reflective' },
  { emoji: '🌧️', label: 'Heavy' },
  { emoji: '⚡', label: 'Anxious' },
  { emoji: '🔥', label: 'Intense' },
  { emoji: '🌿', label: 'Peaceful' },
  { emoji: '✨', label: 'Hopeful' },
  { emoji: '🍃', label: 'Released' },
];

export const WriteCanvas: React.FC<WriteCanvasProps> = ({
  onRelease,
  onEmptyRelease,
  defaultTimer = '24h',
}) => {
  const [content, setContent] = useState('');
  const [timerOption, setTimerOption] = useState<PurgeDuration>(defaultTimer);
  const [customHours, setCustomHours] = useState(12);
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(undefined);
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const getShortTimerLabel = (option: PurgeDuration) => {
    switch (option) {
      case '1h':
        return '1H';
      case '24h':
        return '24H';
      case '7d':
        return '7D';
      case 'custom':
        return `${customHours}H`;
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
    onRelease(
      trimmed,
      timerOption,
      timerOption === 'custom' ? customHours : undefined,
      selectedEmoji
    );
    setContent('');
    setSelectedEmoji(undefined);
  };

  return (
    <motion.div
      ref={cardRef}
      animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full rounded-[36px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[40px] border ${
        isFocused ? 'border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.6)]' : 'border-[rgba(255,255,255,0.1)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
      } p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 select-none`}
    >
      {/* Top Bar Badges inside text box */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Left Badge: UNSENT THOUGHT */}
        <div className="px-3.5 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] shrink-0">
          <span className="text-[11px] font-bold tracking-[0.1em] text-white/90 uppercase">
            UNSENT THOUGHT
          </span>
        </div>

        {/* Right Badge: Short duration e.g. 24H */}
        <div className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
          <span className="text-[11px] font-bold tracking-wider text-white/80 uppercase">
            {getShortTimerLabel(timerOption)}
          </span>
        </div>
      </div>

      {/* Main Multiline Input Field */}
      <div className="relative flex-1 min-h-[140px] sm:min-h-[160px] my-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What are you ready to let go of?"
          rows={5}
          className="w-full h-full bg-transparent text-white placeholder-[rgba(255,255,255,0.35)] text-lg sm:text-xl font-medium leading-snug resize-none focus:outline-none border-none p-1 selection:bg-white/20"
        />

        {content.length > 0 && (
          <div className="self-end text-[11px] text-white/40 font-mono tracking-wider mt-1">
            {content.trim().split(/\s+/).filter(Boolean).length} words · {content.length} chars
          </div>
        )}
      </div>

      {/* Divider line inside text box */}
      <div className="w-full h-[1px] bg-[rgba(255,255,255,0.06)] my-4" />

      {/* Optional Mood Emoji Selector */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[10px] font-bold tracking-[0.12em] text-white/60 uppercase">
            MOOD (OPTIONAL)
          </span>
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

        <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full py-1.5 scrollbar-none touch-pan-x overscroll-x-contain">
          {MOOD_EMOJIS.map((item) => {
            const isSelected = selectedEmoji === item.emoji;
            return (
              <button
                key={item.emoji}
                type="button"
                onClick={() => {
                  soundEffects.playClickSound();
                  setSelectedEmoji(isSelected ? undefined : item.emoji);
                }}
                title={item.label}
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-base sm:text-lg transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white text-black font-bold scale-110 shadow-[0_0_16px_rgba(255,255,255,0.6)]'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] hover:bg-white/10 text-white/80'
                }`}
              >
                {item.emoji}
              </button>
            );
          })}
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

        {/* Timer Option Pills - Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full py-1.5 scrollbar-none touch-pan-x overscroll-x-contain">
          {(['1h', '24h', '7d', 'custom'] as PurgeDuration[]).map((option) => {
            const isSelected = timerOption === option;
            const labels: Record<PurgeDuration, string> = {
              '1h': '1 Hour',
              '24h': '24 Hours',
              '7d': '7 Days',
              'custom': 'Custom',
            };

            return (
              <button
                key={option}
                onClick={() => {
                  setTimerOption(option);
                  soundEffects.playClickSound();
                }}
                type="button"
                className={`py-2 px-4 rounded-full text-xs font-semibold text-center transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-[#050505] font-bold shadow-lg scale-105'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-white/80 hover:bg-white/10'
                }`}
              >
                {labels[option]}
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

      {/* Release Button inside the text box */}
      <motion.button
        whileHover={{ scale: 0.99 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleRelease}
        type="button"
        className="w-full h-[60px] sm:h-[64px] rounded-full bg-white text-[#050505] font-bold text-sm sm:text-base tracking-[0.05em] uppercase flex items-center justify-center shadow-[0_12px_24px_rgba(255,255,255,0.12)] hover:bg-[#EAEAEA] active:bg-[#EAEAEA] transition-colors cursor-pointer"
      >
        <span>Release Thought</span>
      </motion.button>
    </motion.div>
  );
};

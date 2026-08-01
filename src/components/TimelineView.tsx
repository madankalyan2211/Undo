import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Trash2, Copy, Check } from 'lucide-react';
import { Thought } from '../types';
import { formatTimeRemaining } from '../utils/storage';
import { soundEffects } from '../utils/audio';

interface TimelineViewProps {
  thoughts: Thought[];
  onDelete: (id: string) => void;
  onSaveForever: (id: string) => void;
  onNavigateToWrite: () => void;
  onShowToast?: (msg: string) => void;
}

interface ThoughtSwipeCardProps {
  thought: Thought;
  onDelete: (id: string) => void;
  onSaveForever: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

const ThoughtSwipeCard: React.FC<ThoughtSwipeCardProps> = ({
  thought,
  onDelete,
  onSaveForever,
  onShowToast,
}) => {
  const [exitX, setExitX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(thought.content);
    soundEffects.playClickSound();
    soundEffects.vibrate([15, 30]);
    setCopied(true);
    onShowToast?.('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragEnd = (_: any, info: any) => {
    setDragX(0);
    const threshold = 70;
    const velocityThreshold = 180;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      // Swiped Right -> Keep
      setExitX(400);
      soundEffects.playSaveSound();
      setTimeout(() => {
        onSaveForever(thought.id);
      }, 180);
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      // Swiped Left -> Delete
      setExitX(-400);
      soundEffects.playDeleteSound();
      setTimeout(() => {
        onDelete(thought.id);
      }, 180);
    }
  };

  const { text } = formatTimeRemaining(thought.expiresAt);

  return (
    <div className="relative w-full overflow-hidden rounded-[32px] touch-pan-y select-none">
      {/* Swipe Indicators Behind Card */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-[32px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] pointer-events-none">
        {/* Right Swipe Indicator (Keep) */}
        <div
          className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-opacity duration-150 ${
            dragX > 20 ? 'opacity-100 text-emerald-400' : 'opacity-30 text-white/40'
          }`}
        >
          <Star className="w-4 h-4 fill-emerald-400" />
          <span>Keep</span>
        </div>

        {/* Left Swipe Indicator (Delete) */}
        <div
          className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-opacity duration-150 ${
            dragX < -20 ? 'opacity-100 text-rose-400' : 'opacity-30 text-white/40'
          }`}
        >
          <span>Delete</span>
          <Trash2 className="w-4 h-4" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={exitX !== null ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative rounded-[32px] bg-[#121212] border border-[rgba(255,255,255,0.1)] p-5 sm:p-6 flex items-start gap-4 cursor-grab active:cursor-grabbing shadow-lg"
      >
        {/* Circle Dot / Mood Emoji Icon on Left */}
        <div className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 pointer-events-none select-none">
          {thought.moodEmoji ? (
            <span className="text-xl leading-none">{thought.moodEmoji}</span>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
        </div>

        {/* Main Thought Body & Expiry Pill */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap break-words flex-1">
              {thought.content}
            </p>

            {/* Subtle Copy to Clipboard Button */}
            <button
              onClick={handleCopy}
              type="button"
              title="Copy thought to clipboard"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all duration-200 cursor-pointer shrink-0 pointer-events-auto"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Expiry Pill Tag & Mood Emoji Badge */}
          <div className="flex items-center gap-2 mt-1 flex-wrap pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-[10px] sm:text-[11px] font-bold tracking-widest text-white/80 uppercase">
              {text}
            </span>
            {thought.moodEmoji && (
              <span className="px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[11px] font-medium text-white/90 flex items-center gap-1">
                <span>{thought.moodEmoji}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  thoughts,
  onDelete,
  onSaveForever,
  onNavigateToWrite,
  onShowToast,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const expiringThoughts = thoughts.filter((t) => !t.isSaved);

  return (
    <div className="relative w-full pb-28 pt-2">
      {/* Main Expiring Thoughts List */}
      {expiringThoughts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[32px] bg-white/[0.03] border border-white/10 mt-2 select-none"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Your Mind Is Clear</h3>
          <p className="text-xs text-white/60 max-w-xs leading-relaxed mb-6">
            All temporary thoughts have safely dissolved into peace.
          </p>
          <button
            onClick={() => {
              soundEffects.playClickSound();
              onNavigateToWrite();
            }}
            type="button"
            className="px-6 py-3 rounded-full bg-white text-[#050505] font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
          >
            Unload A Thought
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {expiringThoughts.map((thought) => (
              <ThoughtSwipeCard
                key={thought.id}
                thought={thought}
                onDelete={onDelete}
                onSaveForever={onSaveForever}
                onShowToast={onShowToast}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};


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
      {/* Directional swipe feedback: luminous icons appear only while swiping. */}
      <div className={`absolute inset-0 flex items-center justify-between px-6 rounded-[32px] border pointer-events-none transition-colors duration-200 ${
        dragX > 20
          ? 'bg-gradient-to-r from-emerald-400/20 via-emerald-400/[0.08] to-white/[0.02] border-emerald-300/20'
          : dragX < -20
            ? 'bg-gradient-to-l from-rose-400/20 via-rose-400/[0.08] to-white/[0.02] border-rose-300/20'
            : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)]'
      }`}>
        <div
          role="img"
          aria-label="Swipe right to keep this thought"
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/15 text-emerald-200 shadow-[0_0_28px_rgba(52,211,153,0.24)] transition-all duration-150 ${dragX > 20 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        >
          <Star className="h-5 w-5 fill-current" />
        </div>
        <div
          role="img"
          aria-label="Swipe left to delete this thought"
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-rose-300/30 bg-rose-300/15 text-rose-200 shadow-[0_0_28px_rgba(251,113,133,0.24)] transition-all duration-150 ${dragX < -20 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        >
          <Trash2 className="h-5 w-5" />
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
        className="relative rounded-[32px] bg-[rgba(255,255,255,0.075)] backdrop-blur-[32px] border border-[rgba(255,255,255,0.15)] p-5 sm:p-6 flex items-start gap-4 cursor-grab active:cursor-grabbing shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_40px_rgba(0,0,0,0.24)]"
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


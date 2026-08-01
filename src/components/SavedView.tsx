import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Trash2, Copy, Check } from 'lucide-react';
import { Thought } from '../types';
import { soundEffects } from '../utils/audio';
import { Header } from './Header';

interface SavedViewProps {
  thoughts: Thought[];
  onDeletePermanent: (id: string) => void;
  onUnsaveToTimeline: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  thoughts,
  onDeletePermanent,
  onUnsaveToTimeline,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const savedThoughts = thoughts.filter((t) => t.isSaved);

  const filteredThoughts = savedThoughts.filter((t) => {
    return (
      searchQuery === '' ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    soundEffects.playClickSound();
    soundEffects.vibrate([15, 30]);
    setCopiedId(id);
    onShowToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative w-full pb-28 pt-2">
      {/* Search Input Bar & Star Button Row */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kept thoughts"
            className="w-full pl-10 pr-4 py-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-white/50 hover:text-white px-2 py-0.5 rounded-full bg-white/10"
            >
              Clear
            </button>
          )}
        </div>

        {/* Star Button Icon Capsule */}
        <div className="w-11 h-11 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-white/80 fill-white/20" />
        </div>
      </div>

      {/* Main Saved List or Empty State Card */}
      {filteredThoughts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-[32px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] select-none mt-2"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            Nothing kept yet
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-xs leading-relaxed">
            {searchQuery
              ? 'No saved thoughts match your search.'
              : 'Swipe right on a thought in the Timeline to save it here forever.'}
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {filteredThoughts.map((thought) => (
              <motion.div
                key={thought.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-200"
              >
                {/* Content */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap break-words flex-1">
                    {thought.content}
                  </p>
                  {thought.moodEmoji && (
                    <span className="text-2xl shrink-0 p-1 rounded-full bg-white/5 border border-white/10 select-none">
                      {thought.moodEmoji}
                    </span>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06] select-none">
                  <span className="text-[10px] text-white/40 font-mono">
                    {new Date(thought.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(thought.id, thought.content)}
                      type="button"
                      title="Copy to clipboard"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === thought.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.playClickSound();
                        onUnsaveToTimeline(thought.id);
                      }}
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Unsave
                    </button>

                    <button
                      onClick={() => {
                        soundEffects.playDeleteSound();
                        onDeletePermanent(thought.id);
                      }}
                      type="button"
                      className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

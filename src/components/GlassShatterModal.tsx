import React, { useEffect, useState } from 'react';
import { soundEffects } from '../utils/audio';
import { PurgeDuration, ReleaseRitual } from '../types';

interface GlassShatterModalProps {
  isOpen: boolean;
  thoughtContent: string;
  duration: PurgeDuration;
  customHours?: number;
  moodEmoji?: string;
  onCompleteRelease: (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string,
    ritual?: ReleaseRitual
  ) => void;
  onClose: () => void;
}

const SHARDS_COUNT = 36;

export const GlassShatterModal: React.FC<GlassShatterModalProps> = ({
  isOpen,
  thoughtContent,
  duration,
  customHours,
  moodEmoji,
  onCompleteRelease,
  onClose,
}) => {
  const [shards, setShards] = useState<
    { id: number; tx: number; ty: number; rot: number; size: number }[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    // Generate random shard trajectories
    const newShards = Array.from({ length: SHARDS_COUNT }).map((_, i) => {
      const angle = (i / SHARDS_COUNT) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const velocity = 100 + Math.random() * 300;
      return {
        id: i,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity + (250 + Math.random() * 400),
        rot: Math.random() * 720 - 360,
        size: 24 + Math.random() * 48,
      };
    });
    setShards(newShards);

    // Play Shatter audio
    soundEffects.playShatterSound();

    const timer = setTimeout(() => {
      onCompleteRelease(thoughtContent, duration, customHours, moodEmoji, 'shatter');
      onClose();
    }, 1300);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/95 select-none animate-shake">
      {/* Intense White Impact Flash */}
      <div className="absolute inset-0 bg-white pointer-events-none animate-flash-out" />

      {/* Spiderweb Screen Crack SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-90">
        <line x1="50%" y1="50%" x2="5%" y2="10%" stroke="rgba(255,255,255,0.95)" strokeWidth="3" />
        <line x1="50%" y1="50%" x2="95%" y2="8%" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
        <line x1="50%" y1="50%" x2="98%" y2="65%" stroke="rgba(255,255,255,0.95)" strokeWidth="3.5" />
        <line x1="50%" y1="50%" x2="70%" y2="95%" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
        <line x1="50%" y1="50%" x2="20%" y2="92%" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
        <line x1="50%" y1="50%" x2="2%" y2="50%" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
        {/* Radial Web Arcs */}
        <circle cx="50%" cy="50%" r="70" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" />
        <circle cx="50%" cy="50%" r="150" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" strokeDasharray="12,8" />
        <circle cx="50%" cy="50%" r="260" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="20,12" />
      </svg>

      {/* Center Shattered Notice */}
      <div className="relative z-20 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.9)] animate-pulse">
          💥 SHATTERED
        </h1>
        <p className="text-xs sm:text-sm text-white/70 mt-2 font-medium tracking-wide">
          Thought physically fractured into glass shards.
        </p>
      </div>

      {/* Falling Dynamic Glass Shards */}
      {shards.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-sm border-2 border-white bg-white/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-[1200ms] ease-out pointer-events-none"
          style={{
            width: `${s.size}px`,
            height: `${s.size * 0.65}px`,
            transform: `translate(${s.tx}px, ${s.ty}px) rotate(${s.rot}deg)`,
            opacity: 0,
          }}
        >
          <div className="w-full h-0.5 bg-white shadow-sm" />
        </div>
      ))}
    </div>
  );
};

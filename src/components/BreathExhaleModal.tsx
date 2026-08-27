import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Wind } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { PurgeDuration, ReleaseRitual } from '../types';

interface BreathExhaleModalProps {
  isOpen: boolean;
  thoughtContent: string;
  duration: PurgeDuration;
  customHours?: number;
  moodEmoji?: string;
  ritual?: ReleaseRitual;
  onClose: () => void;
  onCompleteRelease: (
    content: string,
    duration: PurgeDuration,
    customHours?: number,
    moodEmoji?: string,
    ritual?: ReleaseRitual
  ) => void;
}

export const BreathExhaleModal: React.FC<BreathExhaleModalProps> = ({
  isOpen,
  thoughtContent,
  duration,
  customHours,
  moodEmoji,
  ritual = 'fire',
  onClose,
  onCompleteRelease,
}) => {
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathDetected, setBreathDetected] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false);
  const [micStatus, setMicStatus] = useState<'requesting' | 'active' | 'denied'>('requesting');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const manualBlowInterval = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setBreathProgress(0);
      setIsDissolving(false);
      startWebMicListening();
    } else {
      stopWebMicListening();
    }

    return () => {
      stopWebMicListening();
    };
  }, [isOpen]);

  const startWebMicListening = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicStatus('denied');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicStatus('active');
      monitorBreath();
    } catch {
      setMicStatus('denied');
    }
  };

  const monitorBreath = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Compute average energy in lower frequency bins (where breath/wind noise is concentrated)
    let lowEnergy = 0;
    for (let i = 2; i < 20; i++) {
      lowEnergy += dataArray[i];
    }
    const avgEnergy = lowEnergy / 18;

    if (avgEnergy > 38) {
      setBreathDetected(true);
      setBreathProgress((prev) => {
        const next = Math.min(100, prev + Math.max(1.5, (avgEnergy - 35) * 0.25));
        if (next >= 100) {
          triggerDissolve();
        }
        return next;
      });
    } else {
      setBreathDetected(false);
    }

    animationFrameRef.current = requestAnimationFrame(monitorBreath);
  };

  const stopWebMicListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const triggerDissolve = () => {
    if (isDissolving) return;
    setIsDissolving(true);
    stopWebMicListening();
    soundEffects.playReleaseSound();

    setTimeout(() => {
      onCompleteRelease(thoughtContent, duration, customHours, moodEmoji, ritual);
      onClose();
    }, 900);
  };

  const handleTouchBreatheStart = () => {
    setBreathDetected(true);
    manualBlowInterval.current = setInterval(() => {
      setBreathProgress((prev) => {
        const next = Math.min(100, prev + 6);
        if (next >= 100) {
          clearInterval(manualBlowInterval.current);
          triggerDissolve();
        }
        return next;
      });
    }, 70);
  };

  const handleTouchBreatheEnd = () => {
    setBreathDetected(false);
    if (manualBlowInterval.current) {
      clearInterval(manualBlowInterval.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#0F0F0F] border border-amber-400/30 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center justify-between min-h-[500px]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 text-[10px] font-black tracking-widest uppercase mb-3">
            <Wind className="w-3.5 h-3.5" />
            <span>BREATHE & BURN</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Exhale to Release</h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs leading-relaxed">
            Blow gently into your microphone or hold the breathing orb below to scatter your thought.
          </p>
        </div>

        {/* Center Thought Card with Dissolve Physics */}
        <div className="relative w-full my-6 flex items-center justify-center min-h-[140px]">
          <div
            className={`p-6 rounded-2xl bg-white/[0.04] border border-amber-400/20 max-w-xs w-full transition-all duration-700 ${
              isDissolving
                ? 'scale-125 opacity-0 blur-md -translate-y-8 rotate-3'
                : 'scale-100 opacity-100'
            }`}
          >
            {moodEmoji && <div className="text-2xl mb-2">{moodEmoji}</div>}
            <p className="text-sm italic text-white/90 leading-relaxed">"{thoughtContent}"</p>
          </div>
        </div>

        {/* Breath Control & Orb */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Progress Bar */}
          <div className="w-3/4 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-100 rounded-full"
              style={{ width: `${breathProgress}%` }}
            />
          </div>

          <span className="text-xs font-extrabold text-amber-400 tracking-wider">
            {breathProgress >= 100
              ? '✦ DISSOLVING INTO EMBER SMOKE...'
              : breathDetected
              ? `🌬️ EXHALING... ${Math.round(breathProgress)}%`
              : '🌬️ Blow into mic (or click & hold orb)'}
          </span>

          {/* Interactive Breathing Orb */}
          <button
            type="button"
            onMouseDown={handleTouchBreatheStart}
            onMouseUp={handleTouchBreatheEnd}
            onTouchStart={handleTouchBreatheStart}
            onTouchEnd={handleTouchBreatheEnd}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer select-none ${
              breathDetected
                ? 'border-amber-400 bg-amber-400/30 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                : 'border-amber-400/30 bg-amber-400/10 hover:scale-105 animate-pulse'
            }`}
          >
            <span className="text-3xl">{breathDetected ? '💨' : '🌬️'}</span>
          </button>

          {micStatus === 'denied' && (
            <span className="text-[10px] text-white/40 max-w-xs">
              Microphone access disabled. Click & hold the orb above to release.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

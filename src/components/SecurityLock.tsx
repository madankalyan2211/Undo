import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ScanFace, Check } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface SecurityLockProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ isLocked, onUnlock }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleUnlock = () => {
    setIsScanning(true);
    soundEffects.playClickSound();
    setTimeout(() => {
      soundEffects.playSaveSound();
      setIsScanning(false);
      onUnlock();
    }, 900);
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 text-center select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-white opacity-5 blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="flex flex-col items-center max-w-xs w-full"
          >
            {/* Face ID Icon Container */}
            <button
              onClick={handleUnlock}
              disabled={isScanning}
              type="button"
              className="relative w-24 h-24 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mb-6 hover:bg-white/10 transition-all cursor-pointer group"
            >
              {isScanning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <ScanFace className="w-10 h-10 text-white group-hover:scale-105 transition-transform" />
              )}
            </button>

            <h2 className="text-xl font-extrabold text-white mb-2">Undo Vault Locked</h2>
            <p className="text-xs text-white/60 mb-8 leading-relaxed">
              Your thoughts are protected with device biometrics.
            </p>

            <button
              onClick={handleUnlock}
              type="button"
              className="w-full py-4 rounded-full bg-white text-[#050505] font-extrabold text-xs uppercase tracking-widest hover:bg-[#EAEAEA] transition-colors cursor-pointer"
            >
              {isScanning ? 'Verifying Face ID...' : 'Unlock Space'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

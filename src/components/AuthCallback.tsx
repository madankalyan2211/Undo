import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const AuthCallback: React.FC = () => {
  const [undoLink, setUndoLink] = useState<string>('');
  const [expoLink, setExpoLink] = useState<string>('');

  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const queryPayload = hash || search;

    const undoTarget = `undo://auth/callback${queryPayload}`;
    const expoTarget = `exp://127.0.0.1:8081/--/auth/callback${queryPayload}`;

    setUndoLink(undoTarget);
    setExpoLink(expoTarget);

    // Try opening deep links
    try {
      window.location.href = undoTarget;
    } catch {}
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-sm text-center w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Authenticated Successfully!</h2>
          <p className="text-xs text-white/50">
            Tap below to return to your mobile app:
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {undoLink ? (
            <a
              href={undoLink}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-[#050505] font-semibold text-sm transition-all duration-200 hover:bg-white/90 active:scale-95 text-center shadow-lg"
            >
              ✦ Return to Undo App
            </a>
          ) : null}

          {expoLink ? (
            <a
              href={expoLink}
              className="w-full py-3 px-6 rounded-xl border border-white/20 bg-white/5 text-white/90 font-medium text-xs transition-all duration-200 hover:bg-white/10 active:scale-95 text-center"
            >
              📱 Open in Expo Go (Development)
            </a>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};


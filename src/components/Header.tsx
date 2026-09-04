import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  isPlusActive?: boolean;
  activeSoundscape?: string;
  user?: UserProfile | null;
  onOpenPlusModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Undo",
  subtitle = "Write it. Let it go.",
  isPlusActive = true,
  activeSoundscape,
  user,
  onOpenPlusModal,
  onOpenAuthModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full select-none py-2.5 bg-transparent transition-all duration-300">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          {/* Animated Heading Capsule Container */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={`transition-all duration-300 flex items-center gap-2 ${
              isScrolled
                ? 'px-5 py-2 rounded-full bg-white text-[#050505] border border-white shadow-[0_12px_40px_rgba(255,255,255,0.35)]'
                : 'px-0 py-0 bg-transparent text-white border-transparent shadow-none'
            }`}
          >
            <motion.h1
              layout="position"
              className={`font-bold tracking-tight transition-colors duration-200 ${
                isScrolled
                  ? 'text-2xl sm:text-3xl text-[#050505] font-extrabold'
                  : 'text-3xl sm:text-4xl text-white mb-0.5'
              }`}
            >
              {title}
            </motion.h1>
          </motion.div>

          {/* Subtitle Description - Fades out & collapses on scroll */}
          <AnimatePresence>
            {!isScrolled && subtitle && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden text-xs sm:text-sm font-medium text-white/60 pl-0.5 mt-1"
              >
                {subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Right Corner: Undo Plus Pill Button & Google Avatar */}
        <div className="flex items-center gap-2">
          {onOpenPlusModal && (
            <button
              type="button"
              onClick={onOpenPlusModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 via-white/5 to-amber-300/15 border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <span className="text-amber-300 text-xs">✦</span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">
                PLUS
              </span>
            </button>
          )}

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="relative p-0.5 rounded-full hover:scale-105 transition-transform cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border-1.5 border-amber-400 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-400/20 border-1.5 border-amber-400 flex items-center justify-center text-[11px] font-bold text-amber-300">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};





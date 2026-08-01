import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Undo",
  subtitle = "Write it. Let it go.",
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
      <div className="flex flex-col items-start w-full">
        {/* Animated Heading Capsule Container */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className={`transition-all duration-300 flex items-center ${
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
    </header>
  );
};




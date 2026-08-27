import React from 'react';
import { motion } from 'motion/react';
import { ThemePalette } from '../types';

interface AmbientBackgroundProps {
  theme?: ThemePalette;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ theme = 'oled' }) => {
  const getThemeColors = () => {
    switch (theme) {
      case 'obsidian':
        return {
          bg: '#090806',
          glow1: 'rgba(226, 184, 110, 0.12)',
          glow2: 'rgba(180, 130, 60, 0.08)',
        };
      case 'matcha':
        return {
          bg: '#060907',
          glow1: 'rgba(158, 203, 160, 0.14)',
          glow2: 'rgba(100, 160, 110, 0.08)',
        };
      case 'lavender':
        return {
          bg: '#08060E',
          glow1: 'rgba(196, 181, 253, 0.14)',
          glow2: 'rgba(147, 112, 219, 0.09)',
        };
      case 'indigo':
        return {
          bg: '#050711',
          glow1: 'rgba(129, 140, 248, 0.15)',
          glow2: 'rgba(99, 102, 241, 0.10)',
        };
      case 'cyberpunk':
        return {
          bg: '#040308',
          glow1: 'rgba(45, 212, 191, 0.18)',
          glow2: 'rgba(244, 114, 182, 0.12)',
        };
      case 'oled':
      default:
        return {
          bg: '#050505',
          glow1: 'rgba(255, 255, 255, 0.07)',
          glow2: 'rgba(255, 255, 255, 0.04)',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Soft floating giant ambient glow 1 */}
      <motion.div
        animate={{
          x: [-40, 40, -30, -40],
          y: [-30, 50, 20, -30],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ backgroundColor: colors.glow1 }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full blur-[140px] transition-all duration-700"
      />

      {/* Secondary subtle floating ambient glow at bottom */}
      <motion.div
        animate={{
          x: [30, -30, 20, 30],
          y: [20, -40, 30, 20],
          scale: [1, 1.2, 1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ backgroundColor: colors.glow2 }}
        className="absolute -bottom-40 left-1/3 w-[460px] h-[460px] rounded-full blur-[150px] transition-all duration-700"
      />

      {/* Grid texture overlay for Japanese Minimal aesthetic */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" 
      />
    </div>
  );
};


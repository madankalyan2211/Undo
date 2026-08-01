import React from 'react';
import { motion } from 'motion/react';

export const AmbientBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050505]">
      {/* Soft floating giant white ambient glow 1 */}
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
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-white opacity-[0.07] blur-[140px]"
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
        className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-white opacity-[0.04] blur-[150px]"
      />

      {/* Grid texture overlay for Nothing OS / Japanese Minimal aesthetic */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" 
      />
    </div>
  );
};

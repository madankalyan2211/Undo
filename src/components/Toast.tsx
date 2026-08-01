import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  subMessage?: string;
  type?: 'success' | 'warning' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, subMessage, type = 'success', onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={onClose}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] sm:max-w-md w-auto cursor-pointer"
        >
          <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 text-white">
            <div className="flex-shrink-0">
              {type === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
              {type === 'warning' && <AlertCircle className="w-4 h-4 text-white/80" />}
              {type === 'info' && <Info className="w-4 h-4 text-white/80" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold tracking-wide text-white leading-tight">
                {message}
              </span>
              {subMessage && (
                <span className="text-[11px] text-white/65 font-normal leading-tight mt-0.5">
                  {subMessage}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

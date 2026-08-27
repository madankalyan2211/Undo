import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, signOutUser } from '../utils/auth';
import { soundEffects } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUserChange: (user: UserProfile | null) => void;
  onShowToast: (msg: string, sub?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  user,
  onClose,
  onUserChange,
  onShowToast,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      soundEffects.playClickSound();
      await signInWithGoogle();
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      onShowToast('Google Sign-in failed', err.message);
    }
  };

  const handleSignOut = async () => {
    soundEffects.playDeleteSound();
    await signOutUser();
    onUserChange(null);
    onShowToast('Signed Out', 'Your local thoughts remain safe on this device');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative z-10 w-full max-w-sm rounded-[32px] bg-[#121212] border border-white/15 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {user ? (
          /* Signed In Profile Card */
          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative mb-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-[#4285F4] border border-black shadow">
                G
              </div>
            </div>

            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <p className="text-xs text-white/50">{user.email}</p>

            <div className="mt-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Google Account Connected</span>
            </div>

            <div className="w-full h-px bg-white/10 my-5" />

            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white/60" />
                <span>{isLoading ? 'Connecting to Google...' : 'Switch Google Account'}</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Screen */
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#4285F4] font-black text-2xl mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              G
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Sign in with Google</h3>
            <p className="text-xs text-white/50 mt-1.5 leading-relaxed px-2 mb-6">
              Sync Undo Plus membership, cloud backup, and reflection history seamlessly.
            </p>

            {/* Real Google Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.15)] cursor-pointer active:scale-[0.98]"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[#4285F4] font-black text-xs">
                G
              </div>
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="mt-6 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[10px] text-white/40">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Private & Ephemeral · Zero Tracking · Offline First</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

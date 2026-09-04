import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, User, Check, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';
import { saveStoredUser, DEFAULT_USER } from '../utils/auth';
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
  const [name, setName] = useState(user?.name || DEFAULT_USER.name);
  const [email, setEmail] = useState(user?.email || DEFAULT_USER.email);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSaveSound();
    const updated: UserProfile = {
      ...(user || DEFAULT_USER),
      name: name.trim() || 'Mindful Writer',
      email: email.trim() || 'writer@undo.app',
    };
    saveStoredUser(updated);
    onUserChange(updated);
    setIsEditing(false);
    onShowToast('Profile Updated', `Active as ${updated.name}`);
  };

  const handleResetDefault = () => {
    soundEffects.playDeleteSound();
    saveStoredUser(DEFAULT_USER);
    onUserChange(DEFAULT_USER);
    setName(DEFAULT_USER.name);
    setEmail(DEFAULT_USER.email);
    setIsEditing(false);
    onShowToast('Profile Reset', 'Reverted to default guest writer profile.');
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

        <div className="flex flex-col items-center text-center pt-2">
          {/* Avatar */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-2xl shadow-md">
              {(user?.name || name).charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white border border-black shadow">
              ✓
            </div>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">{user?.name || name}</h3>
          <p className="text-xs text-white/50">{user?.email || email}</p>

          <div className="mt-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>Active Writer Session</span>
          </div>

          <div className="w-full h-px bg-white/10 my-5" />

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="w-full space-y-3 text-left">
              <div>
                <label className="text-[11px] text-white/50 font-medium block mb-1">Writer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-white/50 font-medium block mb-1">Writer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-300 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Edit Writer Name / Email</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefault}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-white/60 hover:text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[10px] text-white/40">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Private & Ephemeral · Zero Tracking · Offline First</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

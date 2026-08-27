import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithCredentials, signInAsReviewer } from '../utils/auth';

import { UserProfile } from '../types';

interface SignInPageProps {
  onShowToast: (msg: string, sub?: string, type?: 'success' | 'warning' | 'info') => void;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onShowToast, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testEmail, setTestEmail] = useState('reviewer@undo.app');
  const [testPassword, setTestPassword] = useState('UndoReview2026!');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setIsLoading(false);
      onShowToast('Sign-in failed', err.message, 'warning');
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const profile = await signInWithCredentials(testEmail, testPassword);
      if (onLoginSuccess) {
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setIsLoading(false);
      onShowToast('Login Failed', err.message, 'warning');
    }
  };

  const handleInstantReviewer = () => {
    setIsLoading(true);
    const profile = signInAsReviewer();
    if (onLoginSuccess) {
      onLoginSuccess(profile);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-white/[0.02] blur-[80px]" />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute w-px h-px rounded-full bg-white/30"
          style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm shadow-xl">
            <span className="text-3xl">✦</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Undo</h1>
          <p className="text-sm text-white/40 leading-relaxed font-light tracking-wide">
            Write it. Feel it. Let it go.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['✨ Ephemeral Thoughts', '🔥 Sensory Rituals', '🧘 Focus Intentions', '🔒 Private'].map((tag) => (
            <span key={tag} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 bg-white/[0.04]">
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Sign-in Card */}
        <motion.div
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 flex flex-col gap-4 shadow-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <p className="text-sm font-semibold text-white/90 mb-1">Welcome to Your Sanctuary</p>
            <p className="text-xs text-white/40">Sign in to start journaling & unlock sensory rituals.</p>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-white text-[#050505] font-semibold text-sm transition-all duration-200 hover:bg-white/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {isLoading ? (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-[#050505]/30 border-t-[#050505]"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Test / Reviewer Mode Toggle */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => setShowTestForm(!showTestForm)}
              className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer py-1"
            >
              <span>🔑 Test Account / Reviewer Login</span>
              <span className="text-[10px]">{showTestForm ? '▲' : '▼'}</span>
            </button>

            {showTestForm && (
              <form onSubmit={handleCredentialLogin} className="flex flex-col gap-2.5 text-left bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-white/50 font-medium">Test Email</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/40"
                    placeholder="reviewer@undo.app"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-white/50 font-medium">Test Password</label>
                  <input
                    type="text"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/40"
                    placeholder="UndoReview2026!"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-amber-400/90 text-black font-semibold text-xs transition-all hover:bg-amber-300 active:scale-95 cursor-pointer mt-1"
                >
                  Log In with Test Credentials
                </button>

                <button
                  type="button"
                  onClick={handleInstantReviewer}
                  className="w-full py-2 rounded-lg border border-white/20 bg-white/10 text-white/90 font-medium text-[11px] transition-all hover:bg-white/15 cursor-pointer text-center"
                >
                  ⚡ Instant 1-Click Reviewer Access
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Footer Legal & Compliance Links */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/40 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <a href="/privacy" className="hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white transition-colors underline underline-offset-2">Terms & Conditions</a>
          <span>·</span>
          <a href="/refund" className="hover:text-white transition-colors underline underline-offset-2">Refund Policy</a>
          <span>·</span>
          <a href="/contact" className="hover:text-white transition-colors underline underline-offset-2">Contact Support</a>
        </motion.div>
      </motion.div>
    </div>
  );
};

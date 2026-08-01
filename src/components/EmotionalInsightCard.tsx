import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Heart, TrendingUp, Lightbulb, Compass, BarChart2 } from 'lucide-react';
import { Thought } from '../types';
import { generateEmotionalInsight } from '../utils/insights';
import { soundEffects } from '../utils/audio';

interface EmotionalInsightCardProps {
  thoughts: Thought[];
  onShowToast?: (msg: string) => void;
}

export const EmotionalInsightCard: React.FC<EmotionalInsightCardProps> = ({
  thoughts,
  onShowToast,
}) => {
  const insight = generateEmotionalInsight(thoughts);

  const handleRefresh = () => {
    soundEffects.playClickSound();
    soundEffects.vibrate([10, 20]);
    onShowToast?.('Emotional insights updated');
  };

  if (!insight.hasEnoughData) {
    return (
      <div className="rounded-[32px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.08)] p-6 sm:p-7 flex flex-col gap-4 text-center items-center">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
          <Brain className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-base font-bold text-white">No Emotional Insights Yet</h3>
          <p className="text-xs text-white/60 max-w-xs leading-relaxed">
            {insight.weeklyThemeSummary}
          </p>
        </div>
      </div>
    );
  }

  const releaseRate =
    insight.totalSaved + insight.totalReleasedThisWeek > 0
      ? Math.round(
          (insight.totalReleasedThisWeek /
            (insight.totalSaved + insight.totalReleasedThisWeek)) *
            100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[32px] bg-gradient-to-b from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.02)] backdrop-blur-[30px] border border-[rgba(255,255,255,0.1)] p-5 sm:p-7 flex flex-col gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span className="text-xs font-bold tracking-[0.12em] text-white/90 uppercase">
            Weekly Emotional Insight
          </span>
        </div>

        <button
          onClick={handleRefresh}
          type="button"
          title="Refresh insights"
          className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Spotlight Theme Card */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Dominant Focus
          </span>
          {insight.topMood && (
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5">
              <span>{insight.topMood.emoji}</span>
              <span>{insight.topMood.label} ({insight.topMood.percentage}%)</span>
            </span>
          )}
        </div>

        <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {insight.primaryEmotionTheme}
        </h4>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          {insight.weeklyThemeSummary}
        </p>

        {/* Guidance Quote Box */}
        <div className="mt-1 p-3.5 rounded-xl bg-white/[0.03] border-l-2 border-amber-300/80 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs italic text-white/70 leading-relaxed">
            "{insight.reflectionGuidance}"
          </p>
        </div>
      </div>

      {/* Mood Breakdown Bars */}
      {insight.moodBreakdown.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-white/60 uppercase">
            <span>Mood Breakdown</span>
            <span>{insight.totalSaved} Saved</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {insight.moodBreakdown.map((m) => (
              <div key={m.emoji} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </span>
                  <span className="text-white/60 text-[11px]">
                    {m.count} ({m.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-white/80 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Themes / Keywords */}
      {insight.topThemes.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold tracking-wider text-white/60 uppercase">
            Recurring Themes & Tags
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {insight.topThemes.map((t) => (
              <span
                key={t.tag}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/90"
              >
                #{t.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Balance Footer */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
            Preserved
          </span>
          <span className="text-lg font-bold text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
            {insight.totalSaved} kept
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
            Purged / Let Go
          </span>
          <span className="text-lg font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {releaseRate}% purged
          </span>
        </div>
      </div>
    </motion.div>
  );
};

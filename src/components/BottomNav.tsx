import React from 'react';
import { motion } from 'motion/react';
import { Edit3, Clock, Star, Sliders } from 'lucide-react';
import { TabType } from '../types';
import { soundEffects } from '../utils/audio';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  timelineCount?: number;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: { id: TabType; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'write', icon: Edit3 },
    { id: 'timeline', icon: Clock },
    { id: 'saved', icon: Star },
    { id: 'settings', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[280px] sm:w-[320px] select-none">
      <div className="relative p-2 rounded-full bg-[rgba(20,20,20,0.85)] backdrop-blur-3xl border border-[rgba(255,255,255,0.12)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClickSound();
                onChangeTab(tab.id);
              }}
              type="button"
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveCircle"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute inset-0 bg-white rounded-full shadow-lg"
                />
              )}

              <Icon
                className={`relative z-10 w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-[#050505]' : 'text-white/60 hover:text-white'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

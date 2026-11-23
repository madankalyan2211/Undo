import React from 'react';
import { CheckSquare, Clock, Edit3, Sliders, Star } from 'lucide-react';
import { TabType } from '../types';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const TABS: { id: TabType; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'write', icon: Edit3 }, { id: 'todos', icon: CheckSquare },
  { id: 'timeline', icon: Clock }, { id: 'saved', icon: Star }, { id: 'settings', icon: Sliders },
];

export const MobileBottomNav: React.FC<Props> = ({ activeTab, onChangeTab }) => (
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(290px,calc(100vw-86px))] select-none">
    <div className="relative p-1.5 rounded-full bg-[rgba(18,18,18,0.82)] backdrop-blur-3xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center justify-center gap-[7px]">
      {TABS.map(({ id, icon: Icon }) => <button key={id} type="button" aria-label={id} onClick={() => onChangeTab(id)} className="relative w-[42px] h-[42px] rounded-full flex items-center justify-center">
        <span aria-hidden="true" className={`absolute inset-0 rounded-full bg-[#f7f7f7] shadow-[0_1px_4px_rgba(255,255,255,0.12)] transition-opacity duration-100 ease-out ${activeTab === id ? 'opacity-100' : 'opacity-0'}`} />
        <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-100 ease-out ${activeTab === id ? 'text-[#050505]' : 'text-white/60'}`} />
      </button>)}
    </div>
  </nav>
);

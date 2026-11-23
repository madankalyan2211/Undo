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
  <nav style={{ bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 8px))' }} className="fixed left-1/2 -translate-x-1/2 z-40 w-[min(290px,calc(100vw-32px))] select-none">
    <div className="relative flex w-full items-center justify-center gap-[clamp(2px,1.4vw,7px)] rounded-full border border-white/10 bg-[rgba(18,18,18,0.82)] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
      {TABS.map(({ id, icon: Icon }) => <button key={id} type="button" aria-label={id} onClick={() => onChangeTab(id)} className="relative flex aspect-square min-w-0 max-h-[42px] max-w-[42px] flex-1 items-center justify-center rounded-full">
        <span aria-hidden="true" className={`absolute inset-0 rounded-full bg-[#f7f7f7] shadow-[0_1px_4px_rgba(255,255,255,0.12)] transition-opacity duration-100 ease-out ${activeTab === id ? 'opacity-100' : 'opacity-0'}`} />
        <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-100 ease-out ${activeTab === id ? 'text-[#050505]' : 'text-white/60'}`} />
      </button>)}
    </div>
  </nav>
);

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { TodoItem, TodoPriority } from '../types';

const KEY = 'undo_todos_v1';

export const MobileTodosView: React.FC<{ onShowToast: (message: string) => void }> = ({ onShowToast }) => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('focus');

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { setItems([]); }
  }, []);

  const persist = (next: TodoItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const addTask = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    const now = Date.now();
    const item: TodoItem = { id: `todo-${now}-${Math.random().toString(36).slice(2, 6)}`, title: clean, completed: false, createdAt: now, priority, isPermanent: false };
    persist([item, ...items]);
    setTitle('');
    onShowToast('Task added');
  };

  const toggleTask = (id: string) => persist(items.map((item) => item.id === id ? { ...item, completed: !item.completed, completedAt: item.completed ? undefined : Date.now() } : item));
  const removeTask = (id: string) => persist(items.filter((item) => item.id !== id));
  const openTasks = items.filter((item) => !item.completed);
  const doneTasks = items.filter((item) => item.completed);

  return (
    <div className="w-full pb-28 pt-2 flex flex-col gap-5">
      <form onSubmit={addTask} className="rounded-[28px] bg-white/[0.075] backdrop-blur-[32px] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_14px_34px_rgba(0,0,0,0.2)] p-4 flex flex-col gap-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What would help today?" className="w-full bg-transparent text-white placeholder-white/40 text-sm focus:outline-none py-2" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {(['focus', 'light', 'mindful'] as TodoPriority[]).map((level) => <button key={level} type="button" onClick={() => setPriority(level)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase ${priority === level ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>{level}</button>)}
          </div>
          <button type="submit" aria-label="Add task" className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"><Plus className="w-4 h-4" /></button>
        </div>
      </form>

      {openTasks.length === 0 && doneTasks.length === 0 ? (
        <div className="rounded-[28px] bg-white/[0.03] border border-white/10 p-8 text-center">
          <CheckSquare className="w-7 h-7 mx-auto text-white/50 mb-3" />
          <h3 className="font-bold text-white">A little space to begin</h3>
          <p className="text-xs text-white/55 mt-1">Add a small task you’d like to make room for.</p>
        </div>
      ) : (
        <>
          {openTasks.length > 0 && <section className="flex flex-col gap-2"><h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">To do</h2><AnimatePresence>{openTasks.map((item) => <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -18 }} className="rounded-2xl bg-white/[0.075] backdrop-blur-2xl border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.18)] p-3 flex items-center gap-3"><button onClick={() => toggleTask(item.id)} className="w-7 h-7 rounded-lg border border-white/25 flex items-center justify-center text-white/50" aria-label="Complete task"><Check className="w-4 h-4" /></button><span className="flex-1 text-sm text-white">{item.title}</span><span className="text-[9px] uppercase text-white/40">{item.priority}</span><button onClick={() => removeTask(item.id)} className="p-1.5 text-white/40" aria-label="Delete task"><Trash2 className="w-4 h-4" /></button></motion.div>)}</AnimatePresence></section>}
          {doneTasks.length > 0 && <section className="flex flex-col gap-2"><h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Done</h2>{doneTasks.map((item) => <div key={item.id} className="rounded-2xl bg-white/[0.025] border border-white/[0.06] p-3 flex items-center gap-3"><button onClick={() => toggleTask(item.id)} className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center" aria-label="Reopen task"><Check className="w-4 h-4" /></button><span className="flex-1 text-sm text-white/45 line-through">{item.title}</span><button onClick={() => removeTask(item.id)} className="p-1.5 text-white/35" aria-label="Delete task"><Trash2 className="w-4 h-4" /></button></div>)}</section>}
        </>
      )}
    </div>
  );
};

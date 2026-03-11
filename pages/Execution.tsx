
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, DailyExecution, TimeBlock, Distraction, Priority, LifeAreaType } from '../types';
import { LIFE_AREAS_INFO } from '../constants';
import { 
  Zap, Target, Clock, Battery, AlertCircle, Smile, Plus, Trash2, 
  CheckCircle2, Circle, Coffee, Brain, Smartphone, Monitor, Info, X,
  Sun, Moon, ZapOff, ArrowDown, Timer, Play, PenLine
} from 'lucide-react';

// --- Main Execution Page ---

interface ExecutionProps {
  tasks: Task[];
  dailyExecutions: { [date: string]: DailyExecution };
  updateDailyExecution: (date: string, updates: Partial<DailyExecution>) => void;
  toggleTask: (id: string) => void;
  addTask: (title: string, priority: Priority, goalId?: string, date?: string, areaId?: LifeAreaType) => void;
}

const Execution: React.FC<ExecutionProps> = ({ 
  tasks, dailyExecutions, updateDailyExecution, toggleTask, addTask 
}) => {
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState<{ start: string; duration: number; activity: string; type: 'deep' | 'shallow' | 'rest' | 'other' }>({ 
    start: '09:00', 
    duration: 60, 
    activity: '',
    type: 'deep'
  });

  const [newDistraction, setNewDistraction] = useState({ type: 'Social Media', minutes: 15 });

  const dailyData: DailyExecution = useMemo(() => {
    return dailyExecutions[todayStr] || {
      date: todayStr,
      mainFocus: '',
      morningEnergy: 5,
      eveningEnergy: 5,
      mood: 'Neutral',
      timeBlocks: [],
      distractions: [],
      productivityScore: 5,
      notes: '',
      blocker: '',
      improvement: ''
    };
  }, [dailyExecutions, todayStr]);

  const sortedBlocks = useMemo(() => {
    return [...dailyData.timeBlocks].sort((a, b) => a.start.localeCompare(b.start));
  }, [dailyData.timeBlocks]);

  const todayTasks = useMemo(() => tasks.filter(t => t.date.startsWith(todayStr)), [tasks, todayStr]);
  const topPriorities = useMemo(() => todayTasks.filter(t => t.priority === Priority.HIGH).slice(0, 3), [todayTasks]);

  const updateData = (updates: Partial<DailyExecution>) => {
    updateDailyExecution(todayStr, updates);
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSaveBlock = () => {
    if (!newBlock.activity) return;
    const startMins = timeToMinutes(newBlock.start);
    const endMins = startMins + newBlock.duration;
    
    const blockData: TimeBlock = { 
      id: editingBlockId || `tb-${Date.now()}`, 
      start: newBlock.start,
      end: minutesToTime(endMins),
      activity: newBlock.activity,
      type: newBlock.type
    };

    if (editingBlockId) {
      updateData({ 
        timeBlocks: dailyData.timeBlocks.map(b => b.id === editingBlockId ? blockData : b) 
      });
    } else {
      updateData({ timeBlocks: [...dailyData.timeBlocks, blockData] });
    }

    setNewBlock({ start: '09:00', duration: 60, activity: '', type: 'deep' });
    setEditingBlockId(null);
  };

  const startEditing = (block: TimeBlock) => {
    const startMins = timeToMinutes(block.start);
    const endMins = timeToMinutes(block.end);
    setNewBlock({
      start: block.start,
      duration: endMins - startMins,
      activity: block.activity,
      type: block.type as any
    });
    setEditingBlockId(block.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeTimeBlock = (id: string) => {
    updateData({ timeBlocks: dailyData.timeBlocks.filter(b => b.id !== id) });
  };

  const addDistraction = () => {
    const dist: Distraction = { id: `dist-${Date.now()}`, ...newDistraction };
    updateData({ distractions: [...dailyData.distractions, dist] });
    setNewDistraction({ type: 'Social Media', minutes: 15 });
  };

  const removeDistraction = (id: string) => {
    updateData({ distractions: dailyData.distractions.filter(d => d.id !== id) });
  };

  const totalDistractionTime = dailyData.distractions.reduce((sum, d) => sum + d.minutes, 0);

  const TYPE_CONFIG = {
    deep: { color: 'text-blue-600', bg: 'bg-blue-600', ring: 'border-blue-500', icon: <Zap size={14} />, label: 'Deep Work' },
    shallow: { color: 'text-slate-400', bg: 'bg-slate-400', ring: 'border-slate-300', icon: <Clock size={14} />, label: 'Shallow' },
    rest: { color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'border-emerald-400', icon: <Coffee size={14} />, label: 'Recovery' },
    other: { color: 'text-slate-400', bg: 'bg-slate-200', ring: 'border-slate-300', icon: <Info size={14} />, label: 'Other' }
  };

  const formatClockTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const displayH = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return { h: displayH.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), ampm };
  };

  const isCurrentBlock = (block: TimeBlock) => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = timeToMinutes(block.start);
    const endMins = timeToMinutes(block.end);
    return nowMins >= startMins && nowMins <= endMins;
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      
      {/* 1. Daily Focus */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden group"
      >
        <div className="p-6 flex flex-col lg:flex-row items-center gap-8 bg-white/5">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Target size={20} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Primary Objective</h3>
            </div>
            <input 
              type="text"
              placeholder="What is your ONE absolute priority today?"
              value={dailyData.mainFocus}
              onChange={(e) => updateData({ mainFocus: e.target.value })}
              className="w-full bg-transparent text-2xl font-black text-white border-none outline-none placeholder:text-white/10"
            />
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
              <motion.circle 
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={251} 
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * (todayTasks.length > 0 ? todayTasks.filter(t => t.completed).length / todayTasks.length : 0)) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-blue-500" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{todayTasks.length > 0 ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100) : 0}%</span>
              <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Done</span>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Col: Clock-Style Timeline */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Timer size={24} className="text-blue-400" /> Timeline
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Schedule your flow • Sequential blocks</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Reminders Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Inline Schedule Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-[32px] border border-white/20 p-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Info size={12} className="text-blue-400" />
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Tip: Schedule your day in advance to receive automatic reminders at the start of each block.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <input 
                  type="text" 
                  value={newBlock.activity} 
                  onChange={e => setNewBlock({...newBlock, activity: e.target.value})}
                  placeholder="What's the focus?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-blue-400 transition-all placeholder:text-white/20"
                />
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                <Clock size={14} className="text-white/40" />
                <div className="flex items-center gap-1">
                  <select 
                    value={parseInt(newBlock.start.split(':')[0]) % 12 || 12}
                    onChange={e => {
                      const h12 = parseInt(e.target.value);
                      const m = newBlock.start.split(':')[1];
                      const isPM = parseInt(newBlock.start.split(':')[0]) >= 12;
                      const h24 = isPM ? (h12 % 12) + 12 : h12 % 12;
                      setNewBlock({...newBlock, start: `${h24.toString().padStart(2, '0')}:${m}`});
                    }}
                    className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h} className="bg-slate-900">{h}</option>)}
                  </select>
                  <span className="text-white/40 font-bold">:</span>
                  <select 
                    value={newBlock.start.split(':')[1]}
                    onChange={e => {
                      const h = newBlock.start.split(':')[0];
                      setNewBlock({...newBlock, start: `${h}:${e.target.value}`});
                    }}
                    className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none"
                  >
                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                  </select>
                  <button 
                    onClick={() => {
                      const [h24, m] = newBlock.start.split(':').map(Number);
                      const newH24 = h24 >= 12 ? h24 - 12 : h24 + 12;
                      setNewBlock({...newBlock, start: `${newH24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`});
                    }}
                    className="ml-1 px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] font-black text-blue-400 hover:bg-white/20 transition-colors"
                  >
                    {parseInt(newBlock.start.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                  </button>
                </div>
              </div>
              <select 
                value={newBlock.duration}
                onChange={e => setNewBlock({...newBlock, duration: parseInt(e.target.value)})}
                className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-400 cursor-pointer"
              >
                {[15, 30, 45, 60, 90, 120, 180, 240].map(d => (
                  <option key={d} value={d} className="bg-slate-900">{d}m</option>
                ))}
              </select>
              <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                {(['deep', 'shallow', 'rest'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setNewBlock({...newBlock, type})}
                    className={`p-2 rounded-xl transition-all ${newBlock.type === type ? TYPE_CONFIG[type].bg + ' text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    title={TYPE_CONFIG[type].label}
                  >
                    {TYPE_CONFIG[type].icon}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSaveBlock}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
              >
                {editingBlockId ? 'Update' : 'Add'}
              </button>
              {editingBlockId && (
                <button 
                  onClick={() => { setEditingBlockId(null); setNewBlock({ start: '09:00', duration: 60, activity: '', type: 'deep' }); }}
                  className="text-white/40 hover:text-white p-2 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 relative">
            {sortedBlocks.length > 0 ? (
              sortedBlocks.map((block, idx) => {
                const config = TYPE_CONFIG[block.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other;
                const startTime = formatClockTime(block.start);
                const active = isCurrentBlock(block);
                
                return (
                  <motion.div 
                    key={block.id} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative group"
                  >
                    {idx < sortedBlocks.length - 1 && (
                      <div className="absolute left-11 top-24 bottom-[-16px] w-[2px] bg-slate-100 z-0 hidden sm:block"></div>
                    )}
                    
                    <div className={`relative z-10 bg-white/10 backdrop-blur-md rounded-[32px] border ${active ? 'border-blue-400 shadow-xl shadow-blue-500/10' : 'border-white/10 shadow-sm'} p-6 flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-blue-200`}>
                      {/* Clock Time Hero */}
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span className={`text-4xl font-black tabular-nums ${active ? 'text-blue-400' : 'text-white'}`}>
                          {startTime.h}:{startTime.m}
                        </span>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{startTime.ampm}</span>
                      </div>

                      <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                      <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <div className={`p-1.5 rounded-lg ${config.bg} text-white`}>{config.icon}</div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</span>
                          {active && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase ml-2 animate-pulse">
                              <Play size={8} fill="currentColor" /> Live
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-black text-white truncate">{block.activity}</h4>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Until {formatClockTime(block.end).h}:{formatClockTime(block.end).m} {formatClockTime(block.end).ampm}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEditing(block)}
                          className="p-3 bg-slate-50 text-slate-300 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                          title="Edit Block"
                        >
                          <PenLine size={16} />
                        </button>
                        <button 
                          onClick={() => removeTimeBlock(block.id)} 
                          className="p-3 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Block"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <Clock size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold italic">No blocks scheduled. Plan your execution.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Priorities & Energy */}
        <div className="lg:col-span-6 space-y-8">

          {/* Work Type Guide */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-lg"
          >
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
              <Brain size={22} className="text-blue-400" /> Work Type Guide
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-2 bg-blue-600 rounded-xl h-fit text-white"><Zap size={16} /></div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Deep Work</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">High-concentration tasks. No distractions. This is where you create your best value.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-2 bg-slate-400 rounded-xl h-fit text-white"><Clock size={16} /></div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Shallow Work</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">Logistical tasks like emails or admin. Necessary but low cognitive load.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-2 bg-emerald-500 rounded-xl h-fit text-white"><Coffee size={16} /></div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Recovery</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">Recharging your energy. Essential to avoid burnout and maintain focus.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Leakages & Focus */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md p-10 rounded-[40px] border border-white/20 shadow-sm"
          >
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white flex items-center gap-3"><ZapOff size={22} className="text-rose-500" /> Focus Leakages</h3>
               <div className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${totalDistractionTime > 60 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}>
                 {totalDistractionTime}m Wasted
               </div>
             </div>
             <div className="space-y-3">
               {dailyData.distractions.map(d => (
                 <div key={d.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group transition-all hover:border-rose-500/50 border border-transparent">
                   <div className="flex items-center gap-4 text-white/80">
                     <AlertCircle size={16} className="text-rose-400" />
                     <span className="font-bold">{d.type}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-slate-400">-{d.minutes}m</span>
                     <button onClick={() => removeDistraction(d.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                   </div>
                 </div>
               ))}
               <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-6 border-t border-slate-50">
                 <select value={newDistraction.type} onChange={e => setNewDistraction({...newDistraction, type: e.target.value})} className="sm:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[10px] font-black uppercase text-slate-500 outline-none">
                   {['Social Media', 'YouTube', 'Overthinking', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 <input type="number" value={newDistraction.minutes} onChange={e => setNewDistraction({...newDistraction, minutes: parseInt(e.target.value)})} className="sm:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl text-center font-black text-slate-700 outline-none" />
                 <button onClick={addDistraction} className="sm:col-span-3 bg-rose-500 text-white p-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Log</button>
               </div>
             </div>
          </motion.div>

          {/* Energy & Score */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md p-10 rounded-[40px] border border-white/20 shadow-sm space-y-12"
          >
             <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Sun size={16} className="text-amber-500" /> Morning Energy</h4>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 relative h-6 flex items-center">
                         <input type="range" min="1" max="10" value={dailyData.morningEnergy} onChange={e => updateData({ morningEnergy: parseInt(e.target.value) })} className="w-full accent-amber-500 h-2 rounded-full bg-white/10 appearance-none cursor-pointer" />
                         <div className="absolute top-2 left-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full pointer-events-none shadow-[0_0_10px_rgba(251,191,36,0.4)]" style={{ width: `${(dailyData.morningEnergy / 10) * 100}%` }}></div>
                      </div>
                      <span className="text-lg font-black text-white/80">{dailyData.morningEnergy}</span>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Moon size={16} className="text-indigo-400" /> Evening Energy</h4>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 relative h-6 flex items-center">
                         <input type="range" min="1" max="10" value={dailyData.eveningEnergy} onChange={e => updateData({ eveningEnergy: parseInt(e.target.value) })} className="w-full accent-indigo-500 h-2 rounded-full bg-white/10 appearance-none cursor-pointer" />
                         <div className="absolute top-2 left-0 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full pointer-events-none shadow-[0_0_10px_rgba(129,140,248,0.4)]" style={{ width: `${(dailyData.eveningEnergy / 10) * 100}%` }}></div>
                      </div>
                      <span className="text-lg font-black text-white/80">{dailyData.eveningEnergy}</span>
                   </div>
                </div>
             </div>
             <div className="space-y-6 pt-10 border-t border-white/10">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black text-white uppercase tracking-widest">Efficiency Score</h3>
                   <span className="text-3xl font-black text-blue-400">{dailyData.productivityScore}<span className="text-white/20">/10</span></span>
                </div>
                <div className="relative h-6 flex items-center">
                   <input type="range" min="1" max="10" value={dailyData.productivityScore} onChange={e => updateData({ productivityScore: parseInt(e.target.value) })} className="w-full accent-emerald-500 h-3 bg-white/10 rounded-full cursor-pointer appearance-none" />
                   <div className="absolute top-1.5 left-0 h-3 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full pointer-events-none shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${(dailyData.productivityScore / 10) * 100}%` }}></div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Execution;

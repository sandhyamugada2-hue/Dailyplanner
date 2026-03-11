
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklyPlan, LifeAreaType, Priority, Task, Goal, WeeklyReflection } from '../types';
import { LIFE_AREAS_INFO } from '../constants';
import { 
  ChevronLeft, ChevronRight, Sparkles, Plus, CheckCircle2, Circle, AlertCircle, Quote, Smile, Frown, Meh, Heart,
  Brain, Zap, Trash2, Battery, CloudLightning, Sun, PenLine, Star, Trophy, Coffee, X
} from 'lucide-react';

interface PlannerProps {
  selectedWeekId: string;
  weeklyPlans: { [weekId: string]: WeeklyPlan };
  tasks: Task[];
  goals: Goal[];
  setSelectedWeekId: (id: string) => void;
  updateWeeklyPlan: (weekId: string, updates: Partial<WeeklyPlan>) => void;
  addTask: (title: string, priority: Priority, goalId?: string, date?: string, areaId?: LifeAreaType) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ 
  selectedWeekId, weeklyPlans, tasks, goals, setSelectedWeekId, updateWeeklyPlan, addTask, toggleTask, deleteTask
}) => {
  const currentPlan = weeklyPlans[selectedWeekId] || { weekId: selectedWeekId, intent: '', focus: '', priorities: [], allocatedHours: 40 };
  
  const [activeDayInput, setActiveDayInput] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [newTaskArea, setNewTaskArea] = useState<LifeAreaType>(LifeAreaType.PERSONAL);
  
  const [customDrain, setCustomDrain] = useState('');
  const [customEnergizer, setCustomEnergizer] = useState('');

  const MOODS = [
    { label: 'Happy', emoji: '😊', color: 'text-green-500' },
    { label: 'Calm', emoji: '😌', color: 'text-blue-400' },
    { label: 'Neutral', emoji: '😐', color: 'text-slate-400' },
    { label: 'Stressed', emoji: '😫', color: 'text-amber-500' },
    { label: 'Sad', emoji: '😢', color: 'text-indigo-600' }
  ];

  const DRAIN_TAGS = ['Overplanning', 'Social Media', 'Poor Sleep', 'Distractions', 'Toxic Conversation', 'Health Issues'];
  const ENERGY_TAGS = ['Workout', 'Deep Work', 'Family Time', 'Learning', 'Friends', 'Self-care'];

  // Robustly handle missing properties in reflection (migration safety)
  // Fix: Cast the fallback empty object to Partial<WeeklyReflection> to avoid "Property does not exist on type '{}'" errors
  const reflection: WeeklyReflection = useMemo(() => {
    const r = currentPlan.reflection || ({} as Partial<WeeklyReflection>);
    return {
      mood: r.mood || 'Neutral',
      energyLevel: r.energyLevel ?? 5,
      stressLevel: r.stressLevel ?? 3,
      wins: r.wins || [],
      biggestWinIndex: r.biggestWinIndex ?? -1,
      drainedBy: r.drainedBy || [],
      energizedBy: r.energizedBy || [],
      lessonLearned: r.lessonLearned || '',
      productivityRating: r.productivityRating ?? 5,
      happinessRating: r.happinessRating ?? 5,
      balanceRating: r.balanceRating ?? 5,
      improvementFocus: r.improvementFocus || '',
      noteToSelf: r.noteToSelf || ''
    };
  }, [currentPlan.reflection]);

  const updateReflection = (updates: Partial<WeeklyReflection>) => {
    updateWeeklyPlan(selectedWeekId, {
      reflection: { ...reflection, ...updates }
    });
  };

  const getWeekDates = (weekId: string) => {
    const [year, week] = weekId.split('-W');
    const d = new Date(parseInt(year), 0, 1);
    const dayOffset = (parseInt(week) - 1) * 7;
    d.setDate(d.getDate() + dayOffset - (d.getDay() || 7) + 1);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(selectedWeekId), [selectedWeekId]);
  const dateRangeStr = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const weekTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskDateStr = t.date.split('T')[0];
      return weekDates.some(wd => formatDate(wd) === taskDateStr);
    });
  }, [tasks, weekDates]);

  const todayStr = useMemo(() => formatDate(new Date()), []);
  const todaysTasks = useMemo(() => weekTasks.filter(t => t.date.startsWith(todayStr) && !t.completed), [weekTasks, todayStr]);

  const handleWeekChange = (direction: number) => {
    const [year, week] = selectedWeekId.split('-W');
    let nextWeek = parseInt(week) + direction;
    let nextYear = parseInt(year);
    if (nextWeek > 52) { nextWeek = 1; nextYear++; }
    if (nextWeek < 1) { nextWeek = 52; nextYear--; }
    setSelectedWeekId(`${nextYear}-W${nextWeek}`);
  };

  const handleAddTask = (date: Date) => {
    if (newTaskTitle.trim()) {
      const taskDate = `${formatDate(date)}T12:00:00.000Z`;
      addTask(newTaskTitle, newTaskPriority, undefined, taskDate, newTaskArea);
      setNewTaskTitle('');
      setNewTaskPriority(Priority.MEDIUM);
      setNewTaskArea(LifeAreaType.PERSONAL);
      setActiveDayInput(null);
    }
  };

  const toggleTag = (type: 'drained' | 'energized', tag: string) => {
    const list = type === 'drained' ? reflection.drainedBy : reflection.energizedBy;
    const newList = list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag];
    updateReflection(type === 'drained' ? { drainedBy: newList } : { energizedBy: newList });
  };

  const addWin = (winText: string) => {
    if (!winText.trim()) return;
    updateReflection({ wins: [...reflection.wins, winText.trim()] });
  };

  const removeWin = (index: number) => {
    const newWins = reflection.wins.filter((_, i) => i !== index);
    const newBiggest = reflection.biggestWinIndex === index ? -1 : (reflection.biggestWinIndex > index ? reflection.biggestWinIndex - 1 : reflection.biggestWinIndex);
    updateReflection({ wins: newWins, biggestWinIndex: newBiggest });
  };

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* Reminders / Notifications */}
      <AnimatePresence>
        {todaysTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-white animate-pulse">
                <AlertCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Today's Focus Reminder</h4>
                <p className="text-xs text-white/70">You have {todaysTasks.length} pending tasks for today. Let's make it happen!</p>
              </div>
            </div>
            <div className="flex gap-2">
               {todaysTasks.slice(0, 2).map(t => (
                 <div key={t.id} className="hidden sm:block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/80 border border-white/10">
                   {t.title}
                 </div>
               ))}
               {todaysTasks.length > 2 && <span className="text-[10px] font-bold text-white/40 flex items-center">+{todaysTasks.length - 2} more</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-sm overflow-hidden"
      >
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => handleWeekChange(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><ChevronLeft size={20} /></button>
              <div className="text-center min-w-[140px]">
                <h2 className="text-sm font-black text-white/50 uppercase tracking-widest">{selectedWeekId}</h2>
                <p className="text-lg font-bold text-white">{dateRangeStr}</p>
              </div>
              <button onClick={() => handleWeekChange(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="relative group">
              <Sparkles size={16} className="absolute -top-3 -left-3 text-amber-400 animate-bounce" />
              <input 
                type="text" placeholder="What is your primary intent for this week?"
                value={currentPlan.intent}
                onChange={(e) => updateWeeklyPlan(selectedWeekId, { intent: e.target.value })}
                className="w-full bg-transparent text-xl font-bold text-white border-b-2 border-white/10 focus:border-blue-400 outline-none py-2 px-1 transition-all text-center"
              />
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2 text-center">Current Weekly Intent</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 shadow-sm italic text-white/70 text-sm max-w-xs relative backdrop-blur-md">
            <Quote size={16} className="absolute -top-2 -left-2 text-white/10" />
            "Consistency is the foundation of high performance."
          </div>
        </div>
      </motion.div>

      {/* Daily Planner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
        {weekDates.map((date, idx) => {
          const dateStr = formatDate(date);
          const dayTasks = weekTasks.filter(t => t.date.startsWith(dateStr));
          const today = new Date();
          const isToday = today.getFullYear() === date.getFullYear() && 
                          today.getMonth() === date.getMonth() && 
                          today.getDate() === date.getDate();
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`bg-white/10 backdrop-blur-md rounded-2xl border ${isToday ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-lg' : 'border-white/20'} shadow-sm flex flex-col transition-all h-fit overflow-hidden`}
            >
              <div className={`p-4 border-b border-white/10 sticky top-0 z-20 ${isToday ? 'bg-blue-500/20 backdrop-blur-lg' : 'bg-white/5 backdrop-blur-lg'} flex justify-between items-center`}>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-white/50'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                  <p className="text-sm font-bold text-white">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {isToday && <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase">Today</span>}
              </div>
              <div className="p-2 space-y-1">
                <AnimatePresence mode="popLayout">
                  {dayTasks.map(task => {
                    const areaInfo = LIFE_AREAS_INFO[task.areaId || LifeAreaType.PERSONAL];
                    return (
                      <motion.div 
                        key={task.id} 
                        layout
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative"
                      >
                        <button onClick={() => toggleTask(task.id)} className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2 transition-all ${task.completed ? 'bg-white/5 text-white/40' : 'hover:bg-white/10 border border-transparent'}`}>
                          <div className="mt-0.5">{task.completed ? <CheckCircle2 size={12} className="text-green-500" /> : <Circle size={12} className="text-white/20" />}</div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className={`font-medium line-clamp-2 ${task.completed ? 'line-through' : 'text-white/80'}`}>{task.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[8px] font-black uppercase">
                              <span className={task.priority === Priority.HIGH ? 'text-red-500' : task.priority === Priority.MEDIUM ? 'text-amber-500' : 'text-green-500'}>{task.priority}</span>
                              <span className="text-slate-300">•</span>
                              <span className={`px-1 rounded ${areaInfo.color.split(' ')[0]} ${areaInfo.color.split(' ')[1]}`}>{task.areaId || 'Personal'}</span>
                            </div>
                          </div>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50">
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {activeDayInput === idx ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-200 mt-2"
                  >
                    <input autoFocus placeholder="Task name..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask(date)} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none" />
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                      <button onClick={() => setActiveDayInput(null)} className="text-[10px] font-bold text-slate-400">Cancel</button>
                      <button onClick={() => handleAddTask(date)} className="text-[10px] font-bold text-blue-600">Add</button>
                    </div>
                  </motion.div>
                ) : (
                  <button onClick={() => { setActiveDayInput(idx); setNewTaskTitle(''); }} className="w-full p-2 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:text-[#6B8E7B] hover:border-[#6B8E7B] transition-all flex items-center justify-center gap-1 text-[10px] font-bold mt-2">
                    <Plus size={12} /> ADD
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* WEEKLY REFLECTION SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-md rounded-[40px] border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 px-12 py-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
              <Brain size={32} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">Weekly Reflection</h3>
              <p className="text-white/80 font-medium text-sm">Deep analysis for continuous growth.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
            <Sparkles size={16} className="text-amber-300" />
            <span className="text-xs font-black uppercase tracking-widest text-white/90">Review Mode Active</span>
          </div>
        </div>

        <div className="p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Col 1: State */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Smile size={16} className="text-amber-400" /> Current State</h4>
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-[32px] space-y-8 border border-white/10 shadow-xl">
                <div className="flex justify-between items-center gap-2">
                  {MOODS.map(m => (
                    <motion.button 
                      key={m.label} 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateReflection({ mood: m.label })} 
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${reflection.mood === m.label ? 'bg-white/20 shadow-lg ring-2 ring-white/30' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className={`text-[9px] font-black uppercase ${reflection.mood === m.label ? m.color : 'text-white/40'}`}>{m.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-white/70"><span>Energy Level</span><span className="text-emerald-400">{reflection.energyLevel}/10</span></div>
                  <input type="range" min="1" max="10" value={reflection.energyLevel} onChange={e => updateReflection({ energyLevel: parseInt(e.target.value) })} className="w-full accent-emerald-500 h-2 rounded-full bg-white/10 cursor-pointer" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-white/70"><span>Stress Level</span><span className="text-rose-400">{reflection.stressLevel}/10</span></div>
                  <input type="range" min="1" max="10" value={reflection.stressLevel} onChange={e => updateReflection({ stressLevel: parseInt(e.target.value) })} className="w-full accent-rose-500 h-2 rounded-full bg-white/10 cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Star size={16} className="text-blue-400" /> Self-Rating</h4>
              <div className="space-y-6 bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-[32px] border border-white/10 shadow-xl">
                {[{ label: 'Productivity', key: 'productivityRating', color: 'accent-blue-500', icon: <Zap size={12} className="text-blue-400" /> }, 
                  { label: 'Happiness', key: 'happinessRating', color: 'accent-rose-500', icon: <Heart size={12} className="text-rose-400" /> }, 
                  { label: 'Balance', key: 'balanceRating', color: 'accent-emerald-500', icon: <Battery size={12} className="text-emerald-400" /> }].map(rating => (
                  <div key={rating.key} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/70">
                      <span className="flex items-center gap-1.5">{rating.icon} {rating.label}</span>
                      <span className="text-white">{(reflection as any)[rating.key]}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={(reflection as any)[rating.key]} onChange={e => updateReflection({ [rating.key]: parseInt(e.target.value) })} className={`w-full ${rating.color} h-1.5 rounded-full cursor-pointer`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Wins */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> Wins of the Week</h4>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {reflection.wins.map((win, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${reflection.biggestWinIndex === i ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-900/10' : 'bg-white/5 border-white/10 group hover:bg-white/10'}`}
                    >
                      <button onClick={() => updateReflection({ biggestWinIndex: reflection.biggestWinIndex === i ? -1 : i })} className={`p-2 rounded-xl transition-all ${reflection.biggestWinIndex === i ? 'bg-amber-400 text-white shadow-lg' : 'bg-white/10 text-white/30 hover:text-amber-400'}`}><Star size={14} fill={reflection.biggestWinIndex === i ? 'white' : 'none'} /></button>
                      <p className={`flex-1 text-sm font-semibold ${reflection.biggestWinIndex === i ? 'text-amber-100' : 'text-white/80'}`}>{win}</p>
                      <button onClick={() => removeWin(i)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {reflection.wins.length < 5 && (
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Capture a win..." 
                      onKeyDown={e => { if (e.key === 'Enter') { addWin(e.currentTarget.value); e.currentTarget.value = ''; } }} 
                      className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 text-sm font-medium outline-none pr-12 text-white focus:border-blue-400/50 focus:bg-white/10 transition-all" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 group-focus-within:text-blue-400 transition-colors">Enter</div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Sun size={16} className="text-emerald-400" /> Energy Audit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-rose-500/20 to-rose-900/20 p-6 rounded-[32px] border border-rose-500/20 space-y-4 shadow-lg">
                  <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2"><CloudLightning size={12} /> Drains</h5>
                  <div className="flex flex-wrap gap-2">
                    {DRAIN_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag('drained', tag)} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${reflection.drainedBy.includes(tag) ? 'bg-rose-500 text-white border-rose-400 shadow-lg' : 'bg-white/5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'}`}>{tag}</button>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 p-6 rounded-[32px] border border-emerald-500/20 space-y-4 shadow-lg">
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Zap size={12} /> Boosters</h5>
                  <div className="flex flex-wrap gap-2">
                    {ENERGY_TAGS.map(tag => (
                      <button key={tag} onClick={() => toggleTag('energized', tag)} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${reflection.energizedBy.includes(tag) ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' : 'bg-white/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'}`}>{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Focus */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><PenLine size={16} className="text-blue-400" /> Lesson Learned</h4>
              <textarea placeholder="What was your biggest insight?" value={reflection.lessonLearned} onChange={e => updateReflection({ lessonLearned: e.target.value.slice(0, 300) })} className="w-full bg-white/5 border border-white/20 rounded-3xl p-5 text-sm font-medium outline-none min-h-[140px] resize-none text-white focus:border-blue-400/50 focus:bg-white/10 transition-all shadow-xl" />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-amber-400" /> Next Week Focus</h4>
              <input placeholder="One area to improve..." value={reflection.improvementFocus} onChange={e => updateReflection({ improvementFocus: e.target.value })} className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm font-bold text-amber-200 outline-none focus:bg-amber-500/20 transition-all shadow-xl" />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><Heart size={16} className="text-rose-400" /> Message to Future Self</h4>
              <textarea placeholder="Encouragement or truth..." value={reflection.noteToSelf} onChange={e => updateReflection({ noteToSelf: e.target.value })} className="w-full bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 text-sm font-medium italic outline-none min-h-[120px] resize-none text-white focus:bg-rose-500/20 transition-all shadow-xl" />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Planner;


import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Goal, Task, Habit, Priority } from '../types';
import { LIFE_AREAS_INFO } from '../constants';
import { AlertCircle, ArrowUpRight, CheckCircle2, MoreHorizontal, Circle, ListTodo, Plus, CornerDownLeft, ChevronDown } from 'lucide-react';

interface DashboardProps {
  user: { name: string };
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  highlightedId: string | null;
  toggleTask: (id: string) => void;
  toggleHabit: (id: string) => void;
  addHabit: (name: string) => void;
  addTask: (title: string, priority: Priority, goalId?: string) => void;
  getWeeklyLoadStatus: () => any;
  getGoalRisk: (goal: Goal) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user,
  goals, 
  tasks, 
  habits, 
  highlightedId,
  toggleTask, 
  toggleHabit,
  addHabit,
  addTask, 
  getWeeklyLoadStatus, 
  getGoalRisk 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const scrollRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const load = getWeeklyLoadStatus();
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  
  const todaysTasksOnly = tasks.filter(t => t.date.startsWith(today));
  const overdueTasks = tasks.filter(t => !t.completed && t.date.split('T')[0] < today);
  
  const activeTasks = [...overdueTasks, ...todaysTasksOnly.filter(t => !t.completed)];
  const completedTasks = todaysTasksOnly.filter(t => t.completed);
  
  const activeGoals = goals.slice(0, 3);

  useEffect(() => {
    if (highlightedId && scrollRef.current[highlightedId]) {
      scrollRef.current[highlightedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskPriority);
      setNewTaskTitle('');
      setNewTaskPriority(Priority.MEDIUM);
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
      setShowAddHabit(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header with Parallax-like fade */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Good morning, {user.name}.</h2>
          <p className="text-white/70 mt-1 font-medium">Your progress is the result of consistent daily intentions.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Today's Progress</p>
            <p className="text-xl font-black text-white">{todaysTasksOnly.length > 0 ? Math.round((completedTasks.length / todaysTasksOnly.length) * 100) : 0}%</p>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
              <motion.circle 
                cx="24" cy="24" r="20" 
                stroke="url(#progressGradient)" strokeWidth="5" 
                fill="transparent" 
                strokeDasharray={126} 
                initial={{ strokeDashoffset: 126 }}
                whileInView={{ strokeDashoffset: 126 - (126 * (todaysTasksOnly.length > 0 ? completedTasks.length / todaysTasksOnly.length : 0)) }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with staggered entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <CheckCircle2 size={24} />, label: "Completed Today", value: completedTasks.length, color: "green", status: "Winning" },
          { icon: <AlertCircle size={24} />, label: "Time Used", value: `${load.totalHours.toFixed(1)}h`, subValue: "Est.", color: "blue", overload: load.isOverloaded },
          { icon: <ArrowUpRight size={24} />, label: "Habit Streak", value: "12", subValue: "Days", color: "purple" }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`p-2 bg-${stat.color}-500/20 text-${stat.color}-400 rounded-lg group-hover:bg-${stat.color}-500/30 transition-colors`}>{stat.icon}</span>
              {stat.status && <span className="text-xs font-bold text-green-400 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">{stat.status}</span>}
              {stat.overload && <span className="text-xs font-bold text-amber-400 px-2 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 animate-pulse">Overload</span>}
            </div>
            <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {stat.value} {stat.subValue && <span className="text-lg text-white/40 font-normal">{stat.subValue}</span>}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo size={20} className="text-blue-400" />
            Today's Focus
          </h3>
          <div className="flex gap-4">
             <div className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                {activeTasks.length} Active
             </div>
             <div className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {completedTasks.length} Done
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white">Active Tasks</h4>
                <div className="flex gap-2">
                  {(Object.keys(Priority) as (keyof typeof Priority)[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(Priority[p])}
                      className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter transition-all ${
                        newTaskPriority === Priority[p]
                          ? Priority[p] === Priority.HIGH ? 'bg-red-500 text-white' : Priority[p] === Priority.MEDIUM ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleAddTask} className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-[#6B8E7B] transition-colors">
                  <Plus size={16} />
                </div>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Capture new task..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6B8E7B]/20 focus:border-[#6B8E7B] transition-all"
                />
                {newTaskTitle && (
                  <button type="submit" className="absolute inset-y-0 right-3 flex items-center text-[#6B8E7B]">
                    <CornerDownLeft size={16} />
                  </button>
                )}
              </form>
            </div>
            <div className="divide-y divide-slate-50 overflow-y-auto min-h-[100px]">
              {activeTasks.length > 0 ? (
                activeTasks.map((task, idx) => (
                  <motion.div 
                    key={task.id} 
                    ref={el => { scrollRef.current[task.id] = el; }}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`p-3.5 flex items-center gap-3.5 transition-all duration-500 group border-l-4 ${
                      highlightedId === task.id ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200' : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 ${
                        task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-[#6B8E7B]'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 size={14} /> : <Circle size={12} className="text-transparent" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium transition-all truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                        <span className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === Priority.HIGH ? 'bg-red-500' : task.priority === Priority.MEDIUM ? 'bg-amber-500' : 'bg-green-500'
                          }`}></div>
                          {task.priority}
                        </span>
                        <span>•</span>
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">Clear Horizon</p>
                  <p className="text-slate-400 text-xs mt-1">Add a task above to start your flow.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 sticky top-0 z-10">
              <h4 className="font-bold text-white/60">Completed Today</h4>
              <button className="text-[10px] font-bold text-white/40 hover:text-white/60 tracking-widest">CLEAR ALL</button>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto min-h-[100px]">
              {completedTasks.length > 0 ? (
                completedTasks.map((task, idx) => (
                  <motion.div 
                    key={task.id} 
                    ref={el => { scrollRef.current[task.id] = el; }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`p-3.5 flex items-center gap-3.5 transition-all duration-500 group border-l-4 ${
                      highlightedId === task.id ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200' : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 ${
                        task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-[#6B8E7B]'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 size={14} /> : <Circle size={12} className="text-transparent" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium transition-all truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                        <span className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === Priority.HIGH ? 'bg-red-500' : task.priority === Priority.MEDIUM ? 'bg-amber-500' : 'bg-green-500'
                          }`}></div>
                          {task.priority}
                        </span>
                        <span>•</span>
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <div className="w-14 h-14 bg-white/5 text-white/20 rounded-full flex items-center justify-center mb-3">
                    <ListTodo size={24} />
                  </div>
                  <p className="text-white/40 font-medium text-sm">Momentum Building...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Strategic Alignment</h3>
            <button className="text-sm text-blue-400 font-medium hover:underline">Vision Board</button>
          </div>
          <div className="space-y-4">
            {activeGoals.map((goal, idx) => {
              const risk = getGoalRisk(goal);
              return (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                >
                  {risk === 'HIGH' && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-red-500/20">
                      At Risk
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${LIFE_AREAS_INFO[goal.areaId as keyof typeof LIFE_AREAS_INFO].color}`}>
                      {LIFE_AREAS_INFO[goal.areaId as keyof typeof LIFE_AREAS_INFO].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{goal.title}</h4>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider">
                          <span className="text-white/50">Completion</span>
                          <span className="text-white/80">{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${goal.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className={`h-full bg-gradient-to-r ${risk === 'HIGH' ? 'from-rose-500 to-orange-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'}`}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Daily Rituals</h3>
            <button 
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add Ritual
            </button>
          </div>

          <AnimatePresence>
            {showAddHabit && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddHabit}
                className="overflow-hidden"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2 mb-4">
                  <input 
                    autoFocus
                    type="text" 
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    placeholder="New ritual name..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-medium"
                  />
                  <button type="submit" className="text-blue-400 hover:text-blue-300">
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-3">
            {habits.map(habit => (
              <div key={habit.id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center justify-between shadow-sm hover:border-white/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${habit.completedToday ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/20'}`}></div>
                  <div>
                    <p className="font-semibold text-white text-sm">{habit.name}</p>
                    <span className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1">
                      {habit.streak} Day Streak 🔥
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleHabit(habit.id)} 
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    habit.completedToday 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' 
                      : 'border-slate-200 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <CheckCircle2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

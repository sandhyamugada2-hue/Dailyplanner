
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, Priority, LifeAreaType, SubGoal } from '../types';
import { LIFE_AREAS_INFO } from '../constants';
import { Plus, ChevronDown, ChevronRight, X, Calendar, Type, AlignLeft, Target, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface VisionProps {
  goals: Goal[];
  highlightedId: string | null;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  addSubGoal: (goalId: string, title: string) => void;
  toggleSubGoal: (goalId: string, subGoalId: string) => void;
}

const Vision: React.FC<VisionProps> = ({ goals, highlightedId, addGoal, updateGoal, addSubGoal, toggleSubGoal }) => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState<{ [goalId: string]: string }>({});
  const [editingDeadline, setEditingDeadline] = useState<string | null>(null);
  const scrollRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    areaId: LifeAreaType.CAREER,
    priority: Priority.MEDIUM,
    targetDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (highlightedId && scrollRef.current[highlightedId]) {
      setExpanded(prev => prev.includes(highlightedId) ? prev : [...prev, highlightedId]);
      setTimeout(() => {
        scrollRef.current[highlightedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightedId]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: `g-${Date.now()}`,
      ...newGoal,
      progress: 0,
      subGoals: []
    };

    addGoal(goal);
    setIsAddingGoal(false);
    setNewGoal({
      title: '',
      description: '',
      areaId: LifeAreaType.CAREER,
      priority: Priority.MEDIUM,
      targetDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddMilestone = (goalId: string) => {
    const title = milestoneInputs[goalId];
    if (title && title.trim()) {
      addSubGoal(goalId, title.trim());
      setMilestoneInputs(prev => ({ ...prev, [goalId]: '' }));
    }
  };

  const isOverdue = (goal: Goal) => {
    if (goal.progress === 100) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(goal.targetDate);
    target.setHours(0,0,0,0);
    return target < today;
  };

  const areas = Object.values(LifeAreaType);

  return (
    <div className="space-y-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Vision & Strategic Goals</h2>
          <p className="text-white/70 mt-1 font-medium">Define your North Star across every dimension of life.</p>
        </div>
        <button 
          onClick={() => setIsAddingGoal(true)}
          className="bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20 active:scale-95"
        >
          <Plus size={18} />
          New Life Goal
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {areas.map((area, areaIdx) => {
          const areaGoals = goals.filter(g => g.areaId === area);
          const info = LIFE_AREAS_INFO[area as keyof typeof LIFE_AREAS_INFO];
          
          return (
            <motion.div 
              key={area} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: areaIdx * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-sm transition-all hover:border-white/30"
            >
              <div className="p-5 flex items-center justify-between border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${info.color} shadow-sm`}>
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{area}</h3>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{areaGoals.length} Active Objectives</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setNewGoal(prev => ({ ...prev, areaId: area as LifeAreaType }));
                    setIsAddingGoal(true);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {areaGoals.length > 0 ? (
                  areaGoals.map(goal => {
                    const overdue = isOverdue(goal);
                    const isHighlighted = highlightedId === goal.id;
                    return (
                      <div 
                        key={goal.id} 
                        ref={el => { scrollRef.current[goal.id] = el; }}
                        className={`p-5 transition-all duration-500 border-l-4 ${
                          isHighlighted ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-4 group">
                          <button 
                            onClick={() => toggleExpand(goal.id)}
                            className="mt-1 text-slate-300 hover:text-slate-600 transition-colors"
                          >
                            {expanded.includes(goal.id) ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors truncate">{goal.title}</h4>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                                goal.priority === Priority.HIGH ? 'bg-red-50 text-red-600' : 
                                goal.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                              }`}>
                                {goal.priority}
                              </span>
                              {overdue && (
                                <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter bg-red-100 text-red-700 animate-pulse">
                                  <AlertTriangle size={10} /> Overdue
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white/60 mt-1 line-clamp-2">{goal.description}</p>
                            
                            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
                              <div className="flex-1 max-w-xs min-w-[200px]">
                                <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider text-white/50">
                                  <span>Execution progress</span>
                                  <span className="text-white/80">{goal.progress}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${goal.progress}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                    className={`h-full bg-gradient-to-r ${overdue ? 'from-rose-500 to-orange-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'from-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'}`} 
                                  ></motion.div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${overdue ? 'text-red-400' : 'text-white/50'}`}>
                                  <Calendar size={14} />
                                  Deadline: <span className={overdue ? 'font-black' : 'text-white/80'}>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                
                                {overdue && editingDeadline !== goal.id && (
                                  <button 
                                    onClick={() => setEditingDeadline(goal.id)}
                                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                                  >
                                    <Clock size={12} /> Extend Date
                                  </button>
                                )}

                                {editingDeadline === goal.id && (
                                  <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                                    <input 
                                      type="date" 
                                      className="text-[10px] font-bold border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                      defaultValue={goal.targetDate}
                                      onChange={(e) => {
                                        updateGoal(goal.id, { targetDate: e.target.value });
                                        setEditingDeadline(null);
                                      }}
                                    />
                                    <button onClick={() => setEditingDeadline(null)} className="text-slate-400 hover:text-slate-600">
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {expanded.includes(goal.id) && (
                              <div className="mt-6 ml-2 space-y-4 border-l-2 border-white/10 pl-6 animate-in slide-in-from-left-2 duration-300">
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Actionable Subgoals</div>
                                {goal.subGoals.map(sg => (
                                  <div key={sg.id} className="flex items-center gap-3 group/sub">
                                    <button 
                                      onClick={() => toggleSubGoal(goal.id, sg.id)}
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                        sg.completed ? 'bg-[#6B8E7B] border-[#6B8E7B] text-white' : 'border-white/20 group-hover/sub:border-white/30'
                                      }`}
                                    >
                                      {sg.completed && <CheckCircle2 size={12} />}
                                    </button>
                                    <span className={`text-sm ${sg.completed ? 'text-white/40 line-through' : 'text-white/80 font-medium'}`}>{sg.title}</span>
                                  </div>
                                ))}
                                
                                <div className="flex items-center gap-2 pt-2">
                                  <input 
                                    type="text" 
                                    placeholder="Enter new milestone..."
                                    value={milestoneInputs[goal.id] || ''}
                                    onChange={(e) => setMilestoneInputs(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-[#6B8E7B] outline-none flex-1 max-w-xs transition-all"
                                  />
                                  <button 
                                    onClick={() => handleAddMilestone(goal.id)}
                                    className="text-[11px] bg-[#6B8E7B] text-white px-3 py-2 rounded-lg font-black hover:bg-[#5a7b69] flex items-center gap-1.5 transition-all active:scale-95"
                                  >
                                    <Plus size={14} /> ADD
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-white/5 text-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target size={24} />
                    </div>
                    <p className="text-white/40 italic text-sm font-medium">No strategic goals set for {area}.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddingGoal(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1E3A5F] px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight">New Strategic Goal</h3>
                <p className="text-blue-200/70 text-xs font-medium mt-0.5">Define your target and priority</p>
              </div>
              <button onClick={() => setIsAddingGoal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Type size={14} /> Goal Title
                </label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Become a Senior Architect"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft size={14} /> Context & Vision
                </label>
                <textarea 
                  rows={3}
                  value={newGoal.description}
                  onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Why does this matter? What does success look like?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Life Area</label>
                  <select 
                    value={newGoal.areaId}
                    onChange={e => setNewGoal({...newGoal, areaId: e.target.value as LifeAreaType})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  >
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <select 
                    value={newGoal.priority}
                    onChange={e => setNewGoal({...newGoal, priority: e.target.value as Priority})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Target Deadline
                </label>
                <input 
                  type="date" 
                  value={newGoal.targetDate}
                  onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-[#6B8E7B] hover:bg-[#5a7b69] text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/10 transition-all active:scale-95"
                >
                  Create Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vision;

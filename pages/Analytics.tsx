
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Goal, Task, Habit, Priority } from '../types';
import { BrainCircuit, TrendingUp, Target, Activity, Sparkles, Loader2, Check } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AnalyticsProps {
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  addTask: (title: string, priority: Priority, goalId?: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ goals, tasks, habits, addTask }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    text: string;
    actionableTask?: { title: string; priority: Priority };
  } | null>(null);
  const [applied, setApplied] = useState(false);

  // Mock processed data for charts
  const goalStats = [
    { name: 'Completed', value: goals.filter(g => g.progress === 100).length || 0 },
    { name: 'On Track', value: goals.filter(g => g.progress > 50 && g.progress < 100).length },
    { name: 'Behind', value: goals.filter(g => g.progress <= 50).length },
  ];

  const productivityData = [
    { day: 'Mon', completed: 8, target: 10 },
    { day: 'Tue', completed: 12, target: 10 },
    { day: 'Wed', completed: 7, target: 10 },
    { day: 'Thu', completed: 11, target: 10 },
    { day: 'Fri', completed: 9, target: 10 },
    { day: 'Sat', completed: 5, target: 4 },
    { day: 'Sun', completed: 2, target: 2 },
  ];

  const COLORS = ['#6B8E7B', '#1E3A5F', '#E07A5F', '#F4A261'];

  const generateAISuggestion = async () => {
    setIsGenerating(true);
    setApplied(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const dataSummary = {
        goals: goals.map(g => ({ title: g.title, progress: g.progress, area: g.areaId })),
        tasks: tasks.slice(0, 20).map(t => ({ title: t.title, completed: t.completed, priority: t.priority })),
        habits: habits.map(h => ({ name: h.name, streak: h.streak, completedToday: h.completedToday }))
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this user's productivity data and provide one highly specific, actionable insight. 
        Data: ${JSON.stringify(dataSummary)}
        
        Focus on patterns (e.g., "You tend to finish high-priority tasks on Tuesdays") or gaps (e.g., "You haven't worked on your Health goals in 3 days").
        Provide a short insight text and one specific task the user should add to their list today to improve.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The insight text" },
              actionableTask: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Task title" },
                  priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "Task priority" }
                },
                required: ["title", "priority"]
              }
            },
            required: ["text", "actionableTask"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setSuggestion(result);
    } catch (error) {
      console.error("Failed to generate suggestion:", error);
      setSuggestion({
        text: "Based on your recent activity, you're doing great! Try to focus on your top priority goal today to maintain momentum.",
        actionableTask: { title: "Focus on top priority goal", priority: Priority.HIGH }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion?.actionableTask) {
      addTask(suggestion.actionableTask.title, suggestion.actionableTask.priority);
      setApplied(true);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white">Insights & Analytics</h2>
        <p className="text-white/70 mt-1">Advanced behavior patterns and productivity trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trend */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              <h3 className="font-bold text-white">Daily Task Velocity</h3>
            </div>
            <select className="bg-white/5 text-white/70 text-xs font-bold p-2 rounded-lg border border-white/10 outline-none">
              <option className="bg-slate-900">Last 7 Days</option>
              <option className="bg-slate-900">Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(255,255,255,0.4)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(255,255,255,0.4)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Distribution */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Target size={20} className="text-red-400" />
            <h3 className="font-bold text-white">Goal Health</h3>
          </div>
          <div className="h-64 w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {goalStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {goalStats.map((stat, idx) => (
                <div key={stat.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-xs font-medium text-white/50">{stat.name}: <span className="text-white font-bold">{stat.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Habit Consistency Score */}
         <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-green-400" />
            <h3 className="font-bold text-white">Habit Consistency Score</h3>
          </div>
          <div className="flex items-center gap-8">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <motion.circle 
                    cx="64" cy="64" r="58" 
                    stroke="url(#habitGradient)" strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={364} 
                    initial={{ strokeDashoffset: 364 }}
                    whileInView={{ strokeDashoffset: 364 - (364 * 0.72) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="habitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-white">72%</span>
                   <span className="text-[10px] font-bold text-white/50 uppercase">Score</span>
                </div>
             </div>
             <div className="flex-1 space-y-4">
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-white/70">Morning Rituals</span>
                   <span className="font-bold text-white">90%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '90%' }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                   ></motion.div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-white/70">Self-Education</span>
                   <span className="font-bold text-white">45%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '45%' }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-orange-400 to-rose-500 shadow-[0_0_10px_rgba(251,146,60,0.5)]"
                   ></motion.div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-[#1E3A5F] text-white p-8 rounded-2xl shadow-xl shadow-blue-900/10 flex flex-col justify-center relative overflow-hidden group min-h-[240px]">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <BrainCircuit size={24} className="text-blue-200" />
              </div>
              <h3 className="text-xl font-bold">Intelligent Prediction</h3>
            </div>
            
            <AnimatePresence mode="wait">
              {!suggestion && !isGenerating ? (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    Click the button below to generate a personalized productivity insight based on your recent activity patterns.
                  </p>
                  <button 
                    onClick={generateAISuggestion}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md"
                  >
                    <Sparkles size={16} className="text-blue-200" />
                    Generate AI Insight
                  </button>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-8 space-y-4"
                >
                  <Loader2 size={32} className="text-blue-200 animate-spin" />
                  <p className="text-blue-100/70 text-sm font-medium">Analyzing patterns...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="suggestion"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <p className="text-blue-100 text-sm leading-relaxed italic">
                    "{suggestion?.text}"
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleApplySuggestion}
                      disabled={applied}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md ${
                        applied 
                          ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
                          : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                      }`}
                    >
                      {applied ? <Check size={16} /> : <Sparkles size={16} className="text-blue-200" />}
                      {applied ? 'Suggestion Applied' : 'Apply Suggestion'}
                    </button>
                    <button 
                      onClick={generateAISuggestion}
                      className="text-blue-200/50 hover:text-blue-200 text-xs font-bold transition-colors"
                    >
                      Try Another
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

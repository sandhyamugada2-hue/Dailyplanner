
import React, { useState, useEffect, useRef } from 'react';
import { NAV_ITEMS } from '../constants';
import { View, User, Goal, Task, DailyExecution, TimeBlock } from '../types';
import { Search, Bell, LogOut, Target, ListTodo, Scale, X, Command, Zap, AlertCircle, Info, CheckCircle2, History, Play, BellRing } from 'lucide-react';

interface LayoutProps {
  // Use React.ReactNode instead of React.Node
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  user: User;
  goals: Goal[];
  tasks: Task[];
  dailyExecutions: { [date: string]: DailyExecution };
  triggerHighlight: (id: string, view?: View) => void;
}

interface Notification {
  id: string;
  type: 'risk' | 'info' | 'success' | 'alert' | 'live';
  title: string;
  message: string;
  timestamp: string;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'live' | 'info';
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, goals, tasks, dailyExecutions, triggerHighlight }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeToast, setActiveToast] = useState<Toast | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastNotifiedBlockId = useRef<string | null>(null);

  // Update clock every 10 seconds for more responsive "start time" detection
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Derived Notifications and Toast Logic
  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const nowHHmm = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    const todaysExecution = dailyExecutions[todayStr];
    if (todaysExecution && todaysExecution.timeBlocks) {
      const currentBlock = todaysExecution.timeBlocks.find(block => block.start === nowHHmm);
      
      if (currentBlock && lastNotifiedBlockId.current !== currentBlock.id) {
        // Trigger Toast
        setActiveToast({
          id: `toast-${currentBlock.id}`,
          title: 'Time to Start!',
          message: `Scheduled activity: ${currentBlock.activity}`,
          type: 'live'
        });

        // Trigger Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Schedio: Time to start", {
            body: `Starting: ${currentBlock.activity}`,
            icon: '/favicon.ico'
          });
        }
        
        lastNotifiedBlockId.current = currentBlock.id;
      }
    }
  }, [currentTime, dailyExecutions]);

  // Persistent System Notifications
  const notifications: Notification[] = React.useMemo(() => {
    const list: Notification[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const nowHHmm = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    // 1. Current Live Block
    const todaysExecution = dailyExecutions[todayStr];
    if (todaysExecution && todaysExecution.timeBlocks) {
      todaysExecution.timeBlocks.forEach(block => {
        if (block.start === nowHHmm) {
          list.push({
            id: `notif-block-${block.id}`,
            type: 'live',
            title: 'Active Session',
            message: `Current: ${block.activity}`,
            timestamp: 'LIVE'
          });
        }
      });
    }

    // 2. Overdue Goals
    goals.forEach(goal => {
      const target = new Date(goal.targetDate);
      target.setHours(0,0,0,0);
      if (target < today && goal.progress < 100) {
        list.push({
          id: `notif-goal-${goal.id}`,
          type: 'risk',
          title: 'Goal Overdue',
          message: `"${goal.title}" deadline passed.`,
          timestamp: 'Alert'
        });
      }
    });

    // 3. Overdue Tasks
    tasks.forEach(task => {
      if (task.dueDate && !task.completed) {
        const due = new Date(task.dueDate);
        due.setHours(0,0,0,0);
        if (due < today) {
          list.push({
            id: `notif-task-${task.id}`,
            type: 'alert',
            title: 'Task Overdue',
            message: `"${task.title}" was due recently.`,
            timestamp: 'Overdue'
          });
        }
      }
    });

    return list;
  }, [goals, tasks, dailyExecutions, currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowResults(false);
        setShowNotifications(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGoals = searchTerm.trim() 
    ? goals.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];
  const filteredTasks = searchTerm.trim() 
    ? tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())) 
    : [];
  
  const filteredNav = searchTerm.trim()
    ? NAV_ITEMS.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const totalResults = filteredGoals.length + filteredTasks.length + filteredNav.length;

  const handleItemSelect = (id: string, view: View) => {
    triggerHighlight(id, view);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleNavSelect = (view: View) => {
    setView(view);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#020617] to-[#0ea5e9] relative">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
      
      {/* Toast Notification Layer */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-[100] w-80 animate-in slide-in-from-right-8 duration-500">
          <div className="bg-white rounded-[24px] shadow-2xl border border-blue-100 p-5 flex gap-4 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 animate-pulse"></div>
            <div className="p-3 bg-blue-600 rounded-2xl text-white shrink-0 shadow-lg shadow-blue-200">
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest">{activeToast.title}</h5>
                <button onClick={() => setActiveToast(null)} className="text-slate-300 hover:text-slate-500">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-tight mb-3">{activeToast.message}</p>
              <button 
                onClick={() => { setView('execution'); setActiveToast(null); }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-500 py-2 rounded-xl uppercase tracking-widest transition-all"
              >
                Go to Execution View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Backdrop Overlay */}
      {showNotifications && (
        <>
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80] animate-in fade-in duration-300"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-20 right-8 w-80 bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[90] shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-black text-white text-sm tracking-tight">System Alerts</h3>
              <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full uppercase tracking-widest">
                {notifications.length > 0 ? `${notifications.length} Unread` : 'Clear'}
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-white/10">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 size={32} className="text-white/10 mx-auto mb-2" />
                  <p className="text-white/40 text-sm font-medium">All systems clear.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className="p-5 hover:bg-white/5 transition-colors flex gap-4 cursor-pointer group"
                    onClick={() => {
                       if (notif.id.includes('goal')) {
                         handleItemSelect(notif.id.split('-goal-')[1], 'vision');
                       } else if (notif.id.includes('task')) {
                         handleItemSelect(notif.id.split('-task-')[1], 'dashboard');
                       } else if (notif.id.includes('block')) {
                         setView('execution');
                       }
                       setShowNotifications(false);
                    }}
                  >
                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                      notif.type === 'risk' ? 'bg-red-500/20 text-red-400' : 
                      notif.type === 'alert' ? 'bg-amber-500/20 text-amber-400' :
                      notif.type === 'live' ? 'bg-blue-600 text-white animate-pulse' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {notif.type === 'risk' ? <AlertCircle size={16} /> : 
                       notif.type === 'alert' ? <History size={16} /> : 
                       notif.type === 'live' ? <Play size={16} fill="currentColor" /> :
                       <Info size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-black text-white leading-tight group-hover:text-blue-400 transition-colors">{notif.title}</p>
                        <span className="text-[9px] text-white/40 font-black uppercase shrink-0 tracking-tighter">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 text-center">
              <button className="text-[10px] font-black text-white/40 hover:text-white/60 uppercase tracking-[0.2em]">Historical Log</button>
            </div>
          </div>
        </>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/10 flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-9 h-9 bg-gradient-to-br from-[#4A90E2] to-[#7B61FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 overflow-hidden">
              {/* Calendar tabs */}
              <div className="absolute top-1 left-2 w-1 h-1.5 bg-white/40 rounded-full"></div>
              <div className="absolute top-1 right-2 w-1 h-1.5 bg-white/40 rounded-full"></div>
              <CheckCircle2 size={20} className="text-white drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Schedio</h1>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  currentView === item.id 
                    ? 'bg-white/20 text-white shadow-lg border border-white/10' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/10">
          <div 
            onClick={() => setView('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
              currentView === 'settings' 
                ? 'bg-white/20 border-white/20' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
            }`}
          >
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm group-hover:scale-105 transition-transform" />
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate group-hover:text-blue-200 transition-colors">{user.name}</p>
              <p className="text-[10px] text-white/40 font-bold truncate tracking-tighter">{user.email.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/10 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-96" ref={searchRef}>
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 group focus-within:ring-2 focus-within:ring-white/20 focus-within:border-white/30 transition-all">
              <Search size={18} className="text-white/40 group-focus-within:text-white" />
              <input 
                ref={inputRef}
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Find goals, tasks, or views... (⌘K)" 
                className="bg-transparent border-none outline-none text-sm w-full font-medium text-white placeholder:text-white/30"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchTerm && (
              <div className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto z-[60]">
                {totalResults === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-white/40 text-sm font-medium">No results found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-4">
                    {filteredNav.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">App Sections</div>
                        {filteredNav.map(item => (
                          <button 
                            key={item.id} 
                            onClick={() => handleNavSelect(item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors text-left group"
                          >
                            <Zap size={16} className="text-purple-400" />
                            <span className="text-sm font-bold text-white group-hover:text-purple-300">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredGoals.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">Strategic Goals</div>
                        {filteredGoals.map(g => (
                          <button 
                            key={g.id} 
                            onClick={() => handleItemSelect(g.id, 'vision')}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors text-left group"
                          >
                            <Target size={16} className="text-blue-400" />
                            <span className="text-sm font-medium text-white group-hover:text-blue-300">{g.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredTasks.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-bold text-white/50 uppercase tracking-widest">Active Tasks</div>
                        {filteredTasks.map(t => (
                          <button 
                            key={t.id} 
                            onClick={() => handleItemSelect(t.id, 'dashboard')}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors text-left group"
                          >
                            <ListTodo size={16} className="text-[#6B8E7B]" />
                            <span className="text-sm font-medium text-white group-hover:text-[#6B8E7B]">{t.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-white/5 px-4 py-2 border-t border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase">
                     <Command size={10} /> + K to focus
                   </div>
                   <div className="text-[10px] font-bold text-white/30 uppercase">
                     ESC to close
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors relative z-[60] ${showNotifications ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-[#0ea5e9] flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

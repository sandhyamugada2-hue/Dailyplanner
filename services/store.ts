
import { useState, useEffect, useCallback } from 'react';
import { Goal, Task, Habit, WeeklyPlan, User, View, Priority, SubGoal, WeeklyReflection, LifeAreaType, DailyExecution, TimeBlock, Distraction } from '../types';
import { MOCK_USER, MOCK_GOALS, MOCK_TASKS, MOCK_HABITS } from '../mockData';

const STORAGE_KEY = 'lifeos_data_v2_core';

interface AppState {
  user: User;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  weeklyPlans: { [weekId: string]: WeeklyPlan };
  dailyExecutions: { [date: string]: DailyExecution };
  currentView: View;
  selectedWeekId: string;
}

const getWeekId = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

export function useLifeOS() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved ? JSON.parse(saved) : INITIAL_STATE;
    if (!initial.weeklyPlans) initial.weeklyPlans = {};
    if (!initial.dailyExecutions) initial.dailyExecutions = {};
    return { ...initial, selectedWeekId: getWeekId(new Date()) };
  });

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const carryForwardTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    setState(prev => {
      let changed = false;
      const updatedTasks = prev.tasks.map(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        if (!task.completed && taskDate.getTime() < today.getTime()) {
          changed = true;
          const timePart = task.date.includes('T') ? task.date.split('T')[1] : '09:00:00.000Z';
          return {
            ...task,
            date: `${todayStr}T${timePart}`,
            isCarriedForward: true
          };
        }
        return task;
      });
      if (!changed) return prev;
      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  useEffect(() => {
    carryForwardTasks();
    const interval = setInterval(carryForwardTasks, 60000);
    return () => clearInterval(interval);
  }, [state.currentView, carryForwardTasks]);

  const setView = (view: View) => setState(prev => ({ ...prev, currentView: view }));
  const setSelectedWeekId = (id: string) => setState(prev => ({ ...prev, selectedWeekId: id }));

  // Added triggerHighlight method
  const triggerHighlight = useCallback((id: string, view?: View) => {
    if (view) setView(view);
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 3000);
  }, []);

  const toggleTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const addTask = (title: string, priority: Priority = Priority.MEDIUM, goalId?: string, date?: string, areaId?: LifeAreaType) => {
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title,
      goalId,
      areaId: areaId || LifeAreaType.PERSONAL,
      completed: false,
      date: date || `${localDate}T${now.toISOString().split('T')[1]}`,
      estimatedHours: 1,
      priority
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const updateDailyExecution = (date: string, updates: Partial<DailyExecution>) => {
    setState(prev => {
      const existing = prev.dailyExecutions[date] || {
        date,
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
      return {
        ...prev,
        dailyExecutions: {
          ...prev.dailyExecutions,
          [date]: { ...existing, ...updates }
        }
      };
    });
  };

  const updateWeeklyPlan = (weekId: string, updates: Partial<WeeklyPlan>) => {
    setState(prev => {
      const existing = prev.weeklyPlans[weekId] || { weekId, intent: '', focus: '', priorities: [], allocatedHours: 40 };
      return {
        ...prev,
        weeklyPlans: { ...prev.weeklyPlans, [weekId]: { ...existing, ...updates } }
      };
    });
  };

  const toggleHabit = (habitId: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === habitId ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? h.streak - 1 : h.streak + 1 } : h)
    }));
  };

  const addGoal = (goal: Goal) => setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
  
  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      streak: 0,
      completedToday: false,
      history: {}
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };
  
  const updateUser = (updates: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates }
    }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  // Added addSubGoal method
  const addSubGoal = (goalId: string, title: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goalId ? {
        ...g,
        subGoals: [...g.subGoals, { id: `sg-${Date.now()}`, title, completed: false }]
      } : g)
    }));
  };

  // Added toggleSubGoal method
  const toggleSubGoal = (goalId: string, subGoalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const updatedSubGoals = g.subGoals.map(sg => sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg);
        const completedCount = updatedSubGoals.filter(sg => sg.completed).length;
        const progress = updatedSubGoals.length > 0 ? Math.round((completedCount / updatedSubGoals.length) * 100) : g.progress;
        return { ...g, subGoals: updatedSubGoals, progress };
      })
    }));
  };

  // Added getWeeklyLoadStatus helper
  const getWeeklyLoadStatus = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = state.tasks.filter(t => t.date.startsWith(today));
    const totalHours = todaysTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    return {
      totalHours,
      isOverloaded: totalHours > 8
    };
  }, [state.tasks]);

  // Added getGoalRisk helper
  const getGoalRisk = useCallback((goal: Goal) => {
    if (goal.progress === 100) return 'LOW';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(goal.targetDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (target < today) return 'HIGH';
    if (diffDays < 7 && goal.progress < 50) return 'HIGH';
    if (diffDays < 14 && goal.progress < 30) return 'MEDIUM';
    return 'LOW';
  }, []);

  return {
    ...state, highlightedId, setView, setSelectedWeekId, updateWeeklyPlan, toggleTask, deleteTask, addTask, 
    toggleHabit, addHabit, addGoal, updateGoal, updateDailyExecution, triggerHighlight, addSubGoal, toggleSubGoal,
    getWeeklyLoadStatus, getGoalRisk, updateUser
  };
}

const INITIAL_STATE: AppState = {
  user: MOCK_USER,
  goals: MOCK_GOALS,
  tasks: MOCK_TASKS,
  habits: MOCK_HABITS,
  weeklyPlans: {},
  dailyExecutions: {},
  currentView: 'login',
  selectedWeekId: getWeekId(new Date()),
};

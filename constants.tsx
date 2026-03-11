
import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Scale, 
  Settings,
  Briefcase,
  Heart,
  Wallet,
  BookOpen,
  Users,
  Smile
} from 'lucide-react';
import { LifeAreaType, View } from './types';

export const COLORS = {
  base: '#F4F4F2',
  dark: '#111111',
  sage: '#6B8E7B',
  deepBlue: '#1E3A5F',
  mutedCoral: '#E07A5F',
};

export const NAV_ITEMS = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'vision' as View, label: 'Vision & Goals', icon: <Target size={20} /> },
  { id: 'planner' as View, label: 'Weekly Planner', icon: <Calendar size={20} /> },
  { id: 'execution' as View, label: 'Daily Execution', icon: <CheckSquare size={20} /> },
  { id: 'analytics' as View, label: 'Insights', icon: <BarChart3 size={20} /> },
  { id: 'settings' as View, label: 'Settings', icon: <Settings size={20} /> },
];

export const LIFE_AREAS_INFO = {
  [LifeAreaType.CAREER]: { icon: <Briefcase size={18} />, color: 'bg-blue-100 text-blue-700' },
  [LifeAreaType.HEALTH]: { icon: <Heart size={18} />, color: 'bg-green-100 text-green-700' },
  [LifeAreaType.FINANCE]: { icon: <Wallet size={18} />, color: 'bg-amber-100 text-amber-700' },
  [LifeAreaType.LEARNING]: { icon: <BookOpen size={18} />, color: 'bg-purple-100 text-purple-700' },
  [LifeAreaType.RELATIONSHIPS]: { icon: <Users size={18} />, color: 'bg-rose-100 text-rose-700' },
  [LifeAreaType.PERSONAL]: { icon: <Smile size={18} />, color: 'bg-slate-100 text-slate-700' },
};


export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum LifeAreaType {
  CAREER = 'Career',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  LEARNING = 'Learning',
  RELATIONSHIPS = 'Relationships',
  PERSONAL = 'Personal',
}

export interface LifeArea {
  id: string;
  name: LifeAreaType;
  icon: string;
  color: string;
}

export interface SubGoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  areaId: string;
  title: string;
  description: string;
  priority: Priority;
  targetDate: string;
  progress: number;
  subGoals: SubGoal[];
}

export interface Task {
  id: string;
  goalId?: string;
  areaId?: LifeAreaType;
  title: string;
  completed: boolean;
  date: string; // ISO string
  estimatedHours: number;
  priority: Priority;
  isCarriedForward?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history: { [date: string]: boolean };
}

export interface TimeBlock {
  id: string;
  start: string; // "09:00"
  end: string;   // "11:00"
  activity: string;
  type: 'deep' | 'shallow' | 'rest' | 'other';
}

export interface Distraction {
  id: string;
  type: string;
  minutes: number;
}

export interface DailyExecution {
  date: string;
  mainFocus: string;
  morningEnergy: number;
  eveningEnergy: number;
  mood: string;
  timeBlocks: TimeBlock[];
  distractions: Distraction[];
  productivityScore: number;
  notes: string;
  blocker: string;
  improvement: string;
}

export interface WeeklyReflection {
  mood: string;
  energyLevel: number;
  stressLevel: number;
  wins: string[];
  biggestWinIndex: number;
  drainedBy: string[];
  energizedBy: string[];
  lessonLearned: string;
  productivityRating: number;
  happinessRating: number;
  balanceRating: number;
  improvementFocus: string;
  noteToSelf: string;
}

export interface WeeklyPlan {
  weekId: string;
  intent: string;
  focus: string;
  reflection?: WeeklyReflection;
  priorities: string[];
  allocatedHours: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export type View = 'login' | 'signup' | 'dashboard' | 'vision' | 'planner' | 'execution' | 'analytics' | 'settings';

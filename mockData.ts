
import { Priority, LifeAreaType, Goal, Task, Habit, User } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@lifeos.com',
  avatar: 'https://picsum.photos/seed/alex/100/100',
};

export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    areaId: LifeAreaType.CAREER,
    title: 'Promoted to Senior Product Lead',
    description: 'Achieve promotion by demonstrating leadership in major initiatives.',
    priority: Priority.HIGH,
    targetDate: '2025-06-30',
    progress: 45,
    subGoals: [
      { id: 'sg1', title: 'Lead 3 cross-functional projects', completed: true },
      { id: 'sg2', title: 'Complete Executive Leadership cert', completed: false },
      { id: 'sg3', title: 'Mentor 2 junior PMs', completed: false },
    ]
  },
  {
    id: 'g2',
    areaId: LifeAreaType.HEALTH,
    title: 'Run First Marathon',
    description: 'Complete a full marathon in under 4 hours.',
    priority: Priority.MEDIUM,
    targetDate: '2025-04-15',
    progress: 30,
    subGoals: [
      { id: 'sg4', title: 'Run 50km weekly consistently', completed: true },
      { id: 'sg5', title: 'Finish a half marathon prep', completed: false },
    ]
  },
  {
    id: 'g3',
    areaId: LifeAreaType.FINANCE,
    title: 'Build $50k Investment Portfolio',
    description: 'Grow savings through consistent monthly contributions.',
    priority: Priority.HIGH,
    targetDate: '2025-12-31',
    progress: 60,
    subGoals: [
      { id: 'sg6', title: 'Automate $2k monthly transfers', completed: true },
    ]
  }
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Morning deep work on Project Zenith', completed: true, date: new Date().toISOString(), estimatedHours: 3, priority: Priority.HIGH, goalId: 'g1' },
  { id: 't2', title: '10km Interval Run', completed: false, date: new Date().toISOString(), estimatedHours: 1.5, priority: Priority.MEDIUM, goalId: 'g2' },
  { id: 't3', title: 'Review quarterly budget', completed: false, date: new Date().toISOString(), estimatedHours: 1, priority: Priority.LOW, goalId: 'g3' },
];

export const MOCK_HABITS: Habit[] = [
  { id: 'h1', name: 'Meditation (10 min)', streak: 5, completedToday: true, history: {} },
  { id: 'h2', name: 'Read 20 pages', streak: 12, completedToday: false, history: {} },
  { id: 'h3', name: 'Journaling', streak: 3, completedToday: true, history: {} },
];

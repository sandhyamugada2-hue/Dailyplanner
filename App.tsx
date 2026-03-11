
import React from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vision from './pages/Vision';
import Analytics from './pages/Analytics';
import Planner from './pages/Planner';
import Execution from './pages/Execution';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Settings from './pages/Settings';
import { useLifeOS } from './services/store';

const App: React.FC = () => {
  const { 
    currentView, 
    setView, 
    user, 
    goals, 
    tasks, 
    habits, 
    weeklyPlans,
    dailyExecutions,
    selectedWeekId,
    highlightedId,
    triggerHighlight,
    toggleTask, 
    deleteTask,
    toggleHabit,
    addHabit,
    addTask,
    addGoal,
    updateGoal,
    addSubGoal,
    toggleSubGoal,
    getWeeklyLoadStatus, 
    getGoalRisk,
    setSelectedWeekId,
    updateWeeklyPlan,
    updateDailyExecution,
    updateUser
  } = useLifeOS();

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={(email) => {
          updateUser({ email, name: email.split('@')[0] }); // Fallback name from email
          setView('dashboard');
        }} 
        onSwitchToSignUp={() => setView('signup')} 
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignUp 
        onSignUp={(name, email) => {
          updateUser({ name, email });
          setView('dashboard');
        }} 
        onSwitchToLogin={() => setView('login')} 
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            goals={goals} 
            tasks={tasks} 
            habits={habits} 
            highlightedId={highlightedId}
            toggleTask={toggleTask} 
            toggleHabit={toggleHabit}
            addHabit={addHabit}
            addTask={addTask}
            getWeeklyLoadStatus={getWeeklyLoadStatus}
            getGoalRisk={getGoalRisk}
          />
        );
      case 'vision':
        return (
          <Vision 
            goals={goals} 
            highlightedId={highlightedId}
            addGoal={addGoal} 
            updateGoal={updateGoal}
            addSubGoal={addSubGoal} 
            toggleSubGoal={toggleSubGoal} 
          />
        );
      case 'planner':
        return (
          <Planner 
            selectedWeekId={selectedWeekId}
            weeklyPlans={weeklyPlans}
            tasks={tasks}
            goals={goals}
            setSelectedWeekId={setSelectedWeekId}
            updateWeeklyPlan={updateWeeklyPlan}
            addTask={addTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        );
      case 'execution':
        return (
          <Execution 
            tasks={tasks}
            dailyExecutions={dailyExecutions}
            updateDailyExecution={updateDailyExecution}
            toggleTask={toggleTask}
            addTask={addTask}
          />
        );
      case 'analytics':
        return <Analytics goals={goals} tasks={tasks} habits={habits} addTask={addTask} />;
      case 'settings':
        return <Settings user={user} onUpdateUser={updateUser} onLogout={() => setView('login')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">🚀</div>
             <h2 className="text-xl font-bold text-white italic">Module under construction</h2>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setView} 
      user={user}
      goals={goals}
      tasks={tasks}
      dailyExecutions={dailyExecutions}
      triggerHighlight={triggerHighlight}
    >
      {renderView()}
    </Layout>
  );
};

export default App;

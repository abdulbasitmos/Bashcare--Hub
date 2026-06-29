import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import { db } from '../../utils/db';

const GoalTracker = ({ user }) => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await db.getGoals(user.id);
        setGoals(data);
      } catch (err) {
        console.error("Error fetching goals:", err);
      }
    };
    fetchGoals();
  }, [user.id]);

  const toggleGoal = async (goal) => {
    try {
      await db.updateGoal(goal.id, { completed: !goal.completed });
      setGoals(goals.map(g => g.id === goal.id ? { ...g, completed: !g.completed } : g));
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">Health Goals</h3>
          {totalCount > 0 && (
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" fill="none" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" className="text-[#2563EB]" fill="none"
                  strokeDasharray="100.5"
                  strokeDashoffset={100.5 - (100.5 * completionRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[8px] font-black text-slate-700 dark:text-slate-350">{completionRate}%</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => navigate?.('/dashboard/patient/vitals')}
          className="text-[#2563EB] dark:text-teal-400 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border-none bg-transparent"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="space-y-3">
        {goals.length > 0 ? goals.map(goal => (
          <div key={goal.id} className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50 hover:bg-blue-50/30 transition-colors">
            <button onClick={() => toggleGoal(goal)} className="text-[#2563EB] dark:text-teal-400 hover:scale-105 transition-all bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
              {goal.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>
            <span className={`text-xs ${goal.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 dark:text-slate-300 font-bold'}`}>
              {goal.title}
            </span>
          </div>
        )) : (
          <p className="text-xs text-slate-450 italic">No health goals set yet.</p>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;

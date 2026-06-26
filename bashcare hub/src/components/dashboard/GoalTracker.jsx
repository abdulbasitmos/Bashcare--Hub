import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import { db } from '../../utils/db';

const GoalTracker = ({ user }) => {
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

  return (
    <div className="bg-white  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 ">Health Goals</h3>
        <button className="text-[#2563EB] hover:text-blue-700 "><Plus size={20} /></button>
      </div>
      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="flex items-center gap-3">
            <button onClick={() => toggleGoal(goal)} className="text-[#2563EB]  hover:text-blue-700 transition-colors">
              {goal.completed ? <CheckCircle /> : <Circle />}
            </button>
            <span className={goal.completed ? 'line-through text-slate-400' : 'text-slate-700  font-medium'}>
              {goal.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;

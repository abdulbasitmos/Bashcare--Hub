import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, FileUp, PlusCircle } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { name: 'Book Appointment', icon: <Calendar />, path: '/dashboard/patient/book-appointment' },
    { name: 'Message Doctor', icon: <MessageSquare />, path: '/dashboard/patient/messages' },
    { name: 'Upload Document', icon: <FileUp />, path: '/dashboard/patient/documents' },
    { name: 'New Request', icon: <PlusCircle />, path: '/dashboard/patient/new-request' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-slate-800 transition-colors">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-blue-400 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300"
          >
            <div className="mb-2">{action.icon}</div>
            <span className="text-sm font-semibold">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

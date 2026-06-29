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
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/40 rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-650 dark:text-slate-350 hover:text-[#2563EB] dark:hover:text-blue-400 rounded-2xl border border-slate-100/60 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer"
          >
            <div className="mb-2.5 text-[#2563EB] dark:text-blue-400">{action.icon}</div>
            <span className="text-xs font-bold">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

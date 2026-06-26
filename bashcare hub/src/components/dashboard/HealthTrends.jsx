import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', weight: 70 },
  { name: 'Tue', weight: 69.5 },
  { name: 'Wed', weight: 69 },
  { name: 'Thu', weight: 69.2 },
  { name: 'Fri', weight: 68.8 },
  { name: 'Sat', weight: 68.5 },
  { name: 'Sun', weight: 68 },
];

const HealthTrends = () => {
  return (
    <div className="bg-white  p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-gray-200  transition-colors">
      <h3 className="text-xl font-bold text-slate-900  mb-6">Health Trends (Weight)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b' }} />
            <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthTrends;

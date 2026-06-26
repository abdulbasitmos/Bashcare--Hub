import React from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import Typography from '../../components/ui/Typography';
import { Calendar, Users, Activity, FileText } from 'lucide-react';

const PatientDashboard = () => {
  return (
    <DashboardShell role="patient">
      <div className="flex flex-col gap-8">
        <Typography variant="h1" className="text-3xl">Patient Dashboard</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Upcoming Visits" value="3" icon={Calendar} change="+1" />
          <StatCard title="Active Doctors" value="12" icon={Users} change="+0" />
          <StatCard title="Health Score" value="88%" icon={Activity} change="+2%" />
          <StatCard title="Records" value="24" icon={FileText} change="+5" />
        </div>
      </div>
    </DashboardShell>
  );
};

export default PatientDashboard;

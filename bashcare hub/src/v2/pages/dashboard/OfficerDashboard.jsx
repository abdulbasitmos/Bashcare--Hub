import React from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import Typography from '../../components/ui/Typography';
import { ClipboardCheck, Activity, Users, FileText } from 'lucide-react';

const OfficerDashboard = () => {
  return (
    <DashboardShell role="officer">
      <div className="flex flex-col gap-8">
        <Typography variant="h1" className="text-3xl">Officer Dashboard</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Verifications" value="28" icon={ClipboardCheck} change="+4" />
          <StatCard title="Active Consults" value="5" icon={Activity} change="+0" />
          <StatCard title="Staff Managed" value="45" icon={Users} change="+0" />
          <StatCard title="Pending Reports" value="12" icon={FileText} change="-2" />
        </div>
      </div>
    </DashboardShell>
  );
};

export default OfficerDashboard;

import React from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import Typography from '../../components/ui/Typography';
import { Users, FileText, ShieldCheck, Settings } from 'lucide-react';
import StaffManagement from './admin/StaffManagement';

const AdminDashboard = () => {
  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-8">
        <Typography variant="h1" className="text-3xl">Admin Console</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value="1,240" icon={Users} change="+45" />
          <StatCard title="Medical Records" value="5,820" icon={FileText} change="+120" />
          <StatCard title="Security Incidents" value="0" icon={ShieldCheck} change="0" />
          <StatCard title="System Configs" value="12" icon={Settings} change="+1" />
        </div>

        <StaffManagement />
      </div>
    </DashboardShell>
  );
};

export default AdminDashboard;

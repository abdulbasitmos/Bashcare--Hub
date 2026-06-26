import React from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import StatCard from '../../components/dashboard/StatCard';
import Typography from '../../components/ui/Typography';
import { Calendar, Users, Activity, FileText, ClipboardList } from 'lucide-react';

const DoctorDashboard = () => {
  return (
    <DashboardShell role="doctor">
      <div className="flex flex-col gap-8">
        <Typography variant="h1" className="text-3xl">Doctor Dashboard</Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Patients" value="12" icon={Users} change="+2" />
          <StatCard title="Pending Appointments" value="5" icon={Calendar} change="-1" />
          <StatCard title="Consultations" value="8" icon={Activity} change="+1" />
          <StatCard title="Prescriptions" value="15" icon={ClipboardList} change="+3" />
        </div>
      </div>
    </DashboardShell>
  );
};

export default DoctorDashboard;

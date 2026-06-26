import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNav from '../../components/dashboard/TopNav';
import VerificationLobby from '../../components/dashboard/VerificationLobby';
import DoctorProfileSetup from './doctor/DoctorProfileSetup';
import DoctorOverview from './doctor/DoctorOverview';
import AppointmentQueue from './doctor/AppointmentQueue';
import Patients from './doctor/Patients';
import Messages from './doctor/Messages';
import Consultations from './doctor/Consultations';
import Prescriptions from './doctor/Prescriptions';
import Schedule from './doctor/Schedule';
import Settings from './doctor/Settings';
import DoctorMeetings from './doctor/DoctorMeetings';
import DoctorAnalytics from './doctor/DoctorAnalytics';
import ClinicalNotes from './doctor/ClinicalNotes';
import Notifications from './patient/Notifications';
import { db } from '../../utils/db';

const DoctorDashboard = ({ user, logout }) => {
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctorStatus = useCallback(async () => {
    try {
      const doctor = await db.getDoctor(user.id);
      setDoctorStatus(doctor);
    } catch (error) {
      console.error("Error fetching doctor status:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchDoctorStatus();

    // Poll doctor status if the application is pending verification
    let interval = null;
    if (doctorStatus?.status === 'pending') {
      interval = setInterval(fetchDoctorStatus, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchDoctorStatus, doctorStatus?.status]);

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Initializing clinical workspace...</div>;

  // Flow control based on status
  if (doctorStatus?.status === 'pending') {
    return <VerificationLobby user={user} logout={logout} />;
  }

  if (doctorStatus?.status === 'verified' && !doctorStatus?.isProfileComplete) {
    return <DoctorProfileSetup user={user} onComplete={fetchDoctorStatus} />;
  }

  if (doctorStatus?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-8 text-center">
        <div className="max-w-md bg-[var(--bg-secondary)] p-12 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-red-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Rejected</h2>
          <p className="text-slate-500 mb-8">We regret to inform you that your application for a medical account has been rejected by our verification officers.</p>
          <button onClick={logout} className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors">
      <Sidebar role="doctor" onLogout={logout} />

      <div className="flex-grow flex flex-col min-w-0">
        <TopNav userName={user?.name || "Dr. User"} role="doctor" />

        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<DoctorOverview user={user} />} />
            <Route path="queue" element={<AppointmentQueue user={user} />} />
            <Route path="patients" element={<Patients user={user} />} />
            <Route path="messages" element={<Messages user={user} />} />
            <Route path="consultations" element={<Consultations user={user} />} />
            <Route path="prescriptions" element={<Prescriptions user={user} />} />
            <Route path="schedule" element={<Schedule user={user} />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="meetings" element={<DoctorMeetings user={user} />} />
            <Route path="analytics" element={<DoctorAnalytics user={user} />} />
            <Route path="notes" element={<ClinicalNotes user={user} />} />
            <Route path="notifications" element={<Notifications user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;


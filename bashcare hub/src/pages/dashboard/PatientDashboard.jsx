import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNav from '../../components/dashboard/TopNav';
import PatientOverview from './patient/PatientOverview';
import Appointments from './patient/Appointments';
import Doctors from './patient/Doctors';
import Messages from './patient/Messages';
import MedicalRecords from './patient/MedicalRecords';
import Prescriptions from './patient/Prescriptions';
import Notifications from './patient/Notifications';
import Profile from './patient/Profile';
import Settings from './patient/Settings';
import BookAppointment from './patient/BookAppointment';
import DocumentPortal from './patient/DocumentPortal';
import SymptomGuide from './patient/SymptomGuide';
import VitalsTracker from './patient/VitalsTracker';
import Emergency from './patient/Emergency';

const PatientDashboard = ({ user, logout }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen medical-gradient-bg dark:bg-slate-950 transition-colors">
      <Sidebar role="patient" onLogout={logout} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <TopNav userName={user?.name || "John Doe"} role="patient" />
        
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Routes location={location}>
                <Route index element={<PatientOverview user={user} />} />
                <Route path="appointments" element={<Appointments user={user} />} />
                <Route path="doctors" element={<Doctors user={user} />} />
                <Route path="messages" element={<Messages user={user} />} />
                <Route path="records" element={<MedicalRecords user={user} />} />
                <Route path="prescriptions" element={<Prescriptions user={user} />} />
                <Route path="notifications" element={<Notifications user={user} />} />
                <Route path="profile" element={<Profile user={user} />} />
                <Route path="settings" element={<Settings user={user} />} />
                <Route path="book-appointment" element={<BookAppointment user={user} />} />
                <Route path="documents" element={<DocumentPortal user={user} />} />
                <Route path="symptom-guide" element={<SymptomGuide user={user} />} />
                <Route path="vitals" element={<VitalsTracker user={user} />} />
                <Route path="emergency" element={<Emergency user={user} />} />
                <Route path="*" element={<Navigate to="/dashboard/patient" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;

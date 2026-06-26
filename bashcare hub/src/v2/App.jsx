import './styles/watercolor-theme.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PageWrapper from './components/layout/PageWrapper';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/landing/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OfficerDashboard from './pages/dashboard/OfficerDashboard';
import { db } from './utils/db';

const ProtectedRoute = ({ children, role }) => {
  const session = db.getSession();
  if (!session) return <Navigate to="/auth" />;
  if (role && session.user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/dashboard/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/officer" element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;

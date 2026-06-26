import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HighlightStrip from './components/HighlightStrip';
import Partners from './components/Partners';
import Features from './components/Features';
import MissionVision from './components/MissionVision';
import HealthStats from './components/HealthStats';
import WhyChooseUs from './components/WhyChooseUs';

import ServicesGrid from './components/ServicesGrid';
import MembershipPlans from './components/MembershipPlans';
import MobileApp from './components/MobileApp';
import WorkProcess from './components/WorkProcess';
import AppointmentSystem from './components/AppointmentSystem';
import ImageGallery from './components/ImageGallery';
import Testimonials from './components/Testimonials';
import HealthInsights from './components/HealthInsights';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import GetStarted from './pages/GetStarted';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import MockGoogleLogin from './pages/MockGoogleLogin';
import About from './pages/About';
import SearchResults from './pages/SearchResults';
import Contact from './pages/Contact';
import Help from './pages/Help';
import VerifyEmail from './pages/VerifyEmail';
import DoctorProfile from './pages/DoctorProfile';
import Doctors from './pages/Doctors';
import DoctorOnboarding from './pages/DoctorOnboarding';
import { PatientDashboard, DoctorDashboard, AdminDashboard, OfficerDashboard } from './pages/Dashboards';
import { db } from './utils/db';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';

const Home = () => (
  <div className="min-h-screen bg-[var(--bg-primary)]">
    <Navbar />
    <main>
      <Hero />
      <HighlightStrip />
      <Partners />
      <Features />
      <MissionVision />
      <HealthStats />
      <WhyChooseUs />

      <ServicesGrid />
      <MembershipPlans />
      <WorkProcess />
      <AppointmentSystem />
      <MobileApp />
      <ImageGallery />
      <Testimonials />
      <HealthInsights />
      <FAQ />
      <CTA />
    </main>
    <Footer />
    <AIChat />
  </div>
);

function App() {
  const [session, setSession] = useState(() => db.getSession());

  useEffect(() => {
    if (session) {
      db.setSession(session);
    } else {
      db.clearSession();
    }
  }, [session]);

  const handleLogin = (sessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    setSession(null);
  };

  const user = session?.user;

  return (
    <GlobalSettingsProvider>
      <ThemeProvider>
        <SearchProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route 
              path="/auth/:role/:mode" 
              element={<AuthPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/auth-callback" 
              element={<AuthCallback onLogin={handleLogin} />} 
            />
            <Route 
              path="/mock-google-login" 
              element={<MockGoogleLogin />} 
            />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor-onboarding" element={<DoctorOnboarding />} />
            
            {/* Dashboards */}
            <Route 
              path="/dashboard/patient/*" 
              element={user?.role === 'patient' ? <PatientDashboard user={user} logout={handleLogout} /> : <Navigate to="/auth/patient/signin" />} 
            />
            
            <Route 
              path="/dashboard/doctor/*" 
              element={user?.role === 'doctor' ? <DoctorDashboard user={user} logout={handleLogout} /> : <Navigate to="/auth/doctor/signin" />} 
            />
            
            <Route 
              path="/dashboard/admin/*" 
              element={user?.role === 'admin' ? <AdminDashboard user={user} logout={handleLogout} /> : <Navigate to="/get-started" />} 
            />
            
            <Route 
              path="/dashboard/officer/*" 
              element={user?.role === 'officer' ? <OfficerDashboard user={user} logout={handleLogout} /> : <Navigate to="/get-started" />} 
            />
          </Routes>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  </GlobalSettingsProvider>
  );
}

export default App;

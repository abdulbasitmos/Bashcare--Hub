import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, ChevronDown, Heart, Users, Award, Clock, Stethoscope, Baby, HeartPulse, Ambulance, Syringe, Brain } from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import './LandingV2.css';

/* --- Image imports --- */
import doctorHeroImg from '../assets/doctor_hero.jpg';
import ambulanceImg from '../assets/ambulance.jpg';
import pediatricImg from '../assets/pediatric.jpg';
import cardiologyImg from '../assets/cardiology.jpg';
import mriImg from '../assets/mri.jpg';
import surgeryImg from '../assets/surgery.jpg';

/* --- Import ALL original Home components (nothing removed) --- */
import Navbar from '../components/Navbar';
import HighlightStrip from '../components/HighlightStrip';
import Partners from '../components/Partners';
import Features from '../components/Features';
import MissionVision from '../components/MissionVision';
import HealthStats from '../components/HealthStats';
import WhyChooseUs from '../components/WhyChooseUs';
import ServicesGrid from '../components/ServicesGrid';
import MembershipPlans from '../components/MembershipPlans';
import MobileApp from '../components/MobileApp';
import WorkProcess from '../components/WorkProcess';
import AppointmentSystem from '../components/AppointmentSystem';
import ImageGallery from '../components/ImageGallery';
import Testimonials from '../components/Testimonials';
import HealthInsights from '../components/HealthInsights';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import AIChat from '../components/AIChat';

/* ===== IntersectionObserver hook for scroll animations ===== */
const useScrollAnim = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

/* ===== Animated Counter ===== */
const AnimCounter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ===== Departments Data ===== */
const departments = [
  { name: 'Emergency Care', icon: ambulanceImg, color: '#e6fffa' },
  { name: 'Pediatric Department', icon: pediatricImg, color: '#ebf8ff' },
  { name: 'Cardiology', icon: cardiologyImg, color: '#e6fffa' },
  { name: 'Neurology', icon: null, lucide: Brain, color: '#f0fff4' },
  { name: 'Orthopedics', icon: null, lucide: Stethoscope, color: '#faf5ff' },
];

/* ===== Services Data ===== */
const services = [
  {
    title: 'Advanced Diagnostics',
    desc: 'Advanced diagnostics with best modern imaging machine for accurate results and faster treatment.',
    img: mriImg,
  },
  {
    title: 'Specialized Surgeries',
    desc: 'Specialized surgeries with cruiter and medical cart equipments by expert surgeons.',
    img: surgeryImg,
  },
  {
    title: 'Preventive Care',
    desc: 'Comprehensive health screenings and preventive programs to keep you healthy.',
    img: null,
    lucideIcon: HeartPulse,
  },
];

/* ===== NAV LINKS ===== */
const navLinks = [
  { label: 'Home', href: '/', active: true },
  { label: 'Services', href: '#services' },
  { label: 'Departments', href: '#departments' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Contact', href: '/contact' },
];

/* ===== MAIN COMPONENT ===== */
const LandingV2 = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [dateValue, setDateValue] = useState('');

  /* Scroll animation refs */
  const [deptRef, deptVisible] = useScrollAnim();
  const [servRef, servVisible] = useScrollAnim();
  const [statRef, statVisible] = useScrollAnim();
  const [ctaRef, ctaVisible] = useScrollAnim();

  const handleBookNow = () => {
    navigate('/get-started');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ===== ORIGINAL NAVBAR (restored — used across all pages) ===== */}
      <Navbar />

      {/* ===== NEW DESIGN: HERO WRAPPER (gradient bg from reference image) ===== */}
      <div className="lv2">
        <div className="lv2-hero-wrapper">

          {/* --- Hero Content --- */}
          <div className="lv2-hero">
            <div className="lv2-hero-text">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Your Health,<br />
                <em>Our Priority</em>
              </motion.h1>
              <motion.p
                className="lv2-hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                Compassionate Care for You and Your Family.
                Experience world-class healthcare with our team of expert doctors.
              </motion.p>
              <motion.div
                className="lv2-hero-cta-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <button className="lv2-btn-book" onClick={handleBookNow}>
                  Get Started
                </button>
                <Link to="/about" className="lv2-btn-outline">
                  Learn More
                </Link>
              </motion.div>
            </div>

            <div className="lv2-hero-image">
              <motion.img
                src={doctorHeroImg}
                alt="Professional doctors at BashcareHub"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />

              {/* Floating badges */}
              <div className="lv2-hero-badge badge-top">
                <div className="lv2-hero-badge-icon teal">
                  <Heart size={20} />
                </div>
                <div className="lv2-hero-badge-text">
                  <strong>500+ Doctors</strong>
                  <span>Available 24/7</span>
                </div>
              </div>

              <div className="lv2-hero-badge badge-bottom">
                <div className="lv2-hero-badge-icon blue">
                  <Users size={20} />
                </div>
                <div className="lv2-hero-badge-text">
                  <strong>50k+ Patients</strong>
                  <span>Trusted by families</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOOKING WIDGET ===== */}
        <div className="lv2-booking">
          <div className="lv2-booking-field">
            <label>Department</label>
            <div className="lv2-booking-input">
              <Stethoscope size={18} />
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                <option value="emergency">Emergency Care</option>
                <option value="pediatric">Pediatric</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
              </select>
            </div>
          </div>

          <div className="lv2-booking-field">
            <label>Doctor</label>
            <div className="lv2-booking-input">
              <Users size={18} />
              <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                <option value="">Select Doctor</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-johnson">Dr. Johnson</option>
                <option value="dr-williams">Dr. Williams</option>
              </select>
            </div>
          </div>

          <div className="lv2-booking-field">
            <label>Date</label>
            <div className="lv2-booking-input">
              <Calendar size={18} />
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                placeholder="Pick a date"
              />
            </div>
          </div>

          <button className="lv2-btn-book" onClick={handleBookNow}>
            Book Now
          </button>
        </div>

        {/* ===== OUR DEPARTMENTS (new design from reference image) ===== */}
        <section className="lv2-section" id="departments" ref={deptRef}>
          <h2 className="lv2-section-title">Our Departments</h2>
          <p className="lv2-section-subtitle">
            Explore our wide range of specialized medical departments, each staffed with world‑class professionals.
          </p>
          <div className="lv2-departments-grid">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.name}
                className="lv2-dept-card"
                initial={{ opacity: 0, y: 30 }}
                animate={deptVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {dept.icon ? (
                  <img src={dept.icon} alt={dept.name} className="lv2-dept-icon" />
                ) : (
                  <div
                    className="lv2-dept-icon"
                    style={{
                      background: dept.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <dept.lucide size={36} color="#319795" />
                  </div>
                )}
                <h3>{dept.name}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== FEATURED SERVICES (new design from reference image) ===== */}
        <section className="lv2-services-bg" id="services" ref={servRef}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <h2 className="lv2-section-title">Featured Services</h2>
            <p className="lv2-section-subtitle">
              Cutting‑edge medical services designed to provide you the best care possible.
            </p>
          </div>
          <div className="lv2-services-scroll">
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                className="lv2-service-card"
                initial={{ opacity: 0, x: 40 }}
                animate={servVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="lv2-service-img-wrapper">
                  {svc.img ? (
                    <img src={svc.img} alt={svc.title} className="lv2-service-img" />
                  ) : (
                    <div
                      className="lv2-service-img"
                      style={{
                        background: 'linear-gradient(135deg, #e6fffa, #ebf8ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svc.lucideIcon size={64} color="#319795" />
                    </div>
                  )}
                </div>
                <div className="lv2-service-info">
                  <h3>{svc.title}</h3>
                  <p>{svc.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="lv2-section" ref={statRef}>
          <h2 className="lv2-section-title">Why Families Trust Us</h2>
          <p className="lv2-section-subtitle">
            Numbers that reflect our commitment to delivering the finest healthcare.
          </p>
          <div className="lv2-stats" style={{ padding: 0 }}>
            {[
              { num: 500, suffix: '+', label: 'Expert Doctors' },
              { num: 50, suffix: 'k+', label: 'Happy Patients' },
              { num: 20, suffix: '+', label: 'Departments' },
              { num: 15, suffix: '+', label: 'Years Experience' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="lv2-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={statVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="lv2-stat-number">
                  <AnimCounter end={s.num} suffix={s.suffix} />
                </div>
                <div className="lv2-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      {/* === END of new LV2 design sections === */}

      {/* ===== ALL ORIGINAL HOME SECTIONS RESTORED BELOW ===== */}
      <main>
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

      {/* ===== ORIGINAL FOOTER & AI CHAT (restored) ===== */}
      <Footer />
      <AIChat />
    </div>
  );
};

export default LandingV2;

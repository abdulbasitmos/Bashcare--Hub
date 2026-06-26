import React, { createContext, useContext, useEffect, useState } from 'react';

const GlobalSettingsContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  language: 'en',
  setLanguage: () => {},
  t: () => {},
});

export const GlobalSettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('bashcare_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('bashcare_lang') || 'en');

  const translations = {
    en: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      help: 'Help',
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      doctors: 'Doctors',
      messages: 'Messages',
      records: 'Medical Records',
      prescriptions: 'Prescriptions',
      notifications: 'Notifications',
      settings: 'Settings',
      logout: 'Logout',
      welcome: 'Welcome',
      search: 'Search',
      patients: 'My Patients',
      queue: 'Patient Queue',
      consultations: 'Consultations',
      schedule: 'Schedule',
      verifications: 'Verification Monitor',
      staff: 'Staff Management',
      departments: 'Departments',
      finance: 'Billing & Finance',
      logs: 'System Logs',
      audit: 'Audit Reports',
      directory: 'Verified Directory',
      pending: 'Pending Verifications',
      overview: 'Overview',
      profile: 'Profile',
      users: 'User Management',
      monitoring: 'Request Monitoring',
      vitals: 'Health Tracker',
      symptomGuide: 'Symptom Guide',
    },
    fr: {
      home: 'Accueil',
      services: 'Services',
      about: 'À propos',
      contact: 'Contact',
      help: 'Aide',
      dashboard: 'Tableau de bord',
      appointments: 'Rendez-vous',
      doctors: 'Médecins',
      messages: 'Messages',
      records: 'Dossiers médicaux',
      prescriptions: 'Ordonnances',
      notifications: 'Notifications',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      welcome: 'Bienvenue',
      search: 'Recherche',
      patients: 'Mes patients',
      queue: 'File d\'attente',
      consultations: 'Consultations',
      schedule: 'Emploi du temps',
      verifications: 'Moniteur de vérification',
      staff: 'Gestion du personnel',
      departments: 'Départements',
      finance: 'Facturation et finance',
      logs: 'Journaux système',
      audit: 'Rapports d\'audit',
      directory: 'Répertoire vérifié',
      pending: 'Vérifications en attente',
      overview: 'Aperçu',
      profile: 'Profil',
      users: 'Gestion des utilisateurs',
      monitoring: 'Suivi des demandes',
      vitals: 'Suivi de Santé',
      symptomGuide: 'Guide des Symptômes',
    },
    es: {
      home: 'Inicio',
      services: 'Servicios',
      about: 'Acerca de',
      contact: 'Contacto',
      help: 'Ayuda',
      dashboard: 'Panel de control',
      appointments: 'Citas',
      doctors: 'Médicos',
      messages: 'Mensajes',
      records: 'Registros médicos',
      prescriptions: 'Recetas',
      notifications: 'Notificaciones',
      settings: 'Ajustes',
      logout: 'Cerrar sesión',
      welcome: 'Bienvenido',
      search: 'Buscar',
      patients: 'Mis pacientes',
      queue: 'Cola de pacientes',
      consultations: 'Consultas',
      schedule: 'Horario',
      verifications: 'Monitor de verificación',
      staff: 'Gestión de personal',
      departments: 'Departamentos',
      finance: 'Facturación y finanzas',
      logs: 'Registros del sistema',
      audit: 'Informes de auditoría',
      directory: 'Directorio verificado',
      pending: 'Verificaciones pendientes',
      overview: 'Resumen',
      profile: 'Perfil',
      users: 'Gestión de usuarios',
      monitoring: 'Monitoreo de solicitudes',
      vitals: 'Seguimiento de Salud',
      symptomGuide: 'Guía de Síntomas',
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bashcare_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bashcare_lang', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const t = (key) => translations[language][key] || key;

  return (
    <GlobalSettingsContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => useContext(GlobalSettingsContext);

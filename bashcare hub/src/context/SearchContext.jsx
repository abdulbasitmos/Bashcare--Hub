import React, { createContext, useContext, useState, useMemo } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // All searchable items across the website
  const allSearchableItems = useMemo(() => [
    // Services
    { type: 'service', title: 'Cardiology', desc: 'Expert care for your heart and cardiovascular system.', category: 'Specialty', link: '/services' },
    { type: 'service', title: 'Neurology', desc: 'Specialized treatment for brain and nervous system disorders.', category: 'Specialty', link: '/services' },
    { type: 'service', title: 'Pediatrics', desc: 'Compassionate medical care for infants, children, and adolescents.', category: 'Specialty', link: '/services' },
    { type: 'service', title: 'Orthopedics', desc: 'Advanced care for bones, joints, and muscular system.', category: 'Specialty', link: '/services' },
    { type: 'service', title: 'Dermatology', desc: 'Comprehensive treatment for skin, hair, and nail conditions.', category: 'Specialty', link: '/services' },
    { type: 'service', title: 'General Medicine', desc: 'Routine checkups and management of overall health.', category: 'Specialty', link: '/services' },
    
    // Pages
    { type: 'page', title: 'Home', desc: 'Welcome to Bashcare Hub - Your trusted healthcare partner', category: 'Pages', link: '/' },
    { type: 'page', title: 'Services', desc: 'Browse our comprehensive medical services and specialties', category: 'Pages', link: '/services' },
    { type: 'page', title: 'About Us', desc: 'Learn about our mission, vision, and team', category: 'Pages', link: '/about' },
    { type: 'page', title: 'Contact', desc: 'Get in touch with our support team', category: 'Pages', link: '/contact' },
    { type: 'page', title: 'Help', desc: 'Find answers and support documentation', category: 'Pages', link: '/help' },
    { type: 'page', title: 'Get Started', desc: 'Sign up and begin your health journey', category: 'Pages', link: '/get-started' },
    
    // Features
    { type: 'feature', title: 'BMI Calculator', desc: 'Calculate your Body Mass Index and get health insights', category: 'Tools', link: '/services' },
    { type: 'feature', title: 'Appointment Booking', desc: 'Book appointments with specialists instantly', category: 'Tools', link: '/services' },
    { type: 'feature', title: 'Health Records', desc: 'Manage your medical records securely', category: 'Tools', link: '/services' },
    { type: 'feature', title: 'Prescription Management', desc: 'Track and manage your prescriptions', category: 'Tools', link: '/services' },
    { type: 'feature', title: 'Doctor Chat', desc: 'Chat with healthcare professionals', category: 'Tools', link: '/services' },
  ], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allSearchableItems]);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, searchResults, allSearchableItems }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

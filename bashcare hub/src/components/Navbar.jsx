import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import { Sun, Moon, Search, Globe, ChevronDown, LayoutDashboard, Settings, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { LogoIcon } from './Logo';
import { db } from '../utils/db';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useGlobalSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(() => db.getSession());
  const user = session?.user;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const authDropdownRef = useRef(null);

  const handleLogout = () => {
    db.clearSession();
    setSession(null);
    window.location.reload();
  };
  const searchInputRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLanguageDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <nav 
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'top-2 md:top-4 px-4 sm:px-6 lg:px-8' 
          : 'top-0 px-0'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto transition-all duration-500 ${
          isScrolled 
            ? 'bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] border border-gray-100/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8' 
            : 'bg-white dark:bg-slate-950/45 backdrop-blur-md border-b border-gray-150/20 px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-14 md:h-18' : 'h-16 md:h-22'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <LogoIcon 
              className={`transition-all duration-500 ${isScrolled ? 'h-8 w-8 md:h-10 md:w-10' : 'h-9 w-9 md:h-12 md:w-12'}`}
              animated={true}
            />
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tight transition-all duration-500">
              <span className="text-[var(--color-primary)]">Bashcare</span><span className="text-slate-800 dark:text-slate-200">Hub</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-6 xl:ml-10 flex items-center space-x-1 lg:space-x-2">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'text-[var(--color-primary)] bg-slate-100/80 dark:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {t('home')}
              </Link>
              <Link 
                to="/doctors" 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === '/doctors' 
                    ? 'text-[var(--color-primary)] bg-slate-100/80 dark:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {t('doctors')}
              </Link>
              <Link 
                to="/about" 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === '/about' 
                    ? 'text-[var(--color-primary)] bg-slate-100/80 dark:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {t('about')}
              </Link>
              <Link 
                to="/contact" 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === '/contact' 
                    ? 'text-[var(--color-primary)] bg-slate-100/80 dark:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {t('contact')}
              </Link>
              <Link 
                to="/help" 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === '/help' 
                    ? 'text-[var(--color-primary)] bg-slate-100/80 dark:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {t('help')}
              </Link>
            </div>
          </div>
          

          <div className="flex items-center gap-1.5 md:gap-3">
          {/* Language Switcher - hidden on mobile */}
            <div className="relative hidden md:block" ref={langDropdownRef}>
              {/* Language flags config */}
              {(() => {
                const langs = {
                  en: { flag: '🇺🇸', label: 'EN' },
                  fr: { flag: '🇫🇷', label: 'FR' },
                  es: { flag: '🇪🇸', label: 'ES' },
                };
                const current = langs[language] || langs.en;
                return (
                  <>
                    <button 
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className="px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/80 dark:hover:bg-slate-700/85 border border-transparent dark:border-slate-800/30"
                    >
                      <span className="text-lg leading-none">{current.flag}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{current.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showLanguageDropdown && (
                      <div className="absolute right-0 mt-3 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-150/50 dark:border-slate-800/50 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Language</p>
                        {[
                          { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
                          { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français' },
                          { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
                        ].map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => { setLanguage(lang.code); setShowLanguageDropdown(false); }}
                            className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 ${language === lang.code ? 'bg-blue-50/50 dark:bg-slate-800/60' : ''}`}
                          >
                            <span className="text-xl leading-none">{lang.flag}</span>
                            <div>
                              <p className={`text-sm font-bold leading-none ${language === lang.code ? 'text-[var(--color-primary)]' : 'text-slate-700 dark:text-slate-200'}`}>{lang.native}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{lang.name}</p>
                            </div>
                            {language === lang.code && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Theme Toggle - hidden on mobile */}
            <button 
              onClick={toggleTheme}
              className="hidden md:flex rounded-full transition-all duration-300 items-center justify-center cursor-pointer p-1.5 md:p-2.5 bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/80 dark:hover:bg-slate-700/85 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-800/30"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5 md:w-5 md:h-5" /> : <Sun className="w-4.5 h-4.5 md:w-5 md:h-5" />}
            </button>

            {/* Profile / Auth Dropdown */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 rounded-full p-1 md:pr-3 transition-all duration-300 bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/80 dark:hover:bg-slate-750/85 border border-transparent dark:border-slate-800/30"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                    {user.profileImage || user.profilePicture ? (
                      <img src={user.profileImage || user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user.name || "U").charAt(0)
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''} text-slate-700 dark:text-slate-200`} />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 dark:border-slate-800/50 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 mb-1 bg-gray-50/50 dark:bg-slate-800/30">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || "User"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role} Account</p>
                    </div>
                    
                    <Link 
                      to={`/dashboard/${user.role}`}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-teal-400 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard Home
                    </Link>
                    
                    <Link 
                      to={`/dashboard/${user.role}/settings`}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-teal-400 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Settings size={16} />
                      Account Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
                    
                    <Link 
                      to={`/help`}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-teal-400 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <HelpCircle size={16} />
                      Help & Support
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={authDropdownRef}>
                <button 
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className={`bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-md transition-all duration-300 whitespace-nowrap text-xs md:text-sm flex items-center gap-1.5 cursor-pointer px-4 py-2 md:px-6 md:py-2.5`}
                >
                  <span>Sign In / Sign Up</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showAuthDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAuthDropdown && (
                  <div className="absolute right-0 mt-3 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-150/50 dark:border-slate-800/50 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 mb-1 bg-gray-50/50 dark:bg-slate-800/30">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient Portal</p>
                    </div>

                    <Link 
                      to="/auth/patient/signin"
                      className="block px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      👤 Patient Sign In
                    </Link>

                    <Link 
                      to="/auth/patient/signup"
                      className="block px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      ➕ Patient Sign Up
                    </Link>

                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
                    <div className="px-4 py-1.5">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doctor Portal</p>
                    </div>

                    <Link 
                      to="/auth/doctor/signin"
                      className="block px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      🩺 Doctor Sign In
                    </Link>

                    <Link 
                      to="/get-started"
                      className="block px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      ➕ Join as Doctor
                    </Link>

                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
                    <div className="px-4 py-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Staff Access</p>
                    </div>

                    <Link 
                      to="/auth/admin/signin"
                      className="block px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      🛡️ System Admin Login
                    </Link>

                    <Link 
                      to="/auth/officer/signin"
                      className="block px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 hover:text-[var(--color-primary)] dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
                      onClick={() => setShowAuthDropdown(false)}
                    >
                      🔍 Officer Login
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer bg-slate-100/80 hover:bg-slate-200/85 dark:bg-slate-800/80 dark:hover:bg-slate-700/85 text-slate-700 dark:text-slate-200 border border-transparent dark:border-slate-800/30"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Right Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-gray-100/50 dark:border-slate-800/50 z-50 md:hidden flex flex-col justify-between"
            >
              {/* Header and Links */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <LogoIcon className="h-8 w-8" animated={true} />
                    <span className="text-lg font-black tracking-tight">
                      <span className="text-[var(--color-primary)]">Bashcare</span>
                      <span className="text-slate-800 dark:text-slate-200">Hub</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  <Link 
                    to="/" 
                    className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      location.pathname === '/' 
                        ? 'bg-blue-50/80 text-[var(--color-primary)] dark:bg-slate-800/80 dark:text-[var(--color-primary)]' 
                        : 'text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('home')}
                  </Link>
                  <Link 
                    to="/doctors" 
                    className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      location.pathname === '/doctors' 
                        ? 'bg-blue-50/80 text-[var(--color-primary)] dark:bg-slate-800/80 dark:text-[var(--color-primary)]' 
                        : 'text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('doctors')}
                  </Link>
                  <Link 
                    to="/about" 
                    className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      location.pathname === '/about' 
                        ? 'bg-blue-50/80 text-[var(--color-primary)] dark:bg-slate-800/80 dark:text-[var(--color-primary)]' 
                        : 'text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('about')}
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      location.pathname === '/contact' 
                        ? 'bg-blue-50/80 text-[var(--color-primary)] dark:bg-slate-800/80 dark:text-[var(--color-primary)]' 
                        : 'text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('contact')}
                  </Link>
                  <Link 
                    to="/help" 
                    className={`block px-4 py-3 rounded-2xl text-base font-semibold transition-colors ${
                      location.pathname === '/help' 
                        ? 'bg-blue-50/80 text-[var(--color-primary)] dark:bg-slate-800/80 dark:text-[var(--color-primary)]' 
                        : 'text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('help')}
                  </Link>
                </nav>
              </div>

              {/* Bottom Language and Theme Settings */}
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                {/* Theme Selector */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-250/30 dark:border-slate-700/30 font-semibold text-xs cursor-pointer shadow-sm animate-pulse-slow"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Language Selector */}
                <div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-3">Language</span>
                  <div className="space-y-2">
                    {[
                      { code: 'en', flag: '🇺🇸', native: 'English', name: 'English' },
                      { code: 'fr', flag: '🇫🇷', native: 'Français', name: 'French' },
                      { code: 'es', flag: '🇪🇸', native: 'Español', name: 'Spanish' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border cursor-pointer ${
                          language === lang.code
                            ? 'bg-[var(--color-primary)] text-white border-transparent shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-gray-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.native}</span>
                        {language === lang.code && <span className="ml-auto text-xs opacity-80">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;


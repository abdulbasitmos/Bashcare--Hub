import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Bell, User, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import UserProfileDropdown from './UserProfileDropdown';
import MegaMenu from './MegaMenu';
import { useSearch } from '../../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/favicon.svg" alt="Bashcare Logo" className="w-10 h-10" />
            <Typography variant="h3" className="hidden md:block tracking-tight text-[var(--text-main)]">
              Bashcare <span className="text-[var(--primary)]">Hub</span>
            </Typography>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <div 
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
              className="relative group"
            >
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors px-3 py-2 flex items-center gap-1">
                Services <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {isMegaMenuOpen && <MegaMenu />}
              </AnimatePresence>
            </div>
            <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors px-3 py-2" onClick={() => navigate('/about')}>About</button>
            <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors px-3 py-2" onClick={() => navigate('/contact')}>Contact</button>
            <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors px-3 py-2" onClick={() => navigate('/help')}>Help</button>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white dark:bg-slate-800 border border-[var(--border)] rounded-full pl-4 pr-1 py-1.5 gap-2 w-64 focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button type="submit" className="p-1.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
              <Search size={16} />
            </button>
          </form>

          {/* Theme Toggle */}
          <Button variant="ghost" onClick={toggleTheme} className="p-2 rounded-full">
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" className="p-2 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-main)]"></span>
          </Button>

          {/* User Profile */}
          <UserProfileDropdown />

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            className="lg:hidden p-2 rounded-md" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden flex flex-col gap-2 mt-4 pb-4"
          >
            <Button variant="ghost" className="justify-start w-full">Services</Button>
            <Button variant="ghost" className="justify-start w-full">About</Button>
            <Button variant="ghost" className="justify-start w-full">Contact</Button>
            <Button variant="ghost" className="justify-start w-full">Help</Button>
            <div className="h-px bg-[var(--border)] my-2" />
            <Button variant="primary" className="w-full">Get Started</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

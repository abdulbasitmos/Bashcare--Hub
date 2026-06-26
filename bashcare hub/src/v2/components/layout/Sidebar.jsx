import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Bell, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Activity,
  CreditCard,
  Shield,
  BookOpen
} from 'lucide-react';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ role = 'patient', onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const navItems = {
    patient: [
      { label: 'Overview', icon: LayoutDashboard, path: '/' },
      { label: 'Learn', icon: BookOpen, path: '/learn' },
      { label: 'Appointments', icon: Calendar, path: '/appointments' },
      { label: 'Medical Records', icon: FileText, path: '/records' },
      { label: 'Messages', icon: MessageSquare, path: '/messages' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
      { label: 'Profile', icon: User, path: '/profile' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
    doctor: [
      { label: 'Doctor Overview', icon: Activity, path: '/' },
      { label: 'Appointment Queue', icon: Calendar, path: '/queue' },
      { label: 'Patient List', icon: User, path: '/patients' },
      { label: 'Consultations', icon: MessageSquare, path: '/consultations' },
      { label: 'Prescriptions', icon: FileText, path: '/prescriptions' },
      { label: 'Schedule', icon: Settings, path: '/schedule' },
    ],
    admin: [
      { label: 'Admin Console', icon: LayoutDashboard, path: '/' },
      { label: 'User Management', icon: User, path: '/users' },
      { label: 'Billing', icon: CreditCard, path: '/billing' },
      { label: 'System Health', icon: Activity, path: '/health' },
      { label: 'Security', icon: Shield, path: '/security' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ]
  };

  const currentItems = navItems[role] || navItems.patient;

  return (
    <motion.div 
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen sticky top-0 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col transition-all duration-var(--transition-smooth)"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-[var(--primary-foreground)] font-bold">
              B
            </div>
            <Typography variant="h3" className="text-sm font-bold truncate">
              Bashcare v2
            </Typography>
          </motion.div>
        )}
        <Button 
          variant="ghost" 
          className="p-1 rounded-md" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-grow px-3 py-4 flex flex-col gap-2 overflow-y-auto">
        {currentItems.map((item, idx) => (
          <SidebarItem 
            key={idx} 
            item={item} 
            isCollapsed={isCollapsed} 
          />
        ))}
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-[var(--border)]">
        <SidebarItem 
          item={{ label: 'Logout', icon: LogOut, path: '#' }} 
          isCollapsed={isCollapsed} 
          variant="danger"
          onClick={onLogout}
        />
      </div>
    </motion.div>
  );
};

const SidebarItem = ({ item, isCollapsed, variant = 'default', onClick }) => {
  const Icon = item.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-var(--transition-fast)
        ${variant === 'danger' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] hover:text-[var(--primary)]'}
      `}
    >
      <Icon size={20} className="shrink-0" />
      {!isCollapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium truncate"
        >
          {item.label}
        </motion.span>
      )}
      {isCollapsed && (
        <div className="absolute left-16 px-2 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
          {item.label}
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;

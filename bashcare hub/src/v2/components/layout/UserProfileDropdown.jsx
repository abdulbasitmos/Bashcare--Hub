import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, CreditCard, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 p-1 pr-3 rounded-full" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-xs">
          JD
        </div>
        <span className="hidden sm:inline text-sm font-medium text-[var(--text-primary)]">
          John Doe
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 glass border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-accent)]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="h3" className="text-sm">John Doe</Typography>
                    <Typography variant="muted" className="text-xs">Premium Patient</Typography>
                  </div>
                </div>
              </div>

              <div className="p-2 flex flex-col gap-1">
                <DropdownItem icon={<User size={16} />} label="My Profile" />
                <DropdownItem icon={<Settings size={16} />} label="Account Settings" />
                <DropdownItem icon={<CreditCard size={16} />} label="Billing & Plans" />
                <DropdownItem icon={<ShieldCheck size={16} />} label="Security" />
              </div>

              <div className="p-2 border-t border-[var(--border)]">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} /> Sign Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ icon, label }) => (
  <Button variant="ghost" className="w-full justify-start gap-3 py-2 px-3">
    <span className="text-[var(--text-muted)]">{icon}</span>
    <span className="text-sm">{label}</span>
  </Button>
);

export default UserProfileDropdown;

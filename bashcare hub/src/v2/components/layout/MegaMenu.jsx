import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Typography from '../ui/Typography';

const MegaMenu = () => {
  const categories = [
    {
      title: 'Patient Services',
      items: [
        { label: 'Book Appointment', desc: 'Schedule a visit with specialists', icon: '📅' },
        { label: 'Medical Records', desc: 'Access your health history', icon: '📂' },
        { label: 'Prescriptions', desc: 'Manage your current medications', icon: '💊' },
        { label: 'Health Insights', desc: 'AI-powered health analysis', icon: '✨' },
      ]
    },
    {
      title: 'Doctor Resources',
      items: [
        { label: 'Patient Queue', desc: 'Manage daily consultations', icon: '👥' },
        { label: 'E-Prescriptions', desc: 'Issue digital prescriptions', icon: '✍️' },
        { label: 'Scheduling', desc: 'Update availability hours', icon: '🕒' },
        { label: 'Clinic Analytics', desc: 'Track patient outcomes', icon: '📈' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'Staff Management', desc: 'Handle doctor & nurse roles', icon: '🏢' },
        { label: 'Hospital Reports', desc: 'View facility performance', icon: '📄' },
        { label: 'Billing System', desc: 'Manage invoices and payments', icon: '💳' },
        { label: 'Settings', desc: 'Global system configuration', icon: '⚙️' },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full left-0 right-0 mt-2 px-4"
    >
      <Card variant="glass" className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <Typography variant="label" className="text-[var(--primary)] font-bold">
              {cat.title}
            </Typography>
            <div className="flex flex-col gap-3">
              {cat.items.map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-accent)] cursor-pointer transition-colors group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {item.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </motion.div>
  );
};

export default MegaMenu;

import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  variant = 'glass', 
  hoverable = true 
}) => {
  const variants = {
    glass: 'glass shadow-lg',
    flat: 'bg-[var(--bg-card)] border border-[var(--border)] shadow-sm',
    elevated: 'bg-[var(--bg-card)] shadow-md border border-[var(--border)]',
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        rounded-[var(--radius-lg)] p-6 transition-all duration-var(--transition-smooth)
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;

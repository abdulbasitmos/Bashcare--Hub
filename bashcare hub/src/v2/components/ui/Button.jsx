import React from 'react';
import { motion } from 'framer-motion';
import './variables.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]',
    secondary: 'bg-[var(--bg-accent)] text-[var(--text-primary)] hover:opacity-80',
    outline: 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-accent)]',
    ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-[var(--radius-md)] 
        font-medium transition-colors duration-var(--transition-fast)
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;

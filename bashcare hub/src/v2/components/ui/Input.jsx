import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
          {label}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        className={`
          px-4 py-2 rounded-[var(--radius-md)] 
          bg-[var(--bg-main)] border border-[var(--border)] 
          text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
          transition-all duration-var(--transition-fast)
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 ml-1">{error}</span>
      )}
    </div>
  );
};

export default Input;

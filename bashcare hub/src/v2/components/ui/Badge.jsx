import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variants = {
    default: 'bg-[var(--bg-accent)] text-[var(--text-primary)]',
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    outline: 'border border-[var(--border)] text-[var(--text-secondary)]',
  };

  return (
    <span className={`
      px-2 py-0.5 rounded-full text-xs font-semibold
      transition-colors duration-var(--transition-fast)
      ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;

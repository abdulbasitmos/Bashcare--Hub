import React from 'react';

const Typography = ({ 
  variant = 'p', 
  children, 
  className = '', 
  ...props 
}) => {
  const variants = {
    h1: 'text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]',
    h2: 'text-3xl font-semibold tracking-tight text-[var(--text-primary)]',
    h3: 'text-xl font-semibold text-[var(--text-primary)]',
    p: 'text-base leading-relaxed text-[var(--text-secondary)]',
    muted: 'text-sm leading-relaxed text-[var(--text-muted)]',
    label: 'text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]',
  };

  const Component = variant === 'h1' ? 'h1' : 
                    variant === 'h2' ? 'h2' : 
                    variant === 'h3' ? 'h3' : 'p';

  return (
    <Component className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default Typography;

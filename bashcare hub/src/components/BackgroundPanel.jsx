import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackgroundPanel = ({ images = [], image, children, className = '' }) => {
  const sources = images.length > 0 ? images : image ? [image] : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!sources.length) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sources.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [sources.length]);

  return (
    <section className={`relative overflow-hidden rounded-[3rem] ${className}`}> 
      <AnimatePresence mode="wait">
        {sources.length > 0 && (
          <motion.img
            key={sources[index]}
            src={sources[index]}
            alt="Background banner"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default BackgroundPanel;

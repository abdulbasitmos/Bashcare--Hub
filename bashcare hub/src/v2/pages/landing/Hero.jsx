import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

const heroImages = [
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551076805-e1866033e54e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584982208886-9dba46039121?auto=format&fit=crop&w=800&q=80',
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Dynamic Animated Background with Image Rotation */}
      <div className="absolute inset-0 z-0 hero-image-container">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={heroImages[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full object-cover"
            alt="Healthcare"
          />
        </AnimatePresence>
      </div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-4xl gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-4 py-1.5 rounded-full bg-[var(--bg-accent)] text-[var(--primary)] text-sm font-semibold mb-4 inline-block shadow-sm cursor-default"
          >
            ✨ Bashcare v2 is now live
          </motion.span>
          <Typography variant="h1" className="mb-6 leading-tight">
            Intelligent Healthcare,<br /> 
            <motion.span 
              className="text-[var(--primary)] block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Designed for Humanity.
            </motion.span>
          </Typography>
          <Typography variant="p" className="text-xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto">
            A premium, enterprise-grade platform to manage health, appointments, and medical records with seamless ease and modern elegance.
          </Typography>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-4"
        >
          <Button size="lg" className="shadow-lg shadow-[var(--primary)]/30" onClick={() => navigate('/auth')}>Get Started</Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/learn')}>View Demo</Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

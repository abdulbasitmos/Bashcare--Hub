import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Typography from '../../components/ui/Typography';
import { Activity, ShieldCheck, Zap, Users } from 'lucide-react';

const Features = () => {
  const features = [
    { title: 'AI Insights', icon: Activity, desc: 'Advanced analytics for personalized care.' },
    { title: 'Secure Data', icon: ShieldCheck, desc: 'Enterprise-grade encryption for records.' },
    { title: 'Fast Booking', icon: Zap, desc: 'Seamless, instant appointment scheduling.' },
    { title: 'Patient Focused', icon: Users, desc: 'Human-centric design at every step.' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 px-4 bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto">
        <Typography variant="h2" className="text-center mb-16">
          Everything You Need, <span className="text-[var(--primary)]">Simplified</span>.
        </Typography>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={item}>
              <Card 
                variant="flat" 
                className="h-full flex flex-col gap-4 group hover:border-[var(--primary)]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-accent)] flex items-center justify-center text-[var(--primary)] transition-transform group-hover:scale-110 duration-300">
                  <f.icon size={24} />
                </div>
                <Typography variant="h3" className="text-lg">{f.title}</Typography>
                <Typography variant="muted">{f.desc}</Typography>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

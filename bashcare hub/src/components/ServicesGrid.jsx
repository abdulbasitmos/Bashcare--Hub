import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  { id: 1, category: 'Cardiology', title: 'Heart Checkup', description: 'Comprehensive cardiac evaluation and diagnostic testing.', price: '$150', duration: '45 mins' },
  { id: 2, category: 'Neurology', title: 'Brain Mapping', description: 'Advanced neurological assessment using latest technology.', price: '$300', duration: '60 mins' },
  { id: 3, category: 'Pediatrics', title: 'Child Vaccination', description: 'Safe and gentle vaccination services for your little ones.', price: '$50', duration: '20 mins' },
  { id: 4, category: 'Cardiology', title: 'ECG Analysis', description: 'Quick and accurate electrocardiogram readings.', price: '$80', duration: '15 mins' },
  { id: 5, category: 'Orthopedics', title: 'Bone Density Test', description: 'Screening for osteoporosis and bone health.', price: '$120', duration: '30 mins' },
  { id: 6, category: 'General', title: 'Full Body Scan', description: 'Complete health screening covering all vital organs.', price: '$500', duration: '120 mins' },
  { id: 7, category: 'Dental', title: 'Teeth Whitening', description: 'Professional dental cleaning and whitening services.', price: '$200', duration: '60 mins' },
  { id: 8, category: 'Neurology', title: 'Sleep Study', description: 'Overnight monitoring for sleep disorders and apnea.', price: '$450', duration: 'Overnight' },
];

const categories = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dental', 'General'];

const ServicesGrid = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredServices = activeCategory === 'All' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <section className="py-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">Our Specialized Services</h2>
          <p className="mt-4 text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Experience modern, personalized medical care tailored to your needs.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                activeCategory === category
                  ? 'bg-[var(--color-primary)] text-white shadow-lg'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Bento Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredServices.map(service => (
              <motion.div 
                layout
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl transition-shadow"
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-[var(--bg-primary)] text-[var(--color-primary)] text-[10px] font-bold mb-4 uppercase tracking-wider">
                    {service.category}
                  </span>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-primary)]">
                  <p className="text-2xl font-black text-[var(--color-primary)]">{service.price}</p>
                  <p className="text-xs font-bold text-[var(--text-secondary)]">{service.duration}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesGrid;


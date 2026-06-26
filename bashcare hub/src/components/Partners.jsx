import { motion } from 'framer-motion';

const Partners = () => {
  const partners = [
    { name: 'World Health Org', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966484.png' },
    { name: 'Global Medical Council', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' },
    { name: 'HealthCare Alliance', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966487.png' },
    { name: 'Medical Innovation Lab', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966461.png' },
    { name: 'Patient Rights Int.', logo: 'https://cdn-icons-png.flaticon.com/512/2966/2966437.png' },
  ];

  return (
    <section className="py-12 bg-[var(--bg-secondary)] border-y border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-8">Trusted by Leading Health Organizations</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((p, i) => (
            <motion.img 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              src={p.logo} 
              alt={p.name} 
              className="h-12 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;


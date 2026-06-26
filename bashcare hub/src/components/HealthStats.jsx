import { motion } from 'framer-motion';

const HealthStats = () => {
  const stats = [
    { label: 'Patients Treated', value: 15000, suffix: '+', icon: '👥' },
    { label: 'Specialist Doctors', value: 120, suffix: '', icon: '👨‍⚕️' },
    { label: 'Successful Surgeries', value: 8500, suffix: '', icon: '🏥' },
    { label: 'Average Recovery Rate', value: 98, suffix: '%', icon: '📈' },
  ];

  return (
    <section className="py-12 bg-[var(--color-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="text-3xl md:text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl md:text-4xl font-black text-blue-400 mb-2"
              >
                {stat.value.toLocaleString()}{stat.suffix}
              </motion.div>
              <p className="text-[var(--text-secondary)] font-medium uppercase tracking-widest text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthStats;


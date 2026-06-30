import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const Features = () => {
  const navigate = useNavigate();
  const { t } = useGlobalSettings();
  const features = [
    {
      title: 'World-Class Medical Expertise',
      description: 'Our network of doctors comprises some of the finest minds in medicine. From board-certified surgeons to compassionate general practitioners, we ensure you have access to the highest level of care. We continuously invest in training and research to stay at the forefront of medical science.',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=800',
      icon: '🩺',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-[var(--color-primary)] dark:text-blue-400'
    },
    {
      title: '24/7 Emergency & Support',
      description: 'Health emergencies don\'t follow a schedule, and neither do we. Our dedicated support team and emergency services are available around the clock, ensuring that help is always just a phone call or a click away, no matter the time or place.',
      image: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&q=80&w=800',
      icon: '⏰',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Cutting-Edge Medical Tech',
      description: 'We integrate the latest AI-driven diagnostics and telemedicine tools to provide faster, more accurate results. Our facilities are equipped with next-generation machinery that reduces recovery time and increases precision in every procedure.',
      image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
      icon: '⚡',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Comprehensive Wellness Plans',
      description: 'Healthcare is more than just treating illness; it\'s about maintaining wellness. We offer holistic health packages including nutrition guidance, mental health support, and preventative screenings to keep you in peak condition.',
      image: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&q=80&w=800',
      icon: '🌿',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    },
  ];

  const departments = [
    { name: 'Emergency Care', emoji: '🚑' },
    { name: 'Pediatric Dept', emoji: '🧸' },
    { name: 'Cardiology', emoji: '❤️' },
    { name: 'Neurology', emoji: '🧠' },
    { name: 'Orthopedics', emoji: '🦴' },
    { name: 'General Medicine', emoji: '🩺' },
  ];

  return (
    <section
      id="services"
      className="py-12 overflow-hidden features-gradient"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Our Departments ── */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]"
          >
            {t('Our Departments')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-[var(--text-secondary)]"
          >
            {t('Specialized care across every discipline — find the right department for your needs.')}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => navigate('/doctors')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100/50"
            >
              <span className="text-4xl block mb-3">{dept.emoji}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{t(dept.name)}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 mb-20" />

        {/* ── Existing Premium Healthcare Experience ── */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] sm:text-3xl md:text-4xl"
          >
            {t('Our Premium Healthcare Experience')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-[var(--text-secondary)]"
          >
            {t('Everything you need for a healthier life, delivered with precision and compassion.')}
          </motion.p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="w-full lg:w-1/2">
                <div className="relative group">
                  <div className={`absolute -inset-4 ${feature.color} rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition duration-500`}></div>
                  <img 
                    src={feature.image} 
                    alt={t(feature.title)} 
                    className="relative rounded-[2.5rem] shadow-2xl w-full h-[400px] object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold text-[var(--text-primary)]">{t(feature.title)}</h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  {t(feature.description)}
                </p>
                <button 
                  onClick={() => navigate('/get-started')}
                  className="text-[var(--color-primary)] font-bold flex items-center gap-2 hover:gap-3 transition-all group cursor-pointer"
                >
                  {t('Learn More')} 
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

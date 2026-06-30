import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const MembershipPlans = () => {
  const navigate = useNavigate();
  const { t } = useGlobalSettings();
  const plans = [
    { 
      name: 'Basic Care', 
      price: '0', 
      description: 'Essential health monitoring for everyone.',
      features: ['Monthly Health Report', 'General Practitioner Chat', 'Standard Appointment Booking', 'Basic Medical Records'],
      button: 'Get Started',
      highlight: false
    },
    { 
      name: 'Premium Wellness', 
      price: '49', 
      description: 'Comprehensive care for health-conscious individuals.',
      features: ['Priority Appointment Booking', 'Specialist Consultations', 'Detailed Wellness Analytics', 'Annual Full Body Scan', '24/7 Emergency Access'],
      button: 'Go Premium',
      highlight: true
    },
    { 
      name: 'Elite Family', 
      price: '99', 
      description: 'The ultimate healthcare protection for your whole family.',
      features: ['Unlimited Family Members', 'Dedicated Family Physician', 'Home Visit Services', 'VIP Clinic Access', 'Full Genomic Screening'],
      button: 'Join Elite',
      highlight: false
    }
  ];

  return (
    <section className="py-12 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4"
          >
            {t('Tailored Care Plans')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            {t('Choose a plan that fits your lifestyle and health needs. From basic monitoring to elite family protection.')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[3rem] border transition-all duration-300 ${
                plan.highlight 
                ? 'bg-[var(--color-primary)] text-white border-blue-600 shadow-2xl shadow-blue-200 scale-105 z-10' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-[var(--border-primary)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-yellow-400 text-[var(--text-primary)] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {t('Most Popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{t(plan.name)}</h3>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-[var(--text-secondary)]'}`}>{t(plan.description)}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-3xl md:text-4xl font-black">${plan.price}</span>
                <span className={`text-sm font-medium ${plan.highlight ? 'text-blue-200' : 'text-[var(--text-secondary)]'}`}>/month</span>
              </div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <svg className={`w-5 h-5 ${plan.highlight ? 'text-blue-300' : 'text-[var(--color-primary)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t(f)}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/get-started')}
                className={`w-full py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 cursor-pointer ${
                  plan.highlight 
                  ? 'bg-[var(--bg-secondary)] text-[var(--color-primary)] hover:bg-[var(--bg-primary)]' 
                  : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)] hover:opacity-90'
                }`}
              >
                {t(plan.button)}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipPlans;

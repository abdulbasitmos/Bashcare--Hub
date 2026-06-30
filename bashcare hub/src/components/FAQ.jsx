import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const FAQ = () => {
  const { t } = useGlobalSettings();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      q: "How can I book an appointment?",
      a: "You can book an appointment through our online booking system via the 'Get Started' button, or by calling our 24/7 helpline at +1 (555) 123-4567. We offer both virtual and in-person consultations."
    },
    {
      q: "Do you accept insurance?",
      a: "Yes, we accept most major health insurance providers. Please bring your insurance card during your first visit or upload a copy during the online registration process for faster verification."
    },
    {
      q: "What should I bring for my first visit?",
      a: "Please bring a valid government-issued ID, your insurance card, and any previous medical records, test results, or current prescriptions you are taking to ensure a comprehensive evaluation."
    },
    {
      q: "Is emergency care available?",
      a: "Absolutely. Our emergency department is open 24/7 with specialized trauma teams and advanced life-support equipment ready to assist you at any time."
    },
    {
      q: "Can I consult with a doctor online?",
      a: "Yes, we provide a fully integrated telemedicine platform. You can have a high-definition video call with our specialists from anywhere in the world."
    }
  ];

  return (
    <section className="py-12 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4"
          >
            {t('Frequently Asked Questions')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)]"
          >
            {t('Quick answers to common questions about our world-class services.')}
          </motion.p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--bg-primary)] rounded-3xl border border-[var(--border-primary)] overflow-hidden"
            >
              <button 
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--bg-primary)]/50 transition-colors"
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{t(faq.q)}</h3>
                <motion.span 
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  className="shrink-0 ml-4 p-1 text-[var(--color-primary)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {t(faq.a)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;


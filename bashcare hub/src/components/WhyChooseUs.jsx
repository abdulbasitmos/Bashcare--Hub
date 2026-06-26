import { motion } from 'framer-motion';

const WhyChooseUs = () => {
  const reasons = [
    {
      title: 'Patient-Centric Approach',
      description: 'We believe in treating the person, not just the symptoms. Our personalized care plans are tailored to your unique health history and goals.',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800',
      icon: '❤️'
    },
    {
      title: 'World-Class Specialists',
      description: 'Our network consists of board-certified doctors and specialists who bring years of experience from leading medical institutions worldwide.',
      image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
      icon: '🎓'
    },
    {
      title: 'Advanced Diagnostics',
      description: 'Equipped with the latest AI-driven diagnostic tools, we ensure accurate and early detection of health issues for better outcomes.',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800',
      icon: '🔬'
    },
    {
      title: 'Seamless Digital Experience',
      description: 'From booking appointments to receiving digital prescriptions, our platform makes managing your health as simple as a few clicks.',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
      icon: '📱'
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
            Why Choose Bashcare Hub?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            We combine medical excellence with technological innovation to provide a healthcare experience that is truly modern and compassionate.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {reasons.map((reason, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col lg:flex-row gap-8 items-center group"
            >
              <div className="w-full lg:w-1/2 overflow-hidden rounded-[2.5rem] shadow-xl transform group-hover:scale-[1.02] transition-transform duration-500">
                <img src={reason.image} alt={reason.title} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="text-3xl md:text-4xl mb-2">{reason.icon}</div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{reason.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;


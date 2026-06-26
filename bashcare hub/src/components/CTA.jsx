import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-[var(--color-primary)] px-8 py-12 md:px-16 md:py-12 overflow-hidden shadow-2xl shadow-blue-200">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[100px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-400 rounded-full blur-[100px] opacity-50"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl md:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight"
            >
              Your Journey to Better Health Starts Here
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 mb-10 leading-relaxed"
            >
              Experience world-class healthcare tailored to your needs. Join Bashcare Hub today and get access to top specialists and seamless digital care.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <button 
                onClick={() => navigate('/get-started')}
                className="px-10 py-4 bg-[var(--bg-secondary)] text-[var(--color-primary)] rounded-full font-bold text-lg hover:bg-[var(--bg-primary)] transition-all transform hover:-translate-y-1 shadow-lg cursor-pointer"
              >
                Book an Appointment
              </button>
              <button 
                onClick={() => navigate('/doctors')}
                className="px-10 py-4 bg-white/20 text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white/30 transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                Consult a Specialist
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

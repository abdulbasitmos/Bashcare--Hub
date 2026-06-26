import { motion } from 'framer-motion';

const MobileApp = () => {
  return (
    <section className="py-12 bg-[var(--bg-secondary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] leading-tight">
              Manage Your Health <br/> <span className="text-[var(--color-primary)]">On the Go</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              Download the Bashcare Hub app to access your medical records, book appointments, chat with specialists, and receive personalized health updates—all from your smartphone.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-black transition-all flex items-center gap-2">
                Download on App Store
              </button>
              <button className="px-6 py-3 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                Get on Google Play
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-100 rounded-[3rem] blur-3xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800" 
              alt="Mobile App" 
              className="relative rounded-[3rem] shadow-2xl z-10 w-full h-[400px] md:h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MobileApp;


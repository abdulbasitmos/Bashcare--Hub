import { motion } from 'framer-motion';

const MissionVision = () => {
  return (
    <section className="py-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-200 rounded-[3rem] rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800" 
              alt="Our Mission" 
              className="relative rounded-[3rem] shadow-2xl z-10 w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute -bottom-10 -right-10 bg-[var(--bg-secondary)] p-8 rounded-3xl shadow-2xl z-20 max-w-xs border border-blue-100">
              <p className="text-[var(--color-primary)] font-black text-3xl md:text-4xl mb-2">100%</p>
              <p className="text-gray-600 font-bold leading-tight">Dedication to Patient Wellness and Safety</p>
            </div>
          </motion.div>
          
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-6">Our Core Philosophy</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                At Bashcare Hub, we don't just treat diseases; we care for people. Our philosophy is rooted in the belief that healthcare should be accessible, personalized, and deeply compassionate.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center shrink-0 font-bold">M</div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">Our Mission</h4>
                    <p className="text-[var(--text-secondary)]">To revolutionize healthcare delivery by blending cutting-edge technology with the human touch, ensuring every patient receives gold-standard care.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 font-bold">V</div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">Our Vision</h4>
                    <p className="text-[var(--text-secondary)]">To become the world's most trusted digital health ecosystem, where quality care is a universal right, not a privilege.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;


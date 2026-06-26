import { motion } from 'framer-motion';

const Testimonials = () => {
  const reviews = [
    {
      name: "John Stevenson",
      role: "Patient",
      comment: "The care I received at Bashcare Hub was exceptional. The doctors are truly experts in their fields, and the personalized approach made me feel seen and heard. I highly recommend their services to anyone seeking quality care.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Emily Rodriguez",
      role: "Patient",
      comment: "Modern facilities and very friendly staff. The online booking system made everything so easy, and the follow-up care was impressive. It's rare to find a clinic that balances technology and empathy so well.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Michael Barnes",
      role: "Patient",
      comment: "I've been coming here for 3 years and I wouldn't go anywhere else. Top notch service every time. Their diagnostics are fast, and the treatment plans are always clear and effective.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Sarah Jenkins",
      role: "Patient",
      comment: "The virtual consultations are a lifesaver! I can talk to my doctor without leaving home, and the digital prescriptions are integrated perfectly. Truly a 21st-century healthcare experience.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "David Chen",
      role: "Patient",
      comment: "Bashcare Hub has transformed my approach to healthcare. The integrated dashboard shows all my medical data in one place, making it easy to track my progress over time.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Lisa Wang",
      role: "Patient",
      comment: "Outstanding service and incredibly knowledgeable staff. They took time to answer all my questions and made sure I understood my treatment plan completely.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    }
  ];

  return (
    <section className="py-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4"
          >
            Stories of Healing & Hope
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Join thousands of patients who have reclaimed their health through our compassionate and expert care.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((rev, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-primary)] hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img src={rev.avatar} className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-800 object-cover group-hover:border-[var(--color-primary)] transition-colors" alt={rev.name} />
                  <div className="absolute -bottom-1 -right-1 bg-[var(--color-primary)] text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] leading-tight">{rev.name}</h4>
                  <p className="text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">{rev.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(rev.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--text-secondary)] italic leading-relaxed relative">
                <span className="text-3xl md:text-4xl text-blue-100 dark:text-slate-800 absolute -top-4 -left-2 font-serif opacity-50">“</span>
                <span className="relative z-10">{rev.comment}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


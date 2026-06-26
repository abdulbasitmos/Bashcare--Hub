import { motion } from 'framer-motion';

const HealthInsights = () => {
  const posts = [
    {
      title: 'The Future of Telemedicine: AI and Beyond',
      category: 'Innovation',
      date: 'June 10, 2026',
      image: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Explore how generative AI is helping doctors diagnose rare conditions with 40% more accuracy.'
    },
    {
      title: '5 Tips for Maintaining Heart Health in 2026',
      category: 'Wellness',
      date: 'June 5, 2026',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800',
      excerpt: 'Small daily changes that can lead to a significantly longer and healthier life.'
    },
    {
      title: 'Understanding Genomic Sequencing',
      category: 'Science',
      date: 'June 1, 2026',
      image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800',
      excerpt: 'How personalized medicine is changing the way we treat hereditary diseases.'
    }
  ];

  return (
    <section className="py-12 bg-[var(--bg-primary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4"
            >
              Health Insights & News
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[var(--text-secondary)]"
            >
              Stay updated with the latest medical breakthroughs and wellness tips from our experts.
            </motion.p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-blue-700 transition-all"
          >
            Visit Blog
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--bg-secondary)]/90 backdrop-blur-sm text-[var(--color-primary)] text-xs font-bold rounded-full uppercase tracking-widest">
                  {post.category}
                </div>
              </div>
              <div className="p-8">
                <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">{post.date}</p>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm">
                  Read More 
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthInsights;


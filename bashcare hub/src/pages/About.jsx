import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import BackgroundPanel from '../components/BackgroundPanel';
import { motion } from 'framer-motion';
import { Users, Target, Award, Heart } from 'lucide-react';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const About = () => {
  const { t } = useGlobalSettings();
  const values = [
    {
      title: t('Patient-Centered'),
      description: t('Everything we do is focused on providing the best possible care for our patients.'),
      icon: <Heart className="w-8 h-8 text-red-500" />,
    },
    {
      title: t('Excellence'),
      description: t('We strive for excellence in all our medical services and operational processes.'),
      icon: <Award className="w-8 h-8 text-blue-500" />,
    },
    {
      title: t('Innovation'),
      description: t('Leveraging the latest technology to improve healthcare accessibility and outcomes.'),
      icon: <Target className="w-8 h-8 text-purple-500" />,
    },
    {
      title: t('Integrity'),
      description: t('We maintain the highest standards of professional and ethical conduct.'),
      icon: <Users className="w-8 h-8 text-green-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Navbar />
      <PageHeader 
        title={t('About Us')} 
        subtitle={t('Leading the way in modern healthcare and patient management.')}
        breadcrumb={t('about')}
        videoUrl="/videos/about_bg.mp4"
      />
      
      <main>
        {/* Mission Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">{t('Our Mission')}</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('Bashcare Hub was founded with a single goal: to make high-quality healthcare accessible, efficient, and compassionate. We bridge the gap between patients and providers through advanced technology and a dedicated network of medical professionals.')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('Our platform integrates everything from appointment booking and record management to doctor verification and hospital administration, ensuring a seamless experience for everyone in the healthcare ecosystem.')}
              </p>
            </div>
            <div className="mt-12 lg:mt-0 relative">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
                alt={t('Medical Team')} 
                className="rounded-[3rem] shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-[var(--color-primary)] text-white p-8 rounded-3xl shadow-xl hidden md:block">
                <p className="text-4xl font-bold mb-2">10+</p>
                <p className="text-sm font-medium">{t('Years of Experience')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-[var(--bg-primary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">{t('Our Core Values')}</h2>
              <p className="mt-4 text-xl text-gray-600">{t('The principles that guide our every action.')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-lg border border-[var(--border-primary)] hover:shadow-xl transition-shadow">
                  <div className="mb-6">{value.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connected Care Ecosystem */}
        <BackgroundPanel
          images={[
            'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1600',
          ]}
          className="mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl font-extrabold text-white mb-6"
                >
                  {t('A connected care experience for everyone')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-100 max-w-xl leading-relaxed"
                >
                  {t('From telehealth follow-ups to secure record sharing, Bashcare Hub brings patients, specialists, and hospitals together in one intelligent platform.')}
                </motion.p>
              </div>
              <div className="grid gap-6">
                {[
                  { title: t('Virtual consultations'), description: t('Book trusted specialists and talk to doctors online within minutes.') },
                  { title: t('AI-driven reminders'), description: t('Stay on top of care with intelligent health nudges and medication prompts.') },
                  { title: t('Care coordination'), description: t('Link family, providers, and clinics for smoother treatment journeys.') },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="p-8 rounded-[2rem] bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-slate-200 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </BackgroundPanel>

        {/* Stats Section */}
        <section className="py-24 bg-[var(--color-primary)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold mb-2">50k+</p>
                <p className="text-lg text-blue-100 font-medium">{t('Patients Served')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">200+</p>
                <p className="text-lg text-blue-100 font-medium">{t('doctors')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">15+</p>
                <p className="text-lg text-blue-100 font-medium">{t('Hospital Partners')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">24/7</p>
                <p className="text-lg text-blue-100 font-medium">{t('Support Available')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;


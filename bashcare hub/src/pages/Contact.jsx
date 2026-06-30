import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import BackgroundPanel from '../components/BackgroundPanel';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useGlobalSettings } from '../context/GlobalSettingsContext';

const Contact = () => {
  const { t } = useGlobalSettings();
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Navbar />
      <PageHeader 
        title={t('Contact Us')} 
        subtitle={t('Get in touch with our team for any inquiries or support.')}
        breadcrumb={t('contact')}
        videoUrl="/videos/contact_bg.mp4"
      />

      <BackgroundPanel
        images={[
          'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1491746993648-7f9956aa5c1b?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=1600',
        ]}
        className="mt-0"
      >
        <div className="py-20 px-6 sm:px-10 lg:px-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-100 mb-4">{t('Need quick support?')}</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">{t('A patient-first support experience')}</h2>
            <p className="mx-auto max-w-2xl text-slate-200 leading-relaxed">
              {t('Whether you need help booking appointments, managing records, or verifying doctor credentials, our support team is ready to respond fast.')}
            </p>
          </motion.div>
        </div>
      </BackgroundPanel>
      
      <main className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-[var(--bg-secondary)] p-8 md:p-12 rounded-[3rem] shadow-2xl border border-[var(--border-primary)]">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">{t('Send us a message')}</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('First Name')}</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-[var(--bg-primary)] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('Last Name')}</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-[var(--bg-primary)] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('Email Address')}</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-[var(--bg-primary)] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('Subject')}</label>
                <select className="w-full p-4 bg-[var(--bg-primary)] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all">
                  <option>{t('General Inquiry')}</option>
                  <option>{t('Technical Support')}</option>
                  <option>{t('Medical Partnership')}</option>
                  <option>{t('Billing Question')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('Message')}</label>
                <textarea 
                  rows="4" 
                  className="w-full p-4 bg-[var(--bg-primary)] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder={t('Message') + '...'}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                {t('Send Message')} <Send size={20} />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">{t('Contact Information')}</h2>
            <p className="text-lg text-gray-600 mb-12">
              {t('Have questions about our platform or services? Reach out to us through any of the following channels. Our team is always ready to help.')}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-[var(--bg-primary)] text-[var(--color-primary)] rounded-2xl">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{t('Our Office')}</h4>
                  <p className="text-gray-600">123 Medical Drive, Health City, ST 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{t('Phone Number')}</h4>
                  <p className="text-gray-600">+1 (555) 000-0000</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{t('Email Address')}</h4>
                  <p className="text-gray-600">contact@bashcarehub.com</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{t('Working Hours')}</h4>
                  <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 bg-[var(--bg-primary)] rounded-[3rem] border border-[var(--border-primary)] p-10 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: t('Fast Response'), text: t('We answer support requests quickly so you can keep your health plans moving.') },
              { title: t('Verified Assistance'), text: t('Our team is trained to handle medical coordination and patient portal issues.') },
              { title: t('Secure Follow-Up'), text: t('All communication is handled with privacy and HIPAA-style care in mind.') },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;


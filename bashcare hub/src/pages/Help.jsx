import AIChat from '../components/AIChat';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import { ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1576091160550-2173bdd9962a?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=2000"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment by signing in as a Patient and navigating to the "Book Appointment" section. Choose your specialty, doctor, and preferred time slot.',
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use industry-standard encryption and follow strict privacy protocols to ensure your health records are only accessible to you and your authorized healthcare providers.',
    },
    {
      question: 'How can I verify my doctor credentials?',
      answer: 'All doctors on our platform go through a rigorous verification process by our dedicated Verification Officers before they can offer consultations.',
    },
    {
      question: 'Can I manage multiple family members from one account?',
      answer: 'Currently, each account is for an individual. However, we are working on a "Family Plan" feature to allow managed care for dependents.',
    },
    {
      question: 'What should I do in case of an emergency?',
      answer: 'Bashcare Hub is for non-emergency consultations. In case of a medical emergency, please call your local emergency services (e.g., 911) or go to the nearest hospital.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Navbar />
      
      {/* Hero Cycling Background Images */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={backgroundImages[currentImageIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover"
              alt="Background"
            />
          </AnimatePresence>
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-[var(--bg-secondary)]/70 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10">
          <PageHeader 
            title="Help & Support" 
            subtitle="Find answers to your questions or get in touch with our team."
            breadcrumb="Help"
            videoUrl="/videos/services_bg.mp4"
          />
        </div>
      </div>
      
      <main className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 gap-16">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-[var(--border-primary)] rounded-2xl overflow-hidden bg-[var(--bg-primary)]">
                  <button 
                    className="w-full flex justify-between items-center p-6 text-left hover:bg-[var(--bg-primary)] transition-colors"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="font-bold text-[var(--text-primary)]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openIndex === index && (
                    <div className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-primary)] animate-in slide-in-from-top duration-300">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Sidebar */}
          <div className="mt-16 lg:mt-0">
            <div className="relative p-8 rounded-[2.5rem] border border-blue-100 sticky top-32 overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600/90 to-indigo-900/90 backdrop-blur-md">
              <h3 className="text-2xl font-bold text-white mb-6">Need more help?</h3>
              <p className="text-blue-100 mb-8">Our support team is available 24/7 to assist you with any technical or medical inquiries.</p>
              
              <div className="space-y-6">
                <a href="#" className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)]/20 backdrop-blur-md text-white rounded-2xl shadow-sm hover:bg-[var(--bg-secondary)]/30 transition-all group border border-white/20">
                  <div className="p-3 bg-[var(--bg-secondary)] text-[var(--color-primary)] rounded-xl">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Live Chat</p>
                    <p className="text-sm text-blue-100">Average response: 2 mins</p>
                  </div>
                </a>

                <a href="mailto:support@bashcarehub.com" className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)]/20 backdrop-blur-md text-white rounded-2xl shadow-sm hover:bg-[var(--bg-secondary)]/30 transition-all group border border-white/20">
                  <div className="p-3 bg-[var(--bg-secondary)] text-indigo-600 rounded-xl">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Email Us</p>
                    <p className="text-sm text-blue-100">support@bashcarehub.com</p>
                  </div>
                </a>

                <a href="tel:+1555000000" className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)]/20 backdrop-blur-md text-white rounded-2xl shadow-sm hover:bg-[var(--bg-secondary)]/30 transition-all group border border-white/20">
                  <div className="p-3 bg-[var(--bg-secondary)] text-green-600 rounded-xl">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Call Support</p>
                    <p className="text-sm text-blue-100">+1 (555) 000-0000</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
};

export default Help;


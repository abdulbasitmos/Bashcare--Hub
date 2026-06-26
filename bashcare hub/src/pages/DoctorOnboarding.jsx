import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope,
  IdCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const requirements = [
    {
      icon: <Award className="w-8 h-8 text-blue-500" />,
      title: 'Medical License',
      description: 'A valid, active medical license to practice in your jurisdiction.',
      color: 'blue'
    },
    {
      icon: <IdCard className="w-8 h-8 text-indigo-500" />,
      title: 'Government ID',
      description: 'A clear copy of your valid passport, national ID, or driver\'s license.',
      color: 'indigo'
    },
    {
      icon: <FileText className="w-8 h-8 text-teal-500" />,
      title: 'Board Certification',
      description: 'Proof of your medical board certifications and specialties.',
      color: 'teal'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-amber-500" />,
      title: 'Malpractice Insurance',
      description: 'Current proof of professional liability insurance coverage.',
      color: 'amber'
    }
  ];

  const handleProceed = () => {
    if (accepted) {
      navigate('/auth/doctor/signup');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)] shadow-sm"
            >
              <Stethoscope size={40} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tight"
            >
              Join the <span className="text-[var(--color-primary)]">Bashcare Network</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto"
            >
              To ensure the highest quality of care for our patients, we require all medical professionals to verify their credentials.
            </motion.p>
          </div>

          {/* Requirements Grid */}
          <div className="bg-[var(--bg-secondary)] rounded-[3rem] p-8 md:p-12 shadow-xl border border-[var(--border-primary)] relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">
                Please have the following documents ready:
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {requirements.map((req, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-[var(--bg-primary)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow"
                  >
                    <div className={`p-3 bg-${req.color}-50 rounded-2xl`}>
                      {req.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">{req.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{req.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Support Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-2 mb-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-[var(--text-primary)] text-sm">Need Help with Your Verification Documents?</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Call us at <a href="tel:07089593412" className="text-[var(--color-primary)] font-bold hover:underline">07089593412</a> or register to chat live and upload files with our verification support officer.
                  </p>
                </div>
                <a 
                  href="tel:07089593412"
                  className="px-5 py-2.5 bg-white border border-slate-300 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all text-center whitespace-nowrap"
                >
                  Call Support
                </a>
              </motion.div>

              {/* Acknowledgment & Action */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="max-w-xl mx-auto"
              >
                <div 
                  onClick={() => setAccepted(!accepted)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                    accepted 
                      ? 'border-[var(--color-primary)] bg-blue-50/50' 
                      : 'border-[var(--border-primary)] hover:border-blue-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    accepted ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-300'
                  }`}>
                    {accepted && <CheckCircle2 size={16} />}
                  </div>
                  <span className={`text-sm font-bold ${accepted ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    I acknowledge that I have these documents ready and they are authentic.
                  </span>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleProceed}
                    disabled={!accepted}
                    className={`w-full py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                      accepted 
                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Registration <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorOnboarding;

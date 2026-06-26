import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogoIcon } from '../components/Logo';
import BackgroundPanel from '../components/BackgroundPanel';
import { 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const roles = [
  {
    id: 'doctor',
    title: 'Doctor',
    subtitle: 'For medical professionals',
    description: 'Manage your practice, track patient history, and provide digital consultations.',
    benefits: ['Patient Management', 'Digital Prescriptions', 'Schedule Control'],
    icon: <Stethoscope className="w-8 h-8" />,
    color: 'green',
  },
  {
    id: 'admin',
    title: 'Hospital Admin',
    subtitle: 'For facility management',
    description: 'Monitor hospital performance, manage staff, and optimize healthcare delivery.',
    benefits: ['Operational Analytics', 'Staff Coordination', 'Inventory Tracking'],
    icon: <Building2 className="w-8 h-8" />,
    color: 'purple',
  },
  {
    id: 'officer',
    title: 'Verification Officer',
    subtitle: 'For quality assurance',
    description: 'Review doctor credentials and ensure the highest standards of medical integrity.',
    benefits: ['Credential Verification', 'Network Security', 'Quality Audits'],
    icon: <ShieldCheck className="w-8 h-8" />,
    color: 'amber',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-16">
          <Link to="/auth/patient/signup" className="flex items-center text-gray-600 hover:text-[var(--color-primary)] transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Patient Portal</span>
          </Link>
          <Link to="/" className="flex items-center gap-3 group">
            <LogoIcon className="h-10 w-10" animated={true} />
            <span className="text-3xl font-black tracking-tight text-[var(--color-primary)]">Bashcare<span className="text-[var(--text-primary)]">Hub</span></span>
          </Link>
          <div className="w-24"></div> {/* Spacer for symmetry */}
        </div>

        {/* Hero Text */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-[var(--text-primary)] sm:text-5xl mb-6"
          >
            Staff <span className="text-[var(--color-primary)]">Login Portal</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Select your professional role to access your secure dashboard and management tools.
          </motion.p>
        </div>

        <BackgroundPanel
          images={[
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1499696019995-1c54fe36d4f3?auto=format&fit=crop&q=80&w=1600',
          ]}
          className="mb-16"
        >
          <div className="py-20 px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-200 mb-4">Your role, your workflow</p>
              <h3 className="text-3xl font-bold text-white mb-4">Secure access for every care team member</h3>
              <p className="text-slate-100 max-w-2xl mx-auto leading-relaxed">
                Choose the right portal for your work and unlock tools built for patients, doctors, or healthcare operations.
              </p>
            </motion.div>
          </div>
        </BackgroundPanel>

        {/* Role Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {roles.map((role) => (
            <motion.div 
              key={role.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-[var(--border-primary)]"
            >
              {/* Card Header */}
              <div className={`p-8 bg-${role.color}-50 flex flex-col items-center text-center group-hover:bg-${role.color}-100 transition-colors`}>
                <div className={`w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] shadow-md flex items-center justify-center text-${role.color}-600 mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {role.icon}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{role.title}</h3>
                <p className={`text-sm font-semibold text-${role.color}-600 uppercase tracking-wider mt-1`}>
                  {role.subtitle}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-grow flex flex-col">
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed text-center">
                  {role.description}
                </p>
                
                <div className="space-y-3 mb-8">
                  {role.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center text-sm text-[var(--text-secondary)]">
                      <CheckCircle2 className={`w-4 h-4 mr-2 text-${role.color}-500 flex-shrink-0`} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link 
                    to={`/auth/${role.id}/signin`}
                    className={`flex items-center justify-center w-full py-4 px-6 rounded-2xl font-bold text-white bg-[var(--color-primary)] hover:bg-gray-800 transition-all group/btn shadow-lg`}
                  >
                    Secure Sign In
                    <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default GetStarted;


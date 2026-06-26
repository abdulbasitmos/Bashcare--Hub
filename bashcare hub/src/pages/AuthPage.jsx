import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import { ShieldCheck, Lock } from 'lucide-react';
import { db } from '../utils/db';

const AuthPage = ({ onLogin }) => {
  const { role, mode } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const isStaff = role === 'admin' || role === 'officer';
  const currentMode = (isPatient || isDoctor) ? mode : 'signin';
  const isSignUp = currentMode === 'signup';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    securityKey: '',
    gender: '',
    phone: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // ... (keep all existing handlers: handleForgotPassword, handleSubmit, handleGoogleLogin)

  // ... (keep constants: MASTER_KEYS, roleNames)

  // ... (keep existing logic inside handleSubmit/handleGoogleLogin)

  // Re-define handleForgotPassword, handleSubmit, handleGoogleLogin exactly as they were, just inside the new component structure.
  
  // (Assuming handlers and constants are kept, just rendering with motion.div)

  // Keys for specific roles
  const MASTER_KEYS = {
    admin: "ADMIN_SECURE_2026",
    officer: "OFFICER_HUB_2026"
  };

  const roleNames = {
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'System Admin',
    officer: 'Verification Officer',
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email address to recover your password.');
      return;
    }

    try {
      await db.forgotPassword(formData.email);
      setSuccess('A temporary password has been sent to your email address.');
    } catch (err) {
      setError(err.message || 'Failed to send recovery email. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Logic for Staff (Only Key or Email + Staff ID)
    if (isStaff) {
      try {
        const sessionData = await db.staffLogin({
          role: role,
          securityKey: formData.securityKey,
          email: formData.email
        });
        
        // CRITICAL: Call onLogin to update the session in App.jsx
        if (onLogin) onLogin(sessionData);
        
        navigate(`/dashboard/${role}`);
        return;
      } catch (err) {
        setError(err.message || 'Incorrect credentials or unauthorized role.');
        return;
      }
    }

    // Logic for Patients/Doctors (Email + Password)
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      if (isSignUp) {
        if (isDoctor) {
          if (!formData.gender) {
            setError('Please select your gender.');
            return;
          }
          if (!formData.phone) {
            setError('Please enter your phone number.');
            return;
          }
          if (!formData.agreeTerms) {
            setError('You must agree to the Terms and Conditions.');
            return;
          }
        }

        const sessionData = await db.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role, // 'patient' or 'doctor'
          gender: isDoctor ? formData.gender : undefined,
          phone: isDoctor ? formData.phone : undefined
        });
        
        // If doctor, we might want to show a 'pending' message, but for now let's just log in
        onLogin(sessionData);
        navigate(`/dashboard/${role}`);
      } else {
        // Sign In
        const sessionData = await db.login({
          email: formData.email,
          password: formData.password
        });
        
        // Fix: Role check should be strict for patients and doctors
        if (sessionData.user.role !== role) {
          setError(`This account is not registered as a ${role}.`);
          return;
        }

        onLogin(sessionData);
        navigate(`/dashboard/${role}`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setSuccess('');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiBase}/api/auth/google?role=${role}`;
  };


  const title = isStaff ? `${roleNames[role]} Access` : isSignUp ? `Create ${roleNames[role]} Account` : `${roleNames[role]} Sign In`;
  const subtitle = isStaff 
    ? "Enter your secure access key to unlock the management portal."
    : isSignUp 
      ? "Join Bashcare Hub today and take control of your healthcare journey." 
      : "Welcome back! Please enter your details.";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AuthLayout title={title} subtitle={subtitle}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl animate-in fade-in duration-300 flex items-center gap-2">
              <Lock size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm font-medium rounded-xl animate-in fade-in duration-300 flex items-center gap-2">
              <ShieldCheck size={16} /> {success}
            </div>
          )}

          {/* Staff-Only View: Only Security Key */}
          {isStaff ? (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-blue-100 mb-6">
                <p className="text-[11px] text-[var(--color-primary)] font-bold uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Security Protocol Active
                </p>
                <p className="text-xs text-blue-500 mt-1 leading-relaxed">
                  This area is restricted. Enter your personal staff email and staff ID access key to log in, or leave email blank to use the master key.
                </p>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Staff Email Address <span className="text-[10px] text-gray-400 font-normal">(Leave empty for Master Key)</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="staff@bashcare.internal"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="securityKey" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Authorized Access Key / Staff ID
                </label>
                <div className="mt-1 relative">
                  <input
                    id="securityKey"
                    name="securityKey"
                    type="password"
                    required
                    value={formData.securityKey}
                    onChange={(e) => setFormData({...formData, securityKey: e.target.value})}
                    className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-all text-center tracking-[0.5em] font-black"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Patient & Doctor View: Standard Login */
            <>
              {(isSignUp && (isPatient || isDoctor)) && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {isDoctor && (
                    <>
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-secondary)]">
                          Gender
                        </label>
                        <div className="mt-1">
                          <select
                            id="gender"
                            name="gender"
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary)]">
                          Phone Number
                        </label>
                        <div className="mt-1">
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder={`${role}@example.com`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="appearance-none block w-full px-4 py-3 border border-[var(--border-primary)] rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[var(--color-primary)] focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-primary)]">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-[var(--color-primary)] hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isSignUp && isDoctor && (
            <div className="flex items-start gap-2 py-2">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="agreeTerms" className="font-medium text-[var(--text-secondary)] cursor-pointer select-none">
                  I agree to the <span className="text-[var(--color-primary)] hover:underline font-bold">Terms of Service</span> and <span className="text-[var(--color-primary)] hover:underline font-bold">Privacy Policy</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all active:scale-[0.98] ${
                isStaff ? 'bg-[var(--color-primary)] hover:bg-black' : 'bg-[var(--color-primary)] hover:bg-blue-700'
              }`}
            >
              {isStaff ? 'Unlock Portal' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {!isStaff && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-primary)]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--bg-secondary)] px-2 text-[var(--text-secondary)] font-bold">Or continue with</span>
              </div>
            </div>
          )}

          {!isStaff && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-[var(--border-primary)] rounded-xl shadow-sm text-sm font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.5c-3.56 0-6.44 2.88-6.44 6.44s2.88 6.44 6.44 6.44 6.44-2.88 6.44-6.44-2.88-6.44-6.44-6.44z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 15.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"
                />
                <path
                  fill="#4285F4"
                  d="M16.5 12c0 .87-.13 1.68-.37 2.43l-4.45-3.83 .03-.05z"
                />
                <path
                  fill="#34A853"
                  d="M12 15.5c1.38 0 2.54-.56 3.34-1.4l2.23 1.72c-.8 1.45-2.1 2.36-3.68 2.36-2.48 0-4.5-2.02-4.5-4.5 0-2.48 2.02-4.5 4.5-4.5z"
                />
              </svg>
              Sign in with Google
            </button>
          )}
        </form>

        <div className="mt-6 text-center space-y-4">
          {isStaff ? (
            <div className="pt-4">
              <Link 
                to="/get-started"
                className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
              >
                ← Cancel & Back to Selection
              </Link>
            </div>
          ) : (
            <>
              {!(isDoctor && !isSignUp) && (
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <Link 
                    to={`/auth/${role}/${isSignUp ? 'signin' : 'signup'}`}
                    className="font-medium text-[var(--color-primary)] hover:text-blue-500"
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Link>
                </p>
              )}
              <div className="pt-6 border-t border-[var(--border-primary)] space-y-3">
                {!isPatient && (
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-2">Healthcare Professional?</p>
                    <Link 
                      to="/get-started"
                      className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      Go to Staff Portal →
                    </Link>
                  </div>
                )}
                <div>
                  <Link 
                    to="/"
                    className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    ← Go Back Home
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </AuthLayout>
    </motion.div>
  );
};

export default AuthPage;


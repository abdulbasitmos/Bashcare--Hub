import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/db';

const MockGoogleLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'patient';
  const isPatient = role === 'patient';

  const [isCustomAccount, setIsCustomAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectAccount = async (selectedEmail, selectedName) => {
    setError('');
    setLoading(true);
    try {
      const mockToken = `mock_${selectedEmail}_${encodeURIComponent(selectedName)}`;
      const sessionData = await db.googleLogin({
        idToken: mockToken,
        role: role,
        email: selectedEmail,
        name: selectedName
      });
      
      const userJson = encodeURIComponent(JSON.stringify({
        id: sessionData.user.id || sessionData.user._id,
        name: sessionData.user.name,
        email: sessionData.user.email,
        role: sessionData.user.role,
        status: sessionData.user.status
      }));

      // Redirect through standard auth-callback route to establish session
      window.location.href = `/auth-callback?token=${sessionData.token}&user=${userJson}`;
    } catch (err) {
      setError(err.message || 'Simulation authentication failed.');
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Please fill in both email and name.');
      return;
    }
    handleSelectAccount(email, name);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#c2e7ff]">
      
      {/* Main Google Login Card */}
      <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-3xl p-10 shadow-sm relative min-h-[500px] flex flex-col justify-between">
        
        <div>
          {/* Google Logo */}
          <div className="flex justify-start mb-6">
            <svg className="h-[24px]" viewBox="0 0 24 24" width="74" height="24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.86-4.53-6.16-4.53z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-[24px] font-normal text-[#202124] leading-8 tracking-tight mb-2">
            Sign in
          </h1>
          <p className="text-sm text-[#5f6368] mb-6 flex items-center gap-1">
            to continue to <span className="font-semibold text-[#1a73e8]">Bashcare Hub</span>
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[#5f6368] mt-4 font-semibold">Logging in with Google SSO...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isCustomAccount ? (
                /* Account Chooser list */
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-2 mt-4"
                >
                  <p className="text-xs font-bold text-[#5f6368] mb-2 uppercase tracking-wide">
                    Choose a simulated {role} account:
                  </p>
                  
                  {isPatient ? (
                    <>
                      <button 
                        onClick={() => handleSelectAccount('alex.rivera@gmail.com', 'Alex Rivera')}
                        className="w-full flex items-center gap-3 p-3 border border-[#dadce0] hover:bg-slate-50 rounded-xl transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                          AR
                        </div>
                        <div className="flex-grow">
                          <span className="block text-sm font-bold text-[#3c4043] leading-none">Alex Rivera</span>
                          <span className="text-xs text-[#5f6368] mt-0.5 block">alex.rivera@gmail.com</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleSelectAccount('emma.watson@gmail.com', 'Emma Watson')}
                        className="w-full flex items-center gap-3 p-3 border border-[#dadce0] hover:bg-slate-50 rounded-xl transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center font-bold text-sm">
                          EW
                        </div>
                        <div className="flex-grow">
                          <span className="block text-sm font-bold text-[#3c4043] leading-none">Emma Watson</span>
                          <span className="text-xs text-[#5f6368] mt-0.5 block">emma.watson@gmail.com</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleSelectAccount('sarah.jenkins@gmail.com', 'Dr. Sarah Jenkins')}
                        className="w-full flex items-center gap-3 p-3 border border-[#dadce0] hover:bg-slate-50 rounded-xl transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                          SJ
                        </div>
                        <div className="flex-grow">
                          <span className="block text-sm font-bold text-[#3c4043] leading-none">Dr. Sarah Jenkins</span>
                          <span className="text-xs text-[#5f6368] mt-0.5 block">sarah.jenkins@gmail.com</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleSelectAccount('marcus.vance@gmail.com', 'Dr. Marcus Vance')}
                        className="w-full flex items-center gap-3 p-3 border border-[#dadce0] hover:bg-slate-50 rounded-xl transition-all text-left"
                      >
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                          MV
                        </div>
                        <div className="flex-grow">
                          <span className="block text-sm font-bold text-[#3c4043] leading-none">Dr. Marcus Vance</span>
                          <span className="text-xs text-[#5f6368] mt-0.5 block">marcus.vance@gmail.com</span>
                        </div>
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => setIsCustomAccount(true)}
                    className="w-full flex items-center gap-3 p-3 border border-dashed border-[#dadce0] hover:border-[#1a73e8] hover:bg-slate-50 rounded-xl transition-all text-left mt-4"
                  >
                    <div className="w-9 h-9 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm">
                      +
                    </div>
                    <span className="text-sm font-semibold text-[#1a73e8]">Use another Google account</span>
                  </button>
                </motion.div>
              ) : (
                /* Custom Google Email Form */
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleCustomSubmit}
                  className="space-y-4 mt-2"
                >
                  <p className="text-xs font-bold text-[#5f6368] mb-2 uppercase tracking-wide">
                    Enter Google Profile Details:
                  </p>

                  <div className="relative group border border-[#dadce0] rounded-lg focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] transition-all">
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-transparent outline-none text-[#202124]"
                      placeholder="Display Name"
                    />
                  </div>

                  <div className="relative group border border-[#dadce0] rounded-lg focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] transition-all">
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-transparent outline-none text-[#202124]"
                      placeholder="Google Email"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCustomAccount(false)}
                      className="text-sm font-semibold text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                    >
                      Back to Selector
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors active:scale-[0.98]"
                    >
                      Sign In
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Guest Warning */}
        <div className="mt-8 pt-4 border-t border-[#f1f3f4] text-xs text-[#5f6368] leading-relaxed">
          To sign in, choose one of the pre-configured sandbox testing profiles or enter your own custom Google credentials. Your browser session will be securely linked.
        </div>

      </div>

      {/* Google Standard Login Footer */}
      <div className="w-full max-w-[450px] flex items-center justify-between text-xs text-[#5f6368] mt-4 px-4 font-sans">
        <div className="relative">
          <select className="bg-transparent border-none outline-none cursor-pointer hover:text-[#202124]">
            <option>English (United States)</option>
          </select>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#202124]">Help</a>
          <a href="#" className="hover:text-[#202124]">Privacy</a>
          <a href="#" className="hover:text-[#202124]">Terms</a>
        </div>
      </div>

    </div>
  );
};

export default MockGoogleLogin;

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import BackgroundPanel from '../components/BackgroundPanel';
import { db } from '../utils/db';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await db.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundPanel
        images={[
          'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=1600',
          'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=1600',
        ]}
        className="absolute inset-0"
      />
      <div className="relative z-10 flex items-center justify-center p-6 min-h-screen">
        <motion.div className="max-w-md w-full bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl p-12 text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {status === 'loading' && (
            <div className="space-y-6">
              <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin mx-auto" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verifying your email...</h1>
              <p className="text-[var(--text-secondary)]">Please wait while we confirm your account.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verified!</h1>
              <p className="text-[var(--text-secondary)]">{message}</p>
              <Link 
                to="/get-started" 
                className="inline-block w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Back to Sign In
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verification Failed</h1>
              <p className="text-[var(--text-secondary)]">{message}</p>
              <Link 
                to="/contact" 
                className="inline-block w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                Contact Support
              </Link>
              <Link to="/" className="block text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Return Home
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;


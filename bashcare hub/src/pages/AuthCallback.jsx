import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../utils/db';

const AuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');
    const mock = searchParams.get('mock');
    const role = searchParams.get('role') || 'patient';

    if (mock === 'true') {
      // Backend redirected to mock page because OAuth keys are not configured.
      // Send them to the signin page and trigger the Google Auth simulation modal automatically.
      navigate(`/auth/${role}/signin?showMockGoogle=true`);
      return;
    }

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        const sessionData = { user, token };
        
        // Save session locally
        db.setSession(sessionData);
        
        // Call onLogin prop to update global session state
        if (onLogin) {
          onLogin(sessionData);
        }
        
        // Redirect to dashboard
        navigate(`/dashboard/${user.role}`);
      } catch (err) {
        console.error("Error parsing Google OAuth callback data:", err);
        navigate(`/auth/${role}/signin?error=Google authentication failed`);
      }
    } else {
      // Missing query parameters
      navigate(`/auth/patient/signin`);
    }
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Completing Google Sign In...</h2>
      <p className="text-[var(--text-secondary)] text-sm mt-2">Please wait while we secure your session credentials.</p>
    </div>
  );
};

export default AuthCallback;

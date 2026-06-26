import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Typography from '../components/ui/Typography';
import PageWrapper from '../components/layout/PageWrapper';
import { db } from '../utils/db';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isLogin) {
        result = await db.login({ email: formData.email, password: formData.password });
      } else {
        result = await db.register(formData);
      }
      db.setSession(result);
      if (onLogin) onLogin(result);
      navigate(`/dashboard/${result.user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card variant="glass" className="p-8">
            <div className="text-center mb-8">
              <Typography variant="h2" className="mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Typography>
              <Typography variant="muted">
                {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join Bashcare for smarter healthcare.'}
              </Typography>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <Input 
                  label="Full Name" 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              )}
              <Input 
                label="Email" 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              
              <Button size="lg" className="mt-4 w-full" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[var(--primary)] font-medium hover:underline"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default AuthPage;

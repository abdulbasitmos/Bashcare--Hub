import { Link } from 'react-router-dom';
import BackgroundPanel from './BackgroundPanel';
import { LogoIcon } from './Logo';

const AuthLayout = ({ children, title, subtitle }) => {
  const images = [
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1580281657521-8f8c45a4f8fc?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600',
  ];

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <LogoIcon className="h-10 w-10" animated={true} />
          <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Bashcare<span className="text-[var(--text-secondary)]">Hub</span></span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-secondary)] py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


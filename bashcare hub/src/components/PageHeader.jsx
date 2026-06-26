import { Link } from 'react-router-dom';
import { LogoIcon } from './Logo';

const PageHeader = ({ title, subtitle, breadcrumb, videoUrl }) => {
  return (
    <div className="relative bg-white dark:bg-slate-950 pt-40 pb-20 overflow-hidden transition-colors duration-300 border-b border-gray-100 dark:border-slate-900">
      {videoUrl && (
        <>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-75 z-0"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/70 backdrop-blur-[0.5px] z-0 transition-colors duration-300" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="flex justify-center mb-6">
          <LogoIcon className="h-16 w-16" animated={true} />
        </div>
        {breadcrumb && (
          <nav className="flex justify-center mb-4 text-slate-500 dark:text-blue-100 text-sm font-medium">
            <Link to="/" className="hover:text-[var(--color-primary)] dark:hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">{breadcrumb}</span>
          </nav>
        )}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white sm:text-3xl md:text-4xl md:text-3xl md:text-4xl lg:text-5xl leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-xl text-slate-500 dark:text-blue-150 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;


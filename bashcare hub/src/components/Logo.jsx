import { Link } from 'react-router-dom';

export const LogoIcon = ({ className = 'h-10 w-10', animated = true }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} overflow-visible`}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
          <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
          <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
        </linearGradient>
        
        <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
        </linearGradient>

        {/* Pulse Glow Filter */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {animated && (
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14% { transform: scale(1.08); }
            28% { transform: scale(1); }
            42% { transform: scale(1.08); }
            70% { transform: scale(1); }
          }
          @keyframes draw-ecg {
            0% { stroke-dashoffset: 240; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes rotate-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes ripple {
            0% { transform: scale(0.95); opacity: 0.8; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .heartbeat-element {
            transform-origin: 50px 50px;
            animation: heartbeat 2.5s infinite ease-in-out;
          }
          .ecg-line {
            stroke-dasharray: 120 120;
            stroke-dashoffset: 240;
            animation: draw-ecg 3s infinite linear;
          }
          .rotating-ring {
            transform-origin: 50px 50px;
            animation: rotate-ring 20s infinite linear;
          }
          .pulse-ripple {
            transform-origin: 50px 50px;
            animation: ripple 2.5s infinite cubic-bezier(0.24, 0, 0.38, 1);
          }
        `}</style>
      )}

      {/* Ripple ring behind */}
      {animated && (
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#glow-grad)" strokeWidth="3" className="pulse-ripple" />
      )}

      {/* Outer Dotted Rotating Ring */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#logo-grad)" strokeWidth="1.5" strokeDasharray="6 4" className={animated ? "rotating-ring opacity-60" : "opacity-40"} />
      
      {/* Outer Solid Ring */}
      <circle cx="50" cy="50" r="39" fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" className="opacity-80" />

      {/* Center Medical Cross with gradient fill */}
      <g className={animated ? "heartbeat-element" : ""} filter="url(#logo-glow)">
        {/* Soft rounded medical cross shape */}
        <rect x="43" y="24" width="14" height="52" rx="7" fill="url(#logo-grad)" />
        <rect x="24" y="43" width="52" height="14" rx="7" fill="url(#logo-grad)" />
        
        {/* Inner white light cross detailing */}
        <rect x="46" y="27" width="8" height="46" rx="4" fill="#ffffff" opacity="0.3" />
        <rect x="27" y="46" width="46" height="8" rx="4" fill="#ffffff" opacity="0.3" />
      </g>

      {/* ECG Heartbeat Trace Overlay */}
      {/* Starting from left boundary, sweeping through, peaking in center, exiting right */}
      <path 
        d="M 18 50 Q 25 50 30 50 L 35 40 L 40 60 L 45 20 L 50 80 L 55 45 L 60 55 L 65 50 L 82 50" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={animated ? "ecg-line" : ""} 
        style={{ filter: 'drop-shadow(0px 0px 3px rgba(255,255,255,0.95))' }}
      />
    </svg>
  );
};

export const LogoFull = ({ isScrolled = false, lightMode = false, animate = true, textClass = "" }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <LogoIcon className="h-9 w-9 sm:h-10 sm:w-10" animated={animate} />
      <span className={`text-xl sm:text-2xl font-black tracking-tight ${textClass}`}>
        <span className={isScrolled ? 'text-[var(--color-primary)]' : lightMode ? 'text-blue-300' : 'text-blue-400'}>
          Bashcare
        </span>
        <span className={isScrolled ? 'text-slate-800 dark:text-white' : 'text-white'}>
          Hub
        </span>
      </span>
    </div>
  );
};

export default LogoFull;

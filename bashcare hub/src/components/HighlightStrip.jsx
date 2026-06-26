
const ICONS = [
  // Stethoscope
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  // Heart
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  // Activity
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  // Shield
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  // Clock
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  // User
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  // Star
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  // Pill
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
];

const LABELS = [
  'Expert Doctors', '24/7 Support', 'Health Tracking', 'Secure Records',
  'Fast Appointments', 'Personal Care', 'Top Rated', 'Online Pharmacy',
  'Lab Results', 'Mental Health', 'Nutrition Plans', 'Telehealth',
  'Specialist Access', 'Family Plans', 'Emergency Care', 'Dental Services',
  'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology',
  'Orthopedics', 'Gynecology', 'Diagnostics', 'Vaccination',
  'Cancer Screening', 'Eye Care', 'Physical Therapy', 'Surgery',
  'Radiology', 'Pharmacy', 'AI Diagnostics', 'Home Visits',
  'Second Opinion', 'Wellness Check',
];

const HighlightStrip = () => {
  const highlights = LABELS.map((label, i) => ({
    title: label,
    icon: ICONS[i % ICONS.length],
  }));

  const displayHighlights = [...highlights, ...highlights];

  return (
    <div className="py-12 bg-[var(--bg-secondary)] overflow-hidden border-y border-gray-100 dark:border-slate-800 transition-colors">
      <div className="flex animate-scroll whitespace-nowrap">
        {displayHighlights.map((h, i) => (
          <div key={i} className="inline-flex mx-4 min-w-[220px] p-4 bg-[var(--bg-primary)] rounded-2xl border border-blue-100/60 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-default items-center gap-3 shadow-sm hover:shadow-md dark:shadow-none duration-300">
            <div
              className="w-10 h-10 flex-shrink-0"
              dangerouslySetInnerHTML={{ __html: h.icon }}
            />
            <h4 className="text-sm font-bold text-[var(--text-primary)] whitespace-normal">{h.title}</h4>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default HighlightStrip;


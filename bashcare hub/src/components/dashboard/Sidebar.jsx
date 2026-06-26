import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserRound, 
  MessageSquare, 
  FileText, 
  Pill, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  ShieldCheck,
  Building2,
  Activity,
  ShieldAlert,
  Video,
  BarChart3,
  ClipboardList,
  Cpu,
  Home,
  Heart
} from 'lucide-react';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { LogoIcon } from '../Logo';
import { db } from '../../utils/db';

const Sidebar = ({ role, onLogout }) => {
  const location = useLocation();
  const { t } = useGlobalSettings();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpenMobile(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);
  
  const menuItems = {
    patient: [
      { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/patient' },
      { name: t('appointments'), icon: <Calendar size={20} />, path: '/dashboard/patient/appointments' },
      { name: t('doctors'), icon: <UserRound size={20} />, path: '/dashboard/patient/doctors' },
      { name: t('messages'), icon: <MessageSquare size={20} />, path: '/dashboard/patient/messages' },
      { name: t('records'), icon: <FileText size={20} />, path: '/dashboard/patient/records' },
      { name: t('prescriptions'), icon: <Pill size={20} />, path: '/dashboard/patient/prescriptions' },
      { name: t('notifications'), icon: <Bell size={20} />, path: '/dashboard/patient/notifications' },
      { name: t('documents') || 'Documents', icon: <FileText size={20} />, path: '/dashboard/patient/documents' },
      { name: t('symptomGuide') || 'Symptom Guide', icon: <Activity size={20} />, path: '/dashboard/patient/symptom-guide' },
      { name: t('vitals') || 'Health Tracker', icon: <Heart size={20} />, path: '/dashboard/patient/vitals' },
      { name: 'Emergency Support', icon: <ShieldAlert size={20} className="text-red-500 animate-pulse" />, path: '/dashboard/patient/emergency' },
    ],
    doctor: [
      { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/doctor' },
      { name: t('queue'), icon: <Activity size={20} />, path: '/dashboard/doctor/queue' },
      { name: t('patients'), icon: <Users size={20} />, path: '/dashboard/doctor/patients' },
      { name: t('messages'), icon: <MessageSquare size={20} />, path: '/dashboard/doctor/messages' },
      { name: t('consultations'), icon: <FileText size={20} />, path: '/dashboard/doctor/consultations' },
      { name: t('prescriptions'), icon: <Pill size={20} />, path: '/dashboard/doctor/prescriptions' },
      { name: t('schedule'), icon: <Calendar size={20} />, path: '/dashboard/doctor/schedule' },
      { name: 'Clinical Notes', icon: <ClipboardList size={20} />, path: '/dashboard/doctor/notes' },
      { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/dashboard/doctor/analytics' },
      { name: 'Staff Meetings', icon: <Video size={20} />, path: '/dashboard/doctor/meetings' },
    ],
    admin: [
      { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/admin' },
      { name: 'Staff Meetings', icon: <Video size={20} />, path: '/dashboard/admin/meetings' },
      { name: t('verifications'), icon: <ShieldCheck size={20} />, path: '/dashboard/admin/verifications' },
      { name: t('monitoring'), icon: <Activity size={20} />, path: '/dashboard/admin/monitoring' },
      { name: t('users'), icon: <Users size={20} />, path: '/dashboard/admin/users' },
      { name: t('staff'), icon: <ShieldAlert size={20} />, path: '/dashboard/admin/staff' },
      { name: t('departments'), icon: <Building2 size={20} />, path: '/dashboard/admin/departments' },
      { name: t('finance'), icon: <FileText size={20} />, path: '/dashboard/admin/finance' },
      { name: t('logs'), icon: <Activity size={20} />, path: '/dashboard/admin/logs' },
    ],
    officer: [
      { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard/officer' },
      { name: t('pending'), icon: <ShieldCheck size={20} />, path: '/dashboard/officer/pending' },
      { name: t('directory'), icon: <Users size={20} />, path: '/dashboard/officer/directory' },
      { name: t('audit'), icon: <FileText size={20} />, path: '/dashboard/officer/audits' },
    ]
  };

  const session = db.getSession();
  const user = session?.user;

  const currentMenu = (menuItems[role] || []).filter((item) => {
    if (role !== 'admin') return true;
    if (!user) return true;
    if (user.email === 'admin@bashcare.internal' || !user.email) return true;
    if (user.accessiblePages && Array.isArray(user.accessiblePages) && user.accessiblePages.length > 0) {
      const parts = item.path.split('/');
      const pageKey = parts[parts.length - 1] === 'admin' ? 'overview' : parts[parts.length - 1];
      return user.accessiblePages.includes(pageKey);
    }
    return true;
  });

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-screen border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } shadow-lg md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
      <div className="p-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <LogoIcon className="h-8 w-8" animated={true} />
          <span className="text-base font-black tracking-tight transition-transform duration-300 group-hover:scale-102">
            <span className="text-[#2563EB]">Bashcare</span>
            <span className="text-slate-800 dark:text-slate-200">Hub</span>
          </span>
        </Link>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-10.5">
          {role} portal
        </p>
      </div>

      <nav className="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpenMobile(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-450 shadow-sm hover:shadow-md transition-shadow font-semibold' 
                  : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium'
              }`}
            >
              <span className={`${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors'}`}>
                {item.icon}
              </span>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-slate-800 space-y-1">
        <Link
          to="/"
          onClick={() => setIsOpenMobile(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all"
        >
          <Home size={18} />
          <span className="font-medium text-xs">Back to Website</span>
        </Link>
        <Link
          to={`/dashboard/${role}/settings`}
          onClick={() => setIsOpenMobile(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all"
        >
          <Settings size={18} />
          <span className="font-medium text-xs">{t('settings')}</span>
        </Link>
        <button
          onClick={() => {
            setIsOpenMobile(false);
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all border-none bg-transparent cursor-pointer"
        >
          <LogOut size={18} />
          <span className="font-medium text-xs">{t('logout')}</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;


import { useState } from 'react';
import { 
  Lock, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Shield, 
  Eye, 
  EyeOff,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useGlobalSettings } from '../../../context/GlobalSettingsContext';


const Settings = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useGlobalSettings();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">{t('settings')}</h1>
        <p className="text-slate-500 text-sm">Configure your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Account Security */}
        <section className="dash-card p-8">
          <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" /> Password & Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 "
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 "
                />
              </div>
              <button className="px-6 py-3 bg-blue-600 (--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                Update Password
              </button>
            </div>
            <div className="bg-[#f8fafc]  p-6 rounded-[24px] border border-blue-100 ">
              <h4 className="text-sm font-bold text-blue-900  mb-2">Two-Factor Authentication</h4>
              <p className="text-xs text-blue-600  font-medium mb-4 leading-relaxed">
                Add an extra layer of security to your account by enabling 2FA.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                Enable 2FA
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="dash-card p-8">
          <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Notification Preferences
          </h2>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900  capitalize">{key} Notifications</h4>
                  <p className="text-xs text-slate-500 font-medium">Receive updates via {key}.</p>
                </div>
                <button 
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-blue-600' : 'bg-gray-200 '}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Appearance & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="dash-card p-8">
            <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
              <Monitor size={20} className="text-blue-600" /> Appearance
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={18} className="text-blue-600" /> : <Sun size={18} className="text-[#F59E0B]" />}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 ">Dark Mode</h4>
                  <p className="text-xs text-slate-500 font-medium">Switch between light and dark.</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 '}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          <section className="dash-card p-8">
            <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
              <Globe size={20} className="text-blue-600" /> Language
            </h2>
            <div className="space-y-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 "
              >
                <option value="en">English (US)</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
                <option value="yo">Yorùbá (Yoruba)</option>
                <option value="de">Deutsch (German)</option>
                <option value="pt">Português (Portuguese)</option>
              </select>
            </div>
          </section>
        </div>

        {/* Privacy */}
        <section className="dash-card p-8">
          <h2 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" /> Privacy Settings
          </h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all text-left">
              <div>
                <h4 className="text-sm font-bold text-slate-900 ">Data Sharing</h4>
                <p className="text-xs text-slate-500 font-medium">Manage how your data is shared with researchers.</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 " />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all text-left">
              <div>
                <h4 className="text-sm font-bold text-slate-900 ">Account Privacy</h4>
                <p className="text-xs text-slate-500 font-medium">Control who can see your profile information.</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 " />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;


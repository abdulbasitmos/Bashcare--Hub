import { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Shield, 
  Save,
  Camera,
  Stethoscope,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { db } from '../../../utils/db';
import { useGlobalSettings } from '../../../context/GlobalSettingsContext';

const Settings = ({ user }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: 'General Practitioner',
    bio: '',
    phone: '',
    experience: '0 years',
    profilePicture: ''
  });

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        const doctor = await db.getDoctor(user.id);
        if (doctor) {
          setFormData({
            name: doctor.name || user?.name || '',
            email: doctor.email || user?.email || '',
            specialty: doctor.specialty || 'General Practitioner',
            bio: doctor.bio || '',
            phone: doctor.phone || user?.phone || '',
            experience: doctor.experience || '0 years',
            profilePicture: doctor.profilePicture || ''
          });
        }
      } catch (err) {
        console.error("Error loading doctor settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctorData();
  }, [user.id, user?.name, user?.email, user?.phone]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        db.updateDoctor(user.id, formData),
        db.updateUser(user.id, { name: formData.name, phone: formData.phone })
      ]);
      alert('Profile updated successfully!');
      // Force reload page to apply top navbar updates or trigger state refresh
      window.location.reload();
    } catch (error) {
      console.error("Error saving profile settings:", error);
      alert('Failed to save profile changes.');
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-slate-500">Loading settings dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">{t('settings')}</h1>
        <p className="text-slate-500 text-sm">Manage your professional profile and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-4">
          {[
            { id: 'profile', label: 'Profile Information', icon: <UserIcon size={18} /> },
            { id: 'preferences', label: 'App Preferences', icon: <SettingsIcon size={18} /> },
            { id: 'security', label: 'Security & Privacy', icon: <Shield size={18} /> },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white  text-slate-500 hover:bg-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'profile' && (
            <section className="dash-card p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[24px] bg-blue-100  flex items-center justify-center text-blue-600  font-bold text-3xl shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border-2 border-white  overflow-hidden">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'DR'
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-black transition-all cursor-pointer">
                    <Camera size={14} />
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({...formData, profilePicture: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 ">{formData.name || 'Dr. Professional'}</h3>
                  <p className="text-sm text-slate-500 font-medium">{formData.specialty}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-50  text-green-600  rounded-full text-[10px] font-black uppercase tracking-widest">
                    Verified Professional
                  </span>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 "
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Specialty</label>
                    <div className="relative">
                      <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        required
                        value={formData.specialty}
                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 "
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium opacity-60 cursor-not-allowed text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 "
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Years of Experience</label>
                    <input 
                      type="text" 
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="e.g. 10 years"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 "
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Professional Bio</label>
                  <textarea 
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell patients about your expertise and background..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium resize-none text-slate-900 "
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save size={18} /> Update Profile
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <section className="dash-card p-8">
                <h3 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
                  <Moon size={20} className="text-blue-600" /> Visual Interface
                </h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} className="text-blue-600" /> : <Sun size={18} className="text-[#F59E0B]" />}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 ">Dark Mode</h4>
                      <p className="text-xs text-slate-500 font-medium">Toggle between light and dark themes.</p>
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
                <h3 className="text-lg font-bold text-slate-900  mb-6 flex items-center gap-2">
                  <Globe size={20} className="text-blue-600" /> Language Settings
                </h3>
                <div className="space-y-4">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 "
                  >
                    <option value="en">English (Global)</option>
                    <option value="fr">Français (French)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'security' && (
            <section className="bg-red-50  p-8 rounded-[24px] border border-red-100 ">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-red-900 ">Danger Zone</h3>
                  <p className="text-sm text-red-700/70 ">Permanently delete your professional account and all associated data.</p>
                </div>
                <button className="px-6 py-3 bg-white   text-red-600 rounded-xl font-bold text-xs hover:bg-red-50 transition-all shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
                  Delete Account
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

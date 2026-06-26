import { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Shield, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';

const Profile = ({ user }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dob: user?.dob || '',
    bloodGroup: user?.bloodGroup || 'O+',
    gender: user?.gender || 'Male',
    profileImage: user?.profileImage || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.id) {
          const latestUser = await db.getUser(user.id);
          setFormData({
            name: latestUser.name || '',
            email: latestUser.email || '',
            phone: latestUser.phone || '',
            address: latestUser.address || '',
            dob: latestUser.dob || '',
            bloodGroup: latestUser.bloodGroup || 'O+',
            gender: latestUser.gender || 'Male',
            profileImage: latestUser.profileImage || ''
          });
        }
      } catch (err) {
        console.error("Error fetching latest profile:", err);
      }
    };
    loadProfile();
  }, [user?.id]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await db.updateUser(user.id, formData);
      
      // Update local storage session
      const session = db.getSession();
      if (session) {
        session.user = updatedUser;
        db.setSession(session);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        profileImage: reader.result
      }));
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm">Manage your personal information and preferences.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 bg-[var(--bg-secondary)] text-slate-500 border border-[var(--border-primary)] rounded-xl font-bold text-sm hover:bg-[#f8fafc] transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : <Save size={18} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm border border-green-100"
        >
          <CheckCircle2 size={20} />
          Profile updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-[var(--bg-secondary)] p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-[var(--color-primary)]"></div>
            <div className="relative z-10">
              <div className="relative inline-block mb-4">
                <img 
                  src={formData.profileImage || `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=random&size=200`} 
                  alt="Profile Avatar" 
                  className="w-32 h-32 rounded-[24px] object-cover border-4 border-white shadow-lg mx-auto"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-[var(--bg-secondary)] text-slate-500 rounded-2xl shadow-lg border border-[var(--border-primary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Camera size={18} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{formData.name || 'John Doe'}</h2>
              <p className="text-sm font-medium text-slate-500 mb-6">{formData.email}</p>
              
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#f8fafc] text-[var(--color-primary)] rounded-xl text-xs font-bold uppercase tracking-widest">
                <Shield size={14} /> Verified Patient
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2">
          <div className="bg-[var(--bg-secondary)] p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)]">
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled={true}
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="date" 
                    value={formData.dob}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.address}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter home address"
                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                <select 
                  value={formData.bloodGroup}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  value={formData.gender}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

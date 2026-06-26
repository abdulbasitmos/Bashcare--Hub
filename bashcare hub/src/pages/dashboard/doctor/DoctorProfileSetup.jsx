import { useState } from 'react';
import { 
  User, 
  Stethoscope, 
  GraduationCap, 
  History, 
  Info,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../../utils/db';

const DoctorProfileSetup = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    specialty: '',
    experience: '',
    about: '',
    education: '',
    professionalRole: '',
    age: '',
    category: '',
    department: '',
    profilePicture: '',
    bio: ''
  });
  
  const [availableTime, setAvailableTime] = useState([
    { day: 'Monday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], active: true },
    { day: 'Tuesday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], active: true },
    { day: 'Wednesday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], active: true },
    { day: 'Thursday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], active: true },
    { day: 'Friday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'], active: true },
    { day: 'Saturday', slots: [], active: false },
    { day: 'Sunday', slots: [], active: false },
  ]);

  const [loading, setLoading] = useState(false);

  const toggleDay = (index) => {
    const newTimes = [...availableTime];
    newTimes[index].active = !newTimes[index].active;
    if (newTimes[index].active && newTimes[index].slots.length === 0) {
      newTimes[index].slots = ['09:00 AM - 05:00 PM'];
    }
    setAvailableTime(newTimes);
  };

  const updateSlots = (index, value) => {
    const newTimes = [...availableTime];
    newTimes[index].slots = value.split(',').map(s => s.trim());
    setAvailableTime(newTimes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const educationArray = formData.education.split(',').map(item => item.trim());
      const filteredAvailability = availableTime
        .filter(t => t.active)
        .map(({ day, slots }) => ({ day, slots }));

      await db.updateDoctor(user.id, {
        ...formData,
        education: educationArray,
        availableTime: filteredAvailability,
        status: 'active',
        isProfileComplete: true
      });
      alert('Profile completed successfully! Welcome to Bashcare Hub.');
      onComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[var(--color-primary)] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <Stethoscope size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-slate-500 font-medium text-lg">You're verified! Now let patients know about your expertise.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] rounded-[3rem] shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 border border-[var(--border-primary)] overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Profile Header Setup */}
              <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-50">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[24px] bg-white flex items-center justify-center text-slate-400 overflow-hidden border-4 border-white shadow-lg">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-3 bg-[var(--color-primary)] text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      hidden 
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
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{user.name}</h3>
                  <p className="text-slate-500 font-medium mb-4">{user.email}</p>
                  <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">Verified Professional</span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Age</label>
                  <input 
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-500">Professional Role / Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Senior Consultant Surgeon"
                    value={formData.professionalRole}
                    onChange={(e) => setFormData({...formData, professionalRole: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Specialty & Category */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <Stethoscope size={16} className="text-[var(--color-primary)]" /> Primary Specialty
                  </label>
                  <select 
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="">Select Specialty</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Category / Department</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Cardiology Department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <History size={16} className="text-[var(--color-primary)]" /> Years of Experience
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 8 years"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <GraduationCap size={16} className="text-[var(--color-primary)]" /> Education & Certifications
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Harvard Medical School, MD"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <Info size={16} className="text-[var(--color-primary)]" /> Professional Bio
                </label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Tell patients about your background, expertise, and approach to care..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value, about: e.target.value})}
                  className="w-full bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
                ></textarea>
              </div>

              {/* Availability */}
              <div className="space-y-6 pt-6 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold text-slate-900">Weekly Availability</label>
                  <p className="text-xs text-slate-500 font-medium">Set your consultation hours</p>
                </div>
                
                <div className="space-y-4">
                  {availableTime.map((day, index) => (
                    <div key={day.day} className={`p-6 rounded-[24px] border transition-all ${day.active ? 'bg-[#f8fafc]/30 border-blue-100' : 'bg-[#f8fafc] border-[var(--border-primary)] opacity-60'}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-4 min-w-[140px]">
                          <input 
                            type="checkbox" 
                            checked={day.active} 
                            onChange={() => toggleDay(index)}
                            className="w-5 h-5 rounded-md text-[var(--color-primary)] focus:ring-blue-500 border-gray-300"
                          />
                          <span className="font-bold text-slate-900">{day.day}</span>
                        </div>
                        
                        {day.active && (
                          <div className="flex-grow">
                            <input 
                              type="text"
                              placeholder="e.g. 09:00 AM - 12:00 PM, 02:00 PM - 05:00 PM"
                              value={day.slots.join(', ')}
                              onChange={(e) => updateSlots(index, e.target.value)}
                              className="w-full bg-[var(--bg-secondary)] border-none rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-blue-500/20 font-medium shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[var(--color-primary)] text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? 'Saving Profile...' : (
                  <>
                    <CheckCircle2 size={24} /> Complete Registration & Access Dashboard
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfileSetup;


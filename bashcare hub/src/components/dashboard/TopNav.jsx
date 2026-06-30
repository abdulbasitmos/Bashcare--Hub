import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Sun, Moon, Globe, Camera, Loader, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../utils/db';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import { useSearch } from '../../context/SearchContext';

const TopNav = ({ userName = "User", role = "patient" }) => {
  const navigate = useNavigate();
  const { t, theme, toggleTheme, language, setLanguage } = useGlobalSettings();
  const { allSearchableItems } = useSearch();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profilePic, setProfilePic] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const session = db.getSession();
        if (!session?.user) return;
        const userId = session.user.id || session.user._id;
        const base64 = reader.result;

        if (role === 'doctor') {
          await db.updateDoctor(userId, { profilePicture: base64 });
        } else {
          await db.updateUser(userId, { profileImage: base64 });
        }

        // Update local session
        const updatedUser = { ...session.user, profileImage: base64, profilePicture: base64 };
        session.user = updatedUser;
        db.setSession(session);

        // Update state
        setProfilePic(base64);
        alert("Profile picture updated successfully!");
        window.location.reload(); // Reload to sync with other components
      } catch (err) {
        console.error("Failed to upload profile picture:", err);
        alert("Upload failed: " + err.message);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const filteredSuggestions = searchQuery.trim()
    ? allSearchableItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item) => {
    navigate(item.link);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const session = db.getSession();
      if (session?.user) {
        try {
          const userId = session.user.id || session.user._id;
          const notes = await db.getNotifications(userId);
          setUnreadNotifications(Array.isArray(notes) ? notes.filter(n => !n.read).length : 0);
          
          const chats = await db.getChats();
          setUnreadMessages(Array.isArray(chats) && chats.length > 0 ? 1 : 0); 

          if (role === 'doctor') {
            const doctor = await db.getDoctor(userId);
            if (doctor && doctor.profilePicture) {
              setProfilePic(doctor.profilePicture);
            }
          } else {
            const usr = await db.getUser(userId);
            if (usr && (usr.profileImage || usr.profilePicture)) {
              setProfilePic(usr.profileImage || usr.profilePicture);
            }
          }
        } catch (error) {
          console.error("Failed to load TopNav data:", error);
        }
      }
    };
    loadData();
  }, [role]);

  return (
    <header className="h-20 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Mobile Sidebar Toggle */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
        className="md:hidden mr-3 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
        aria-label="Toggle Sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Search Bar */}
      <div className="flex-grow max-w-[150px] sm:max-w-xl mr-2 sm:mr-0">
        <form onSubmit={handleSearch} className="relative group" ref={searchInputRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('search') + "..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-white/60 dark:bg-slate-800/60 border border-white/35 dark:border-slate-700/30 focus:border-blue-200 focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm text-slate-900 dark:text-slate-100 shadow-sm"
          />
          <button type="submit" className="hidden">Search</button>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 z-40 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {filteredSuggestions.map((item, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-850 last:border-b-0 flex items-start justify-between group/item"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 group-hover/item:text-[var(--color-primary)]">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-primary)] bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {showSuggestions && searchQuery.trim() && filteredSuggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 z-40 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">No results found for "{searchQuery}"</p>
            </div>
          )}
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {/* Language Toggle Quick */}
          <div className="relative group">
            <button className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Globe size={22} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-36 bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border-primary)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              {[
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
                { code: 'yo', label: 'Yorùbá' },
                { code: 'de', label: 'Deutsch' },
                { code: 'pt', label: 'Português' },
              ].map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-white dark:hover:bg-slate-750 transition-colors ${language === lang.code ? 'text-[var(--color-primary)] bg-slate-50/50' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Link 
            to={`/dashboard/${role}/notifications`}
            className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 rounded-xl relative transition-colors"
          >
            <Bell size={22} />
            {unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <Link 
            to={`/dashboard/${role}/messages`}
            className="p-3 text-slate-500 dark:text-slate-400 hover:bg-[#f8fafc] dark:hover:bg-slate-800 rounded-xl relative transition-colors"
          >
            <MessageSquare size={22} />
            {unreadMessages > 0 && (
              <span className="absolute top-2.5 right-2.5 bg-[#EF4444] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 rounded-full">
                {unreadMessages}
              </span>
            )}
          </Link>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-800"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl transition-colors text-left">
          <div className="relative group/avatar w-11 h-11 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border border-white dark:border-slate-850 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 flex items-center justify-center text-[var(--color-primary)] font-bold uppercase overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
            
            {/* Quick Upload Overlay */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer border-none"
              title="Change Profile Picture"
            >
              {isUploading ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <button 
            onClick={() => navigate(`/dashboard/${role}/settings`)}
            className="flex items-center gap-2 text-left group bg-transparent border-none p-0 cursor-pointer"
          >
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{userName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-tighter">{role}</p>
            </div>
            <ChevronDown size={18} className="text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { LogoIcon } from './Logo';

const Facebook = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Twitter = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Instagram = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white pt-16 pb-8 transition-colors duration-300 border-t border-slate-800 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand and About */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 group">
              <LogoIcon className="h-8 w-8" animated={true} />
              <span className="text-2xl font-black tracking-tight text-blue-400">
                Bashcare<span className="text-white">Hub</span>
              </span>
            </Link>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              Providing excellence in medical care since 2024. We are committed to delivering the highest quality healthcare services to our community.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-400 rounded-lg hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-pink-600 rounded-lg hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-700 rounded-lg hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/get-started" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Get Started</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Contact Us</Link></li>
              <li><Link to="/help" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Help & FAQ</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Specialties</h3>
            <ul className="space-y-4">
              <li><Link to="/doctors?specialty=Cardiology" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Cardiology</Link></li>
              <li><Link to="/doctors?specialty=Neurology" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Neurology</Link></li>
              <li><Link to="/doctors?specialty=Pediatrics" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Pediatrics</Link></li>
              <li><Link to="/doctors?specialty=Orthopedics" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Orthopedics</Link></li>
              <li><Link to="/doctors?specialty=Dermatology" className="text-slate-400 hover:text-blue-400 dark:hover:text-teal-400 transition-colors text-sm">Dermatology</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin size={20} className="text-blue-400 mt-1" />
                <span className="text-slate-400">123 Medical Drive, Health City, ST 12345</span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone size={20} className="text-blue-400" />
                <span className="text-slate-400">+1 (555) 000-0000</span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail size={20} className="text-blue-400" />
                <span className="text-slate-400">support@bashcarehub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Bashcare Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


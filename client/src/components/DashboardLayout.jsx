import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Activity, Menu, X, User as UserIcon, Camera } from 'lucide-react';
import { authApi } from '../api/auth';
import { toast } from 'react-hot-toast';

const DashboardLayout = ({ title, children, roleColor, navigation = [] }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await authApi.uploadProfileImage(file);
      updateUser({ profile_image_url: res.data.profile_image_url });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const bgColors = {
    indigo: 'bg-indigo-600',
    teal: 'bg-teal-600',
    blue: 'bg-blue-600'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className={`${bgColors[roleColor] || 'bg-gray-600'} text-white shadow-md relative z-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Activity size={24} />
                <span className="text-xl font-semibold tracking-tight hidden sm:block">{title}</span>
              </div>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition">
                  Home
                </Link>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3">
                <span className="text-sm text-white/90">Welcome, {user?.first_name}</span>
                <div 
                  className="relative h-9 w-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer group overflow-hidden border border-white/30"
                  onClick={handleImageClick}
                >
                  {isUploading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : user?.profile_image_url ? (
                    <img src={user.profile_image_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={18} className="text-white/80" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-1 text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md transition"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md bg-white/10 hover:bg-white/20 transition focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute w-full bg-white shadow-lg border-b border-gray-200 z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition"
              >
                Home
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-blue-600 transition"
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 w-full py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-emerald-600 text-white rounded flex items-center justify-center font-bold text-[10px] shadow-sm">
              HM
            </div>
            <span className="font-bold text-sm text-emerald-800">Healthcare Manager</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 Healthcare Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;

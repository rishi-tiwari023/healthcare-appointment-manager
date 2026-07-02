import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Activity, Menu, X } from 'lucide-react';

const DashboardLayout = ({ title, children, roleColor, navigation = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              {navigation.length > 0 && (
                <div className="hidden md:flex space-x-4">
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
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden lg:block text-white/90">Welcome, {user?.name || user?.email}</span>
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
    </div>
  );
};

export default DashboardLayout;

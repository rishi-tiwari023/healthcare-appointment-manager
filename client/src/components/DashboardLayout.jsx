import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Activity, Menu } from 'lucide-react';

const DashboardLayout = ({ title, children, roleColor, navigation = [] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className={`${bgColors[roleColor] || 'bg-gray-600'} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Activity size={24} />
                <span className="text-xl font-semibold tracking-tight">{title}</span>
              </div>
              
              {/* Navigation Links */}
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
              <span className="text-sm hidden sm:block">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md transition"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

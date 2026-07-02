import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ title, children, roleColor }) => {
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
    <div className="min-h-screen bg-gray-100">
      <nav className={`${bgColors[roleColor] || 'bg-gray-600'} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold tracking-tight">{title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md transition"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export const AdminDashboard = () => (
  <DashboardLayout title="Admin Portal" roleColor="indigo">
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <p className="text-gray-600">This is a placeholder for the Admin Dashboard.</p>
    </div>
  </DashboardLayout>
);

export const DoctorDashboard = () => (
  <DashboardLayout title="Doctor Portal" roleColor="teal">
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard</h2>
      <p className="text-gray-600">This is a placeholder for the Doctor Dashboard.</p>
    </div>
  </DashboardLayout>
);

export const PatientDashboard = () => (
  <DashboardLayout title="Patient Portal" roleColor="blue">
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Patient Dashboard</h2>
      <p className="text-gray-600">This is a placeholder for the Patient Dashboard.</p>
    </div>
  </DashboardLayout>
);

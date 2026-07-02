import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ totalDoctors: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Manage Doctors', href: '/admin/doctors' },
    { name: 'Leave Management', href: '/admin/leave' },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <DashboardLayout title="Admin Portal" roleColor="indigo" navigation={navigation}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-500">Welcome to the healthcare admin control panel.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Doctors</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : metrics.totalDoctors}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/admin/doctors" className="font-medium text-indigo-700 hover:text-indigo-900">
                View all
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

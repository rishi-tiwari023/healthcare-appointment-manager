import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, Calendar, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SkeletonCard } from '../../components/ui/Skeleton';
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
        setError('Failed to fetch dashboard data');
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <DashboardLayout title="Admin Portal" roleColor="indigo" navigation={navigation}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">Welcome to the healthcare admin control panel.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 flex">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
        </div>
      ) : (
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
                        {metrics.totalDoctors}
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
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

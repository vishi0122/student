import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/dashboard/BarChart';
import QuickActions from '../components/dashboard/QuickActions';
import { getDashboardConfig } from '../utils/dashboardConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = getDashboardConfig(user, navigate);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{config.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {config.stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BarChart title={config.chartTitle} />
          <QuickActions actions={config.actions} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

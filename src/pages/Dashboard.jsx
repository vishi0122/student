import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/dashboard/BarChart';
import QuickActions from '../components/dashboard/QuickActions';
import { getDashboardConfig } from '../utils/dashboardConfig';
import { getStudentCount, getSessionCount, getSessions } from '../services/dataService';
import { Users, ShieldCheck, BookOpen, Bell } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = getDashboardConfig(user, navigate);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [studentCount, sessionCount, sessions] = await Promise.all([
          getStudentCount(),
          getSessionCount(),
          getSessions(user?.role === 'faculty' && user?.name ? { teacher: user.name } : {}),
        ]);

        const totalAttendees = sessions.reduce((sum, s) => sum + (s.attendees?.length || 0), 0);
        const totalExpected = sessions.length * 45;
        const avgAttendance = totalExpected > 0 ? Math.round((totalAttendees / totalExpected) * 100) : 0;
        const activeSessions = sessions.filter(s => s.status === 'active').length;
        const lowAttendance = sessions.filter(s => {
          const pct = s.attendees?.length ? Math.round((s.attendees.length / 45) * 100) : 0;
          return pct < 75;
        }).length;

        setLiveStats({ studentCount, sessionCount, avgAttendance, activeSessions, lowAttendance });
      } catch (e) {
        console.error('Dashboard stats error:', e);
      }
    };
    loadStats();
  }, [user]);

  // Override stats with live data when available
  const stats = liveStats ? buildStats(user, liveStats, navigate) : config.stats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{config.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
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

const buildStats = (user, live, navigate) => {
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';

  if (isAdmin && isCollege) {
    return [
      { label: 'Total Students', value: live.studentCount.toLocaleString(), trend: 'In database', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Avg Attendance', value: `${live.avgAttendance}%`, trend: 'All sessions', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Sessions', value: String(live.activeSessions), trend: 'Live right now', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Low Attendance', value: String(live.lowAttendance), trend: 'Sessions below 75%', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }
  if (!isAdmin && isCollege) {
    return [
      { label: 'My Sessions', value: String(live.sessionCount), trend: 'Total recorded', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Avg Attendance', value: `${live.avgAttendance}%`, trend: 'Across my lectures', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Active Now', value: String(live.activeSessions), trend: 'Live sessions', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Total Students', value: live.studentCount.toLocaleString(), trend: 'In database', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];
  }
  return [
    { label: 'Total Students', value: live.studentCount.toLocaleString(), trend: 'In database', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Attendance', value: `${live.avgAttendance}%`, trend: 'All sessions', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Sessions', value: String(live.sessionCount), trend: 'Recorded', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Attendance', value: String(live.lowAttendance), trend: 'Below 75%', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];
};

export default Dashboard;

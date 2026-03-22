import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/dashboard/BarChart';
import QuickActions from '../components/dashboard/QuickActions';
import { getDashboardConfig } from '../utils/dashboardConfig';
import { getStudentCount, getSessionCount, getSessions } from '../services/dataService';
import { Users, ShieldCheck, BookOpen, Bell, Database } from 'lucide-react';
import { reseedStudents } from '../services/seedFirestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = getDashboardConfig(user, navigate);
  const [liveStats, setLiveStats] = useState(null);
  const [seedStatus, setSeedStatus] = useState('');

  const handleReseedStudents = async () => {
    setSeedStatus('seeding');
    try {
      await reseedStudents();
      setSeedStatus('done');
    } catch (e) {
      setSeedStatus('error');
      console.error(e);
    }
  };

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

        {/* Update student roster — visible to all logged-in users */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-yellow-900">Update Student Roster (605A)</p>
            <p className="text-xs text-yellow-700 mt-0.5">Replaces students collection with the real 605A data.</p>
          </div>
          <button
            onClick={handleReseedStudents}
            disabled={seedStatus === 'seeding'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Database size={15} />
            {seedStatus === 'seeding' ? 'Updating...' : seedStatus === 'done' ? '✅ Done!' : seedStatus === 'error' ? '❌ Error — check console' : 'Update Students (605A)'}
          </button>
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

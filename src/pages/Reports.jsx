import { useState, useEffect } from 'react';
import { Download, FileText, Loader, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSessions } from '../services/dataService';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgAttendance: 0, totalSessions: 0, lowAttendance: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const filters = isFaculty && user?.name ? { teacher: user.name } : {};
      const data = await getSessions(filters);
      setSessions(data);

      // Compute stats from real data
      const totalAttendees = data.reduce((sum, s) => sum + (s.attendees?.length || 0), 0);
      const totalExpected = data.length * 35;
      const avg = totalExpected > 0 ? Math.round((totalAttendees / totalExpected) * 100) : 0;
      const low = data.filter(s => {
        const pct = s.attendees?.length ? Math.round((s.attendees.length / 35) * 100) : 0;
        return pct < 75;
      }).length;

      setStats({ avgAttendance: avg, totalSessions: data.length, lowAttendance: low });
      setLoading(false);
    };
    load();
  }, [user]);

  const escapeCSV = (val) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const rows = [['Session ID', 'Subject', 'Teacher', 'Section', 'Date', 'Time', 'Room', 'Present', 'Status']];
    sessions.forEach(s => {
      rows.push([s.sessionId, s.subject, s.teacher, s.section, s.date, s.time, s.room, s.attendees?.length || 0, s.status]);
    });
    const csv = rows.map(r => r.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 text-sm mt-1">Live attendance data from Firestore.</p>
          </div>
          <Button icon={Download} onClick={handleExportCSV}>Export CSV</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader size={32} className="animate-spin text-[#1E3A8A]"/></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-t-4 border-t-[#1E3A8A]">
                <p className="text-sm font-medium text-gray-500 mb-1">Average Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgAttendance}%</p>
                <p className="text-xs text-gray-500 mt-2">Across all sessions</p>
              </Card>
              <Card className="p-6 border-t-4 border-t-[#10B981]">
                <p className="text-sm font-medium text-gray-500 mb-1">{isAdmin ? 'Total Sessions' : 'My Sessions'}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
                <p className="text-xs text-gray-500 mt-2">Recorded in database</p>
              </Card>
              <Card className="p-6 border-t-4 border-t-amber-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Low Attendance Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.lowAttendance}</p>
                <p className="text-xs text-amber-600 mt-2">Sessions below 75% threshold</p>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Session Records</h3>
                <span className="text-sm text-gray-500">{sessions.length} total</span>
              </div>
              <div className="divide-y divide-gray-200">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No sessions recorded yet. Start a live session to see data here.</div>
                ) : sessions.map((session, i) => {
                  const present = session.attendees?.length || 0;
                  const pct = Math.round((present / 35) * 100);
                  return (
                    <div key={i} onClick={() => navigate(`/session/${session.sessionId || session.id}`)}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{session.subject} — Section {session.section}</p>
                          <p className="text-xs text-gray-500">{session.teacher} • {session.date} {session.time} • Room {session.room}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{present}/35</p>
                          <p className={`text-xs font-medium ${pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.status}
                        </span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;

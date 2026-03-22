import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, MapPin,
  BookOpen, User, Download, Loader, Users
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getStudents } from '../services/dataService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);   // all students merged with attendance
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | present | absent

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load session doc from Firestore
        const snap = await getDoc(doc(db, 'sessions', sessionId));
        if (!snap.exists()) { setLoading(false); return; }
        const sessionData = snap.data();
        setSession(sessionData);

        // Load all students for the session's section
        const allStudents = await getStudents(
          sessionData.section ? { section: sessionData.section } : {}
        );

        // Build a set of UIDs who attended
        const attendedUIDs = new Set(
          (sessionData.attendees || []).map(a => a.studentUID)
        );

        // Merge: mark each student present or absent
        const merged = allStudents.map(s => ({
          ...s,
          present: attendedUIDs.has(s.uid),
          attendanceRecord: (sessionData.attendees || []).find(a => a.studentUID === s.uid) || null,
        }));

        // Sort: present first, then by name
        merged.sort((a, b) => {
          if (a.present !== b.present) return a.present ? -1 : 1;
          return (a.name || '').localeCompare(b.name || '');
        });

        setRoster(merged);
      } catch (err) {
        console.error('SessionDetail load error:', err);
      }
      setLoading(false);
    };
    load();
  }, [sessionId]);

  const handleExportCSV = () => {
    if (!session) return;
    const rows = [['UID', 'Name', 'Section', 'Status', 'Time', 'Method']];
    roster.forEach(s => {
      rows.push([
        s.uid,
        s.name,
        s.section,
        s.present ? 'Present' : 'Absent',
        s.attendanceRecord?.timestamp
          ? new Date(s.attendanceRecord.timestamp).toLocaleTimeString()
          : '-',
        s.attendanceRecord?.method || '-',
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${sessionId.slice(-8)}_${session.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const presentCount = roster.filter(s => s.present).length;
  const absentCount = roster.filter(s => !s.present).length;
  const pct = roster.length > 0 ? Math.round((presentCount / roster.length) * 100) : 0;

  const filtered = roster.filter(s => {
    if (filter === 'present') return s.present;
    if (filter === 'absent') return !s.present;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Loader size={32} className="animate-spin text-[#1E3A8A]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-32 text-gray-400">Session not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{session.subject}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User size={14} /> {session.teacher}</span>
              <span className="flex items-center gap-1"><BookOpen size={14} /> Section {session.section}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {session.date} {session.time}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> Room {session.room}</span>
              <Badge variant={session.status === 'active' ? 'success' : 'neutral'}>
                {session.status}
              </Badge>
            </div>
          </div>
          <Button icon={Download} onClick={handleExportCSV} variant="outline">Export CSV</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5 text-center border-t-4 border-t-[#10B981]">
            <p className="text-3xl font-bold text-[#10B981]">{presentCount}</p>
            <p className="text-sm text-gray-500 mt-1">Present</p>
          </Card>
          <Card className="p-5 text-center border-t-4 border-t-red-400">
            <p className="text-3xl font-bold text-red-500">{absentCount}</p>
            <p className="text-sm text-gray-500 mt-1">Absent</p>
          </Card>
          <Card className={`p-5 text-center border-t-4 ${pct >= 75 ? 'border-t-[#1E3A8A]' : 'border-t-amber-500'}`}>
            <p className={`text-3xl font-bold ${pct >= 75 ? 'text-[#1E3A8A]' : 'text-amber-500'}`}>{pct}%</p>
            <p className="text-sm text-gray-500 mt-1">Attendance</p>
          </Card>
        </div>

        {/* Attendance progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${pct >= 75 ? 'bg-[#10B981]' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Roster */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-600" />
              <h3 className="font-bold text-gray-900">Student Roster</h3>
              <span className="text-sm text-gray-500">({filtered.length} shown)</span>
            </div>
            <div className="flex gap-2">
              {['all', 'present', 'absent'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? `All (${roster.length})` : f === 'present' ? `Present (${presentCount})` : `Absent (${absentCount})`}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No students found.</div>
            ) : filtered.map((student, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  student.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'
                }`}>
                  {(student.name || '?').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.uid} • Section {student.section}</p>
                </div>

                {/* Time scanned */}
                {student.present && student.attendanceRecord?.timestamp && (
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {new Date(student.attendanceRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {student.present ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={13} /> Present
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      <XCircle size={13} /> Absent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SessionDetail;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, MapPin,
  BookOpen, User, Download, Loader, Users, Mail, Send, X, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getStudents } from '../services/dataService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sendBulkAbsenceNotifications, sendAbsenceNotification, isEmailConfigured } from '../services/emailService';

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [roster, setRoster] = useState([]);   // all students merged with attendance
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | present | absent
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState(null); // null = bulk, student obj = single
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResults, setNotifyResults] = useState(null);

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

  const escapeCSV = (val) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"` : str;
  };

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
    const csv = rows.map(r => r.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${sessionId.slice(-8)}_${session.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNotify = async () => {
    setNotifySending(true);
    setNotifyResults(null);
    const sessionInfo = { subject: session.subject, date: session.date, teacher: session.teacher, section: session.section };
    try {
      if (notifyTarget) {
        // Single student
        const email = notifyTarget.parentEmail || notifyTarget.email;
        await sendAbsenceNotification({ studentName: notifyTarget.name, toEmail: email, ...sessionInfo });
        setNotifyResults([{ student: notifyTarget.name, success: true, email }]);
      } else {
        // All absent
        const absent = roster.filter(s => !s.present);
        const results = await sendBulkAbsenceNotifications(absent, sessionInfo);
        setNotifyResults(results);
      }
    } catch (err) {
      setNotifyResults([{ student: 'Error', success: false, error: err.message }]);
    }
    setNotifySending(false);
  };

  const presentCount = roster.filter(s => s.present).length;
  const absentCount = roster.filter(s => !s.present).length;
  const absentWithEmail = roster.filter(s => !s.present && (s.parentEmail || s.email));
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
          <Button icon={Mail} onClick={() => { setNotifyTarget(null); setNotifyResults(null); setNotifyModal(true); }}
            variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50"
            disabled={absentCount === 0}>
            Notify Absent ({absentCount})
          </Button>
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
                    <>
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                        <XCircle size={13} /> Absent
                      </span>
                      {(student.parentEmail || student.email) && (
                        <button
                          onClick={() => { setNotifyTarget(student); setNotifyResults(null); setNotifyModal(true); }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title={`Notify ${student.parentEmail || student.email}`}
                        >
                          <Mail size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notify Modal */}
      {notifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">
                  {notifyTarget ? `Notify ${notifyTarget.name}` : `Notify All Absent (${absentCount})`}
                </h3>
              </div>
              <button onClick={() => { setNotifyModal(false); setNotifyResults(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              {!isEmailConfigured() && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">EmailJS not configured</p>
                    <p className="mt-0.5">Add these to your <code className="bg-amber-100 px-1 rounded">.env</code> file:</p>
                    <pre className="mt-1 text-xs bg-amber-100 p-2 rounded overflow-x-auto">{`VITE_EMAILJS_SERVICE_ID=your_id
VITE_EMAILJS_TEMPLATE_ID=your_template
VITE_EMAILJS_PUBLIC_KEY=your_key`}</pre>
                    <a href="https://www.emailjs.com" target="_blank" rel="noreferrer"
                      className="text-blue-600 underline text-xs mt-1 block">
                      Get free credentials at emailjs.com →
                    </a>
                  </div>
                </div>
              )}

              {!notifyResults ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    {notifyTarget
                      ? <>An absence notification will be sent to: <span className="font-medium text-blue-700">{notifyTarget.parentEmail || notifyTarget.email}</span>
                          {notifyTarget.parentEmail
                            ? <span className="ml-1 text-xs text-gray-400">(parent email)</span>
                            : <span className="ml-1 text-xs text-amber-500">(student email — no parent email set)</span>
                          }</>
                      : `Absence notifications will be sent to ${absentWithEmail.length} student${absentWithEmail.length !== 1 ? 's' : ''} with email on file.`
                    }
                  </p>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 mb-4">
                    <p className="font-medium mb-1">Email will include:</p>
                    <ul className="space-y-0.5 text-gray-600 text-xs">
                      <li>• Subject: {session.subject}</li>
                      <li>• Date: {session.date}</li>
                      <li>• Teacher: {session.teacher}</li>
                      <li>• Section: {session.section}</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setNotifyModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={handleNotify} disabled={notifySending || !isEmailConfigured()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {notifySending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                      {notifySending ? 'Sending...' : 'Send Notifications'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {notifyResults.map((r, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${r.success ? 'bg-green-50' : 'bg-red-50'}`}>
                        {r.success
                          ? <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                          : <XCircle size={15} className="text-red-500 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{r.student}</p>
                          <p className="text-xs text-gray-500 truncate">{r.success ? r.email : r.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center mb-3">
                    {notifyResults.filter(r => r.success).length} sent · {notifyResults.filter(r => !r.success).length} failed
                  </div>
                  <button onClick={() => { setNotifyModal(false); setNotifyResults(null); }}
                    className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SessionDetail;

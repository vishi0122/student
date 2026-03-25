import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, XCircle, Clock, MapPin, BookOpen, RefreshCw, ScanFace, Mail, Loader } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { detectCurrentLecture } from '../utils/lectureDetector';
import { generateQRData, createAttendanceSession, endSession, subscribeToSession } from '../services/qrService';
import { useAuth } from '../context/AuthContext';
import { getStudents } from '../services/dataService';
import { sendAbsenceNotification } from '../services/emailService';

const LiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const mode = location.state?.mode || 'university';
  const sessionType = location.state?.sessionType || 'lecture';

  const [scannedCount, setScannedCount] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [qrData, setQrData] = useState('');
  const [session, setSession] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(5);
  const [recentScans, setRecentScans] = useState([]);

  // End-session modal state
  const [endModal, setEndModal] = useState(false);
  const [absentList, setAbsentList] = useState([]);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  const sessionDuration = sessionType === 'lab' ? '100 minutes' : '50 minutes';

  useEffect(() => {
    let unsubscribe = () => {};
    const initSession = async () => {
      const lecture = detectCurrentLecture('605A');
      setCurrentLecture(lecture);
      const subject = location.state?.subject || lecture?.subject || 'General Session';
      const section = location.state?.section || lecture?.section || (mode === 'school' ? '12A' : '605A');
      const room = lecture?.room || '208';
      const newSession = await createAttendanceSession({
        subject, section,
        teacher: user?.name || lecture?.teacher || 'Faculty',
        room,
      });
      setSession(newSession);
      updateQRCode(newSession);
      if (mode === 'school') { navigate('/kiosk'); return; }
      unsubscribe = subscribeToSession(newSession.sessionId, (rec) => {
        setRecentScans(prev => [{
          id: rec.id, name: rec.studentName, uid: rec.studentUID,
          time: new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 10));
        setScannedCount(prev => prev + 1);
      });
    };
    initSession();
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(() => { updateQRCode(session); setRefreshCounter(5); }, 5000);
    return () => clearInterval(t);
  }, [session]);

  useEffect(() => {
    const t = setInterval(() => setRefreshCounter(prev => prev > 0 ? prev - 1 : 5), 1000);
    return () => clearInterval(t);
  }, []);

  const updateQRCode = (s) => setQrData(generateQRData(s));

  // End session → build absent list → open modal
  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) return;
    if (session?.sessionId) await endSession(session.sessionId);
    if (session) {
      const all = await getStudents({ section: session.section });
      const presentUIDs = new Set(recentScans.map(s => s.uid));
      const absent = all
        .filter(s => !presentUIDs.has(s.uid))
        .map(s => ({ ...s, emailTo: s.parentEmail || s.email || '' }));
      setAbsentList(absent);
    }
    setEmailResults(null);
    setEndModal(true);
  };

  // Teacher clicks Send in modal
  const handleSendEmails = async () => {
    setSendingEmails(true);
    const results = [];
    for (const student of absentList.filter(s => s.emailTo.trim())) {
      try {
        await sendAbsenceNotification({
          studentName: student.name,
          toEmail: student.emailTo.trim(),
          subject: session?.subject || '',
          date: session?.date || new Date().toISOString().split('T')[0],
          teacher: session?.teacher || '',
          section: session?.section || '',
        });
        results.push({ name: student.name, success: true, email: student.emailTo });
      } catch (e) {
        results.push({ name: student.name, success: false, error: e.message });
      }
      await new Promise(r => setTimeout(r, 300));
    }
    setEmailResults(results);
    setSendingEmails(false);
  };

  return (
    <>
      <DashboardLayout>
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xl font-bold text-gray-900">
                  {currentLecture ? currentLecture.subject : 'Live Session'}
                </h2>
              </div>
              {currentLecture && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {currentLecture.teacher}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {currentLecture.room}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {currentLecture.time}</span>
                  <Badge variant={currentLecture.type === 'Lab' ? 'warning' : 'neutral'}>{currentLecture.type}</Badge>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'school' ? 'Face Recognition Active' : `Dynamic QR Mode Active • ${sessionDuration}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-[#10B981] leading-none">
                  {scannedCount}<span className="text-lg text-gray-400">/35</span>
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Present</p>
              </div>
              <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={handleEndSession}>
                End Session
              </Button>
              <Button variant="outline" className="text-[#1E3A8A] hover:bg-blue-50" onClick={() => navigate('/kiosk')} icon={ScanFace}>
                Face Kiosk
              </Button>
            </div>
          </div>

          <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
            {/* QR / School view */}
            <Card className="lg:col-span-2 overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 to-white relative min-h-[400px]">
              {mode === 'school' ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Users size={120} className="text-gray-400" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#10B981] shadow-[0_0_15px_#10B981] animate-scan" />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Scan to Mark Attendance</h3>
                    <p className="text-gray-500 mt-2">QR code refreshes every 5 seconds</p>
                  </div>
                  <div className="relative">
                    <div className="p-6 bg-white border-8 border-gray-100 rounded-2xl shadow-lg">
                      {qrData ? (
                        <QRCodeSVG value={qrData} size={280} level="H" marginSize={0} />
                      ) : (
                        <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-100 rounded">
                          <p className="text-gray-400">Generating QR Code...</p>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <RefreshCw size={14} className={`text-[#1E3A8A] ${refreshCounter <= 1 ? 'animate-spin' : ''}`} />
                        <span className="font-medium text-gray-700">Refreshing in {refreshCounter}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase">Session ID</p>
                      <p className="text-sm font-mono font-medium text-gray-900 mt-1">{session?.sessionId.slice(-8)}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase">Section</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{session?.section}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm text-[#10B981] font-medium bg-emerald-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                    QR Code is Live & Active
                  </div>
                </div>
              )}
            </Card>

            {/* Recent Scans */}
            <Card className="flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recently Verified</h3>
                <Badge variant="neutral">{scannedCount} Total</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {recentScans.map((student, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0 animate-fadeIn">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.uid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{student.time}</p>
                      <Badge variant="success" className="text-xs mt-1">Verified</Badge>
                    </div>
                  </div>
                ))}
                {recentScans.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    Waiting for scans...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>

      {/* Absent Students Email Modal */}
      {endModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Notify Absent Parents</h3>
              </div>
              <span className="text-sm text-gray-500">{absentList.length} absent</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {!emailResults ? (
                <>
                  <p className="text-sm text-gray-500 mb-1">
                    Parent emails are pre-filled. Edit any if needed, then click Send.
                  </p>
                  {absentList.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">All students are present — no emails needed.</p>
                  ) : absentList.map((student, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                        <input
                          type="email"
                          value={student.emailTo}
                          onChange={e => setAbsentList(prev => prev.map((s, idx) => idx === i ? { ...s, emailTo: e.target.value } : s))}
                          placeholder="parent@email.com"
                          className="mt-1 w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-2">
                  {emailResults.map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${r.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      {r.success
                        ? <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                        : <XCircle size={15} className="text-red-500 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{r.name}</p>
                        <p className="text-xs text-gray-500 truncate">{r.success ? r.email : r.error}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-center text-gray-400 pt-1">
                    {emailResults.filter(r => r.success).length} sent · {emailResults.filter(r => !r.success).length} failed
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              {!emailResults ? (
                <>
                  <button
                    onClick={() => { setEndModal(false); navigate('/reports'); }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Skip & Go to Reports
                  </button>
                  <button
                    onClick={handleSendEmails}
                    disabled={sendingEmails || absentList.every(s => !s.emailTo.trim())}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingEmails
                      ? <><Loader size={14} className="animate-spin" /> Sending...</>
                      : <><Mail size={14} /> Send ({absentList.filter(s => s.emailTo.trim()).length})</>}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setEndModal(false); navigate('/reports'); }}
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                >
                  Go to Reports
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveSession;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { loadModels, getFaceDescriptor, compareFacesMulti, loadFaceDescriptors } from '../services/faceService';
import attendanceStore from '../services/attendanceStore';
import { createAttendanceSession, endSession } from '../services/qrService';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ScanFace, Users, CheckCircle2, Loader, AlertCircle, WifiOff, Play, Mail } from 'lucide-react';
import { getStudents } from '../services/dataService';
import { sendBulkAbsenceNotifications, isEmailConfigured } from '../services/emailService';

const WELCOME_DURATION = 3000;
const SCAN_INTERVAL = 1200;
const THRESHOLD = 0.65;

const FaceKiosk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSchool = user?.instType === 'school';
  const defaultSection = isSchool ? '12A' : '605A';

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const markedRef = useRef(new Set());
  const studentsRef = useRef([]);
  const sessionRef = useRef(null);

  const [phase, setPhase] = useState('loading'); // loading | no-session | ready | error
  const [statusMsg, setStatusMsg] = useState('Initializing...');
  const [session, setSession] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [welcome, setWelcome] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | unknown | already-marked
  const [newSubject, setNewSubject] = useState('');
  const [creating, setCreating] = useState(false);
  const [emailStatus, setEmailStatus] = useState(''); // '' | 'sending' | 'done'

  // ── Attach stream to video element once both exist ─────────────────────────
  useEffect(() => {
    if (phase === 'ready' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatusMsg('Loading face recognition models...');
      try { await loadModels(); } catch {
        if (!cancelled) { setPhase('error'); setStatusMsg('Failed to load face models. Refresh.'); }
        return;
      }
      if (cancelled) return;

      setStatusMsg('Finding active session...');
      const active = await getActiveSession();
      if (!active) {
        if (!cancelled) { setPhase('no-session'); setStatusMsg('No active session found.'); }
        return;
      }
      if (cancelled) return;
      await launchKiosk(active, cancelled);
    })();
    return () => { cancelled = true; stopAll(); };
  }, []);

  const launchKiosk = async (activeSession, cancelled = false) => {
    sessionRef.current = activeSession;
    setSession(activeSession);
    (activeSession.attendees || []).forEach(a => markedRef.current.add(a.studentUID));
    setPresentCount(markedRef.current.size);

    setStatusMsg('Loading student face data...');
    const loaded = await loadStudentDescriptors();
    if (cancelled) return;
    const withFace = loaded.filter(s => s.descriptors?.length);
    studentsRef.current = withFace;
    setStudentCount(withFace.length);

    if (withFace.length === 0) {
      setPhase('error');
      setStatusMsg('No students have registered their face yet. Ask students to register via /scan first.');
      return;
    }

    setStatusMsg('Starting camera...');
    const ok = await startCameraStream();
    if (!ok || cancelled) return;

    // Set ready — useEffect above will attach stream to video element
    setPhase('ready');
    startDetection();
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getActiveSession = async () => {
    try {
      const q = query(collection(db, 'sessions'), where('status', '==', 'active'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const sorted = snap.docs.sort((a, b) =>
          (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
        return { id: sorted[0].id, ...sorted[0].data() };
      }
      const allSnap = await getDocs(collection(db, 'sessions'));
      if (allSnap.empty) return null;
      const sorted = allSnap.docs.sort((a, b) =>
        (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
      return { id: sorted[0].id, ...sorted[0].data() };
    } catch (e) { console.error(e); return null; }
  };

  const loadStudentDescriptors = async () => {
    const snap = await getDocs(collection(db, 'students'));
    const results = [];
    for (const d of snap.docs) {
      const data = d.data();
      const descriptors = await loadFaceDescriptors(d.id);
      if (descriptors) {
        results.push({
          docId: d.id,
          uid: data.uid,
          name: data.name,
          section: data.section,
          descriptors,
        });
      }
    }
    return results;
  };

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      return true;
    } catch {
      setPhase('error');
      setStatusMsg('Camera permission denied. Allow camera access and refresh.');
      return false;
    }
  };

  const stopAll = () => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startDetection = () => {
    const consecutiveHits = {};
    let unknownTimer = null;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !videoRef.current.srcObject) return;

      setScanState('scanning');
      const descriptor = await getFaceDescriptor(videoRef.current);

      if (!descriptor) {
        setScanState('idle');
        return;
      }

      let bestMatch = null;
      let bestDist = Infinity;
      for (const student of studentsRef.current) {
        if (!student.descriptors?.length) continue;
        const { distance } = compareFacesMulti(descriptor, student.descriptors, THRESHOLD);
        if (distance < bestDist) { bestDist = distance; bestMatch = student; }
      }

      if (bestMatch && bestDist < THRESHOLD) {
        clearTimeout(unknownTimer);

        if (markedRef.current.has(bestMatch.uid)) {
          setScanState('already-marked');
          unknownTimer = setTimeout(() => setScanState('idle'), 2000);
          return;
        }

        consecutiveHits[bestMatch.uid] = (consecutiveHits[bestMatch.uid] || 0) + 1;
        for (const uid of Object.keys(consecutiveHits)) {
          if (uid !== bestMatch.uid) consecutiveHits[uid] = 0;
        }

        if (consecutiveHits[bestMatch.uid] < 2) {
          setScanState('scanning');
          return;
        }

        markedRef.current.add(bestMatch.uid);
        const s = sessionRef.current;
        const result = await attendanceStore.markAttendance(s.id || s.sessionId, {
          studentId: bestMatch.docId,
          studentName: bestMatch.name,
          studentUID: bestMatch.uid,
          section: bestMatch.section,
          method: 'face',
        });

        if (!result.success) {
          setScanState('already-marked');
          unknownTimer = setTimeout(() => setScanState('idle'), 2000);
          return;
        }

        setScanState('idle');
        setPresentCount(markedRef.current.size);
        setRecentScans(prev => [{
          uid: bestMatch.uid,
          name: bestMatch.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }, ...prev]);
        setWelcome({ name: bestMatch.name, uid: bestMatch.uid });
        setTimeout(() => setWelcome(null), WELCOME_DURATION);

      } else {
        // Face detected but no match — show "not recognized"
        for (const uid of Object.keys(consecutiveHits)) consecutiveHits[uid] = 0;
        setScanState('unknown');
        clearTimeout(unknownTimer);
        unknownTimer = setTimeout(() => setScanState('idle'), 2000);
      }
    }, SCAN_INTERVAL);
  };

  const handleCreateSession = async () => {
    if (!newSubject.trim()) return;
    setCreating(true);
    setPhase('loading');
    setStatusMsg('Creating session...');
    try {
      const s = await createAttendanceSession({
        subject: newSubject.trim(),
        section: defaultSection,
        teacher: user?.name || user?.email || 'Faculty',
        room: 'N/A',
      });
      await launchKiosk(s);
    } catch (e) {
      console.error(e);
      setPhase('no-session');
      setStatusMsg('Failed to create session. Try again.');
    }
    setCreating(false);
  };

  const handleEndKiosk = async () => {
    stopAll();
    const s = sessionRef.current;
    if (s) {
      const sessionId = s.id || s.sessionId;
      await endSession(sessionId);

      if (isEmailConfigured()) {
        setEmailStatus('sending');
        try {
          const allStudents = await getStudents({ section: s.section });
          const presentUIDs = markedRef.current;
          const absentStudents = allStudents.filter(st => !presentUIDs.has(st.uid));
          if (absentStudents.length > 0) {
            await sendBulkAbsenceNotifications(absentStudents, {
              subject: s.subject,
              date: s.date || new Date().toISOString().split('T')[0],
              teacher: s.teacher,
              section: s.section,
            });
          }
          setEmailStatus('done');
        } catch (e) {
          console.error('Auto email error:', e);
          setEmailStatus('done');
        }
        setTimeout(() => navigate('/reports'), 1500);
        return;
      }
    }
    navigate('/reports');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ScanFace size={26} className="text-[#1E3A8A]" />
              Face Attendance Kiosk
            </h1>
            {session && (
              <p className="text-sm text-gray-500 mt-0.5">
                {session.subject} · Section {session.section} · {session.teacher}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {phase === 'ready' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
            <button onClick={handleEndKiosk}
              disabled={emailStatus === 'sending'}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {emailStatus === 'sending' ? (
                <><Loader size={13} className="animate-spin"/> Sending emails...</>
              ) : emailStatus === 'done' ? (
                <><Mail size={13}/> Emails sent ✓</>
              ) : (
                '← End & Back'
              )}
            </button>
          </div>
        </div>

        {/* Non-ready states */}
        {phase !== 'ready' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {phase === 'loading' && <Loader size={40} className="text-[#1E3A8A] animate-spin mb-4" />}
            {phase === 'error' && <AlertCircle size={40} className="text-red-500 mb-4" />}
            {phase === 'no-session' && <WifiOff size={40} className="text-amber-500 mb-4" />}
            <p className="text-gray-700 font-medium max-w-sm">{statusMsg}</p>
            {phase === 'no-session' && (
              <div className="mt-6 w-full max-w-sm">
                <p className="text-sm text-gray-500 mb-2">Or start a new session here:</p>
                <div className="flex gap-2">
                  <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                    placeholder="Subject name (e.g. DBMS)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                    onKeyDown={e => e.key === 'Enter' && handleCreateSession()} />
                  <button onClick={handleCreateSession} disabled={creating || !newSubject.trim()}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5">
                    {creating ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
                    Start
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kiosk UI — video always in DOM once phase=ready so ref is stable */}
        {phase === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera */}
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg" style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} autoPlay muted playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} />
                {/* Face guide oval */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-72 border-4 border-white/50 rounded-full" />
                </div>
                {/* Welcome overlay — matched */}
                {welcome && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                    <div className="text-center text-white px-6">
                      <CheckCircle2 size={72} className="text-emerald-400 mx-auto mb-3" />
                      <p className="text-4xl font-bold mb-2">Welcome!</p>
                      <p className="text-2xl font-semibold text-emerald-300">{welcome.name}</p>
                      <p className="text-sm text-white/50 mt-1">{welcome.uid}</p>
                      <p className="text-base text-emerald-400 mt-3">Attendance marked ✓</p>
                    </div>
                  </div>
                )}
                {/* Not recognized overlay */}
                {!welcome && scanState === 'unknown' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur-sm">
                    <div className="text-center text-white px-6">
                      <div className="w-16 h-16 rounded-full bg-red-500/80 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={36} className="text-white" />
                      </div>
                      <p className="text-2xl font-bold mb-1">Not Registered</p>
                      <p className="text-sm text-red-200">Your face is not in the system.</p>
                      <p className="text-sm text-red-200">Visit /scan to register first.</p>
                    </div>
                  </div>
                )}
                {/* Already marked overlay */}
                {!welcome && scanState === 'already-marked' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-900/50 backdrop-blur-sm">
                    <div className="text-center text-white px-6">
                      <CheckCircle2 size={56} className="text-amber-300 mx-auto mb-3" />
                      <p className="text-2xl font-bold mb-1">No Duplicate Attendance</p>
                      <p className="text-sm text-amber-200">You have already marked attendance</p>
                      <p className="text-sm text-amber-200">for this session.</p>
                    </div>
                  </div>
                )}
                {/* Oval guide — always visible when no overlay */}
                {!welcome && scanState !== 'unknown' && scanState !== 'already-marked' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-56 h-72 border-4 rounded-full transition-colors duration-300 ${
                      scanState === 'scanning' ? 'border-blue-400/70' : 'border-white/50'
                    }`} />
                  </div>
                )}
                {/* Scanning pill */}
                {!welcome && scanState !== 'unknown' && scanState !== 'already-marked' && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${scanState === 'scanning' ? 'bg-blue-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                    {scanState === 'scanning' ? 'Identifying...' : 'Scanning for faces...'}
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                Stand in front of the camera — attendance marks automatically
              </p>
            </div>

            {/* Side panel */}
            <div className="flex flex-col gap-4">
              {/* Count card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 leading-none">{presentCount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">present</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((presentCount / 35) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{presentCount} / 35</p>
              </div>

              {/* Faces loaded */}
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-400">Faces loaded</p>
                <p className="text-base font-semibold text-gray-700">{studentCount} students</p>
              </div>

              {/* Marked present list */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Marked Present
                </p>
                {recentScans.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No one yet</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {recentScans.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.uid}</p>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0">{s.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FaceKiosk;

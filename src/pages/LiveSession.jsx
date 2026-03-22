import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Clock, MapPin, BookOpen, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { detectCurrentLecture } from '../utils/lectureDetector';
import { 
  generateQRData, 
  createAttendanceSession, 
  getSessionStats,
  subscribeToSession 
} from '../services/qrService';
import { useAuth } from '../context/AuthContext';

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

  const sessionDuration = sessionType === 'lab' ? '100 minutes' : '50 minutes';

  useEffect(() => {
    let unsubscribe = () => {};

    const initSession = async () => {
      const lecture = detectCurrentLecture('601A');
      setCurrentLecture(lecture);

      // createAttendanceSession is now async (writes to Firestore)
      const newSession = await createAttendanceSession({
        subject: lecture?.subject || 'Computer Science 101',
        section: '601A',
        teacher: user?.name || lecture?.teacher || 'Faculty',
        room: lecture?.room || '208',
      });
      setSession(newSession);
      updateQRCode(newSession);

      // Subscribe to real-time updates from Firestore
      unsubscribe = subscribeToSession(newSession.sessionId, (attendanceRecord) => {
        setRecentScans(prev => [{
          id: attendanceRecord.id,
          name: attendanceRecord.studentName,
          uid: attendanceRecord.studentUID,
          time: new Date(attendanceRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 10));
        setScannedCount(prev => prev + 1);
      });
    };

    initSession();
    return () => unsubscribe();
  }, [user]);

  // Update QR code every 5 seconds
  useEffect(() => {
    if (!session) return;

    const qrInterval = setInterval(() => {
      updateQRCode(session);
      setRefreshCounter(5);
    }, 5000);

    return () => clearInterval(qrInterval);
  }, [session]);

  // Countdown timer for QR refresh
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setRefreshCounter(prev => prev > 0 ? prev - 1 : 5);
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const updateQRCode = (sessionData) => {
    const data = generateQRData(sessionData);
    setQrData(data);
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this session?')) {
      navigate('/attendance');
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Session Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentLecture ? currentLecture.subject : 'Live Session'}
              </h2>
            </div>
            {currentLecture && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {currentLecture.teacher}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {currentLecture.room}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {currentLecture.time}
                </span>
                <Badge variant={currentLecture.type === 'Lab' ? 'warning' : 'neutral'}>
                  {currentLecture.type}
                </Badge>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'school' ? 'Face Recognition Active' : `Dynamic QR Mode Active • ${sessionDuration}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-[#10B981] leading-none">
                {scannedCount}<span className="text-lg text-gray-400">/45</span>
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Present</p>
            </div>
            <Button 
              variant="outline" 
              className="text-red-600 hover:bg-red-50 hover:border-red-200" 
              onClick={handleEndSession}
            >
              End Session
            </Button>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
          {/* QR Code Display */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 to-white relative min-h-[400px]">
            {mode === 'school' ? (
              // Face Recognition Mode
              <>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Users size={120} className="text-gray-400" />
                </div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 border-2 border-[#10B981] rounded-lg -translate-y-1/2 before:absolute before:inset-0 before:bg-[#10B981]/10">
                  <div className="absolute bottom-[-24px] left-0 w-full text-center text-[#10B981] text-xs font-mono bg-black/50 rounded px-1">
                    Aarav S. 99%
                  </div>
                </div>
                <div className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-[#10B981] rounded-lg before:absolute before:inset-0 before:bg-[#10B981]/10">
                  <div className="absolute bottom-[-24px] left-0 w-full text-center text-[#10B981] text-xs font-mono bg-black/50 rounded px-1">
                    Diya P. 98%
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[#10B981] shadow-[0_0_15px_#10B981] animate-scan"></div>
              </>
            ) : (
              // QR Code Mode
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Scan to Mark Attendance</h3>
                  <p className="text-gray-500 mt-2">QR code refreshes every 5 seconds</p>
                </div>
                
                {/* QR Code */}
                <div className="relative">
                  <div className="p-6 bg-white border-8 border-gray-100 rounded-2xl shadow-lg">
                    {qrData ? (
                      <QRCodeSVG 
                        value={qrData}
                        size={280}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231E3A8A'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E",
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    ) : (
                      <div className="w-[280px] h-[280px] flex items-center justify-center bg-gray-100 rounded">
                        <p className="text-gray-400">Generating QR Code...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Refresh Indicator */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw size={14} className={`text-[#1E3A8A] ${refreshCounter <= 1 ? 'animate-spin' : ''}`} />
                      <span className="font-medium text-gray-700">
                        Refreshing in {refreshCounter}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Session ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900 mt-1">
                      {session?.sessionId.slice(-8)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Section</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {session?.section}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-6 flex items-center gap-2 text-sm text-[#10B981] font-medium bg-emerald-50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
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
  );
};

export default LiveSession;

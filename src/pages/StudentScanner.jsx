import { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle, Camera, AlertCircle, User, StopCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { validateQRData, markAttendance } from '../services/qrService';
import { getStudentByUID } from '../services/dataService';

const StudentScanner = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [studentUID, setStudentUID] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const html5QrcodeRef = useRef(null);
  const scannerDivId = 'qr-reader';

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState();
        // state 2 = SCANNING, state 3 = PAUSED
        if (state === 2 || state === 3) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (e) {
        // ignore cleanup errors
      }
      html5QrcodeRef.current = null;
    }
    setScanning(false);
  };

  const handleStartScanning = async () => {
    setScanResult(null);
    setCameraError(null);

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setCameraError('Camera requires a secure connection (HTTPS). Please access this page via HTTPS.');
      return;
    }

    // Request camera permission explicitly first
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch (err) {
      setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      return;
    }

    try {
      const html5Qrcode = new Html5Qrcode(scannerDivId);
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' }, // back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        onScanSuccess,
        () => {} // ignore per-frame errors
      );

      setScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError('Could not start camera. Make sure no other app is using it, and that you\'ve granted permission.');
      html5QrcodeRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanner immediately to prevent duplicate scans
    await stopScanner();

    try {
      const validation = validateQRData(decodedText);

      if (validation.valid) {
        console.log('[Scanner] Valid QR, writing to sessionId:', validation.data.sessionId);
        const attendance = await markAttendance(validation.data.sessionId, studentInfo, validation.data);
        console.log('[Scanner] Attendance written:', attendance);
        setScanResult({
          success: true,
          message: 'Attendance marked successfully!',
          data: validation.data,
          attendance,
        });
      } else {
        setScanResult({ success: false, message: validation.error });
      }
    } catch (err) {
      console.error('[Scanner] Error processing QR:', err?.code, err?.message, err);
      const msg = err?.code === 'permission-denied'
        ? 'Permission denied — Firestore rules need to allow unauthenticated writes to sessions.'
        : `Error: ${err?.message || 'Unknown error'}`;
      setScanResult({ success: false, message: msg });
    }
  };

  const handleStudentLogin = async () => {
    if (!studentUID.trim()) {
      alert('Please enter your UID');
      return;
    }
    // Look up student in Firestore by UID
    try {
      const student = await getStudentByUID(studentUID.trim());
      if (student) {
        setStudentInfo({
          studentId: student.id || studentUID,
          studentName: student.name,
          studentUID: student.uid,
          section: student.section,
        });
      } else {
        // Fallback: allow entry with entered UID even if not in DB
        setStudentInfo({
          studentId: studentUID,
          studentName: `Student (${studentUID})`,
          studentUID: studentUID.trim(),
          section: 'Unknown',
        });
      }
      setIsLoggedIn(true);
    } catch {
      // If Firestore lookup fails (e.g. offline), still allow entry
      setStudentInfo({
        studentId: studentUID,
        studentName: `Student (${studentUID})`,
        studentUID: studentUID.trim(),
        section: 'Unknown',
      });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = async () => {
    await stopScanner();
    setIsLoggedIn(false);
    setStudentInfo(null);
    setScanResult(null);
    setStudentUID('');
    setCameraError(null);
  };

  // Student Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AttendAI Scanner</h1>
            <p className="text-gray-600 mt-2">Enter your UID to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student UID</label>
              <input
                type="text"
                value={studentUID}
                onChange={(e) => setStudentUID(e.target.value)}
                placeholder="e.g., 24BCS10001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                onKeyPress={(e) => e.key === 'Enter' && handleStudentLogin()}
              />
            </div>
            <Button onClick={handleStudentLogin} className="w-full py-3">
              Continue to Scanner
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Quick Test UIDs:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• 24BCS10001 (Aarav Sharma)</li>
                  <li>• 24BCS10002 (Diya Patel)</li>
                  <li>• 24BCS10003 (Rohan Gupta)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Scanner Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AttendAI Scanner</h1>
          <p className="text-gray-600 mt-2">Scan QR code to mark your attendance</p>
        </div>

        {/* Student Info */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-lg">
                {studentInfo?.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{studentInfo?.studentName}</p>
                <p className="text-sm text-gray-600">{studentInfo?.studentUID}</p>
                <Badge variant="neutral" className="mt-1 text-xs">Section {studentInfo?.section}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-sm">Logout</Button>
          </div>
        </Card>

        {/* Scanner */}
        {!scanResult && (
          <Card className="mb-6 p-6">
            {/* Camera viewport — always in DOM so Html5Qrcode can attach to it */}
            <div
              id={scannerDivId}
              className={`rounded-lg overflow-hidden mb-4 ${scanning ? 'block' : 'hidden'}`}
              style={{ width: '100%', minHeight: '300px' }}
            />

            {!scanning && (
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50">
                  <QrCode size={64} className="text-gray-400" />
                </div>
                <Button onClick={handleStartScanning} className="w-full mb-3" icon={Camera}>
                  Open Camera to Scan
                </Button>
                <p className="text-sm text-gray-500">Tap to activate your back camera</p>
              </div>
            )}

            {scanning && (
              <>
                <Button onClick={stopScanner} variant="outline" className="w-full mb-3" icon={StopCircle}>
                  Stop Scanner
                </Button>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-900">📷 Point camera at the QR code</p>
                </div>
              </>
            )}

            {cameraError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-medium mb-2">{cameraError}</p>
                    <ol className="list-decimal list-inside space-y-1 text-red-800">
                      <li>Make sure you're on HTTPS</li>
                      <li>Tap the lock/camera icon in your browser address bar</li>
                      <li>Set Camera to "Allow"</li>
                      <li>Refresh and try again</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Result */}
        {scanResult && (
          <Card className={`p-6 ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {scanResult.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${scanResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {scanResult.success ? 'Attendance Marked!' : 'Scan Failed'}
                </h3>
                <p className={`text-sm mb-4 ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {scanResult.message}
                </p>

                {scanResult.success && scanResult.data && (
                  <div className="space-y-2 text-sm mb-4">
                    {[['Subject', scanResult.data.subject], ['Teacher', scanResult.data.teacher], ['Room', scanResult.data.room], ['Time', scanResult.data.time]].map(([label, val]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-green-700">{label}:</span>
                        <span className="font-medium text-green-900">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => { setScanResult(null); handleStartScanning(); }}
                  variant={scanResult.success ? 'outline' : 'primary'}
                  className="w-full"
                >
                  {scanResult.success ? 'Scan Another' : 'Try Again'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        {!scanResult && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">How to mark attendance:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Tap "Open Camera to Scan"</li>
                  <li>Allow camera access when prompted</li>
                  <li>Point camera at teacher's QR code</li>
                  <li>Attendance marked automatically</li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-900 font-medium">
                    ⚠️ Camera only works on HTTPS
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    QR codes refresh every 5 seconds — scan the latest one.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentScanner;

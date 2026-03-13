import { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle, Camera, AlertCircle, User } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { validateQRData, markAttendance } from '../services/qrService';

const StudentScanner = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Student login/identification
  const [studentUID, setStudentUID] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize scanner when camera is ready
  useEffect(() => {
    if (cameraReady && scannerRef.current && !html5QrcodeScannerRef.current) {
      setCameraError(null);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        // Request camera explicitly
        videoConstraints: {
          facingMode: "environment" // Use back camera on mobile
        },
        // Ensure video is displayed
        formatsToSupport: [ 0 ], // QR_CODE
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false
        }
      };

      try {
        const scanner = new Html5QrcodeScanner('qr-reader', config, /* verbose= */ false);
        
        scanner.render(onScanSuccess, onScanError);
        html5QrcodeScannerRef.current = scanner;
      } catch (error) {
        console.error('Scanner initialization error:', error);
        setCameraError('Failed to initialize camera. Please check permissions and ensure you are using HTTPS.');
        setCameraReady(false);
      }
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [cameraReady]);

  const onScanSuccess = async (decodedText) => {
    if (scanning) return; // Prevent multiple scans
    
    setScanning(true);
    setScanResult(null);

    try {
      // Validate QR code
      const validation = validateQRData(decodedText);

      if (validation.valid) {
        // Mark attendance
        const attendance = await markAttendance(validation.data.sessionId, studentInfo);
        
        setScanResult({
          success: true,
          message: 'Attendance marked successfully!',
          data: validation.data,
          attendance
        });

        // Stop scanner after successful scan
        if (html5QrcodeScannerRef.current) {
          html5QrcodeScannerRef.current.clear().catch(console.error);
          html5QrcodeScannerRef.current = null;
        }
        setCameraReady(false);
      } else {
        setScanResult({
          success: false,
          message: validation.error
        });
        setScanning(false);
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Error processing QR code. Please try again.'
      });
      setScanning(false);
    }
  };

  const onScanError = (error) => {
    // Ignore scan errors (happens when no QR code is visible)
    console.debug('Scan error:', error);
  };

  const handleStudentLogin = () => {
    if (!studentUID.trim()) {
      alert('Please enter your UID');
      return;
    }

    // In production, validate UID against database
    // For now, create student info from UID
    const student = {
      studentId: `STU${studentUID.slice(-3)}`,
      studentName: `Student ${studentUID.slice(-4)}`,
      studentUID: studentUID,
      section: '601A' // In production, fetch from database
    };

    setStudentInfo(student);
    setIsLoggedIn(true);
  };

  const handleStartScanning = () => {
    setScanResult(null);
    setScanning(false);
    setCameraError(null);
    setCameraReady(true);
  };

  const handleStopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
      html5QrcodeScannerRef.current = null;
    }
    setCameraReady(false);
    setScanning(false);
    setCameraError(null);
  };

  const handleLogout = () => {
    handleStopScanning();
    setIsLoggedIn(false);
    setStudentInfo(null);
    setScanResult(null);
    setStudentUID('');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student UID
              </label>
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AttendAI Scanner</h1>
          <p className="text-gray-600 mt-2">Scan QR code to mark your attendance</p>
        </div>

        {/* Student Info Card */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-lg">
                {studentInfo?.studentName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{studentInfo?.studentName}</p>
                <p className="text-sm text-gray-600">{studentInfo?.studentUID}</p>
                <Badge variant="neutral" className="mt-1 text-xs">
                  Section {studentInfo?.section}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-sm">
              Logout
            </Button>
          </div>
        </Card>

        {/* Scanner Card */}
        {!scanResult && (
          <Card className="mb-6 p-6">
            {!cameraReady ? (
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50">
                  <QrCode size={64} className="text-gray-400" />
                </div>

                <Button 
                  onClick={handleStartScanning}
                  className="w-full mb-4"
                  icon={Camera}
                >
                  Start Camera Scanner
                </Button>

                <p className="text-sm text-gray-500 mb-4">
                  Click to activate your camera and scan the QR code
                </p>

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-900">
                        <p className="font-medium mb-2">{cameraError}</p>
                        <p className="text-red-800 mb-2">To fix this:</p>
                        <ol className="list-decimal list-inside space-y-1 text-red-800">
                          <li>Make sure you're using HTTPS (not HTTP)</li>
                          <li>Click the camera icon in address bar</li>
                          <li>Select "Allow" for camera access</li>
                          <li>Refresh the page and try again</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div 
                    id="qr-reader" 
                    ref={scannerRef}
                    className="rounded-lg overflow-hidden"
                    style={{ 
                      width: '100%',
                      minHeight: '300px'
                    }}
                  ></div>
                </div>

                <Button 
                  onClick={handleStopScanning}
                  variant="outline"
                  className="w-full"
                >
                  Stop Scanner
                </Button>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 text-center">
                    {scanning ? '✓ Scanning... Please wait' : '📷 Point camera at QR code'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Result Card */}
        {scanResult && (
          <Card className={`p-6 animate-fadeIn ${
            scanResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                scanResult.success 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {scanResult.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  scanResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {scanResult.success ? 'Attendance Marked!' : 'Scan Failed'}
                </h3>
                <p className={`text-sm mb-4 ${
                  scanResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {scanResult.message}
                </p>
                
                {scanResult.success && scanResult.data && (
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-green-700">Subject:</span>
                      <span className="font-medium text-green-900">{scanResult.data.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Teacher:</span>
                      <span className="font-medium text-green-900">{scanResult.data.teacher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Room:</span>
                      <span className="font-medium text-green-900">{scanResult.data.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Time:</span>
                      <span className="font-medium text-green-900">{scanResult.data.time}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => {
                    setScanResult(null);
                    handleStartScanning();
                  }}
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
                  <li>Click "Start Camera Scanner"</li>
                  <li>Allow camera access when prompted</li>
                  <li>Point camera at teacher's QR code</li>
                  <li>Wait for automatic detection</li>
                  <li>Attendance marked instantly!</li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-900 font-medium">
                    ⚠️ Important: Camera only works on HTTPS (secure connection)
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    If camera doesn't work, make sure URL starts with "https://" not "http://"
                  </p>
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  Note: QR codes refresh every 5 seconds. Scan the latest code displayed by your teacher.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentScanner;

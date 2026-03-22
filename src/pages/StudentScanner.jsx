import { useState, useEffect, useRef } from 'react';
import {
  QrCode, CheckCircle, XCircle, Camera, AlertCircle, User,
  StopCircle, Loader, CheckCircle2, ScanFace, ShieldCheck
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { validateQRData } from '../services/qrService';
import attendanceStore from '../services/attendanceStore';
import { getStudentByUID } from '../services/dataService';
import { loadModels, getFaceDescriptor, captureMultipleDescriptors, saveFaceDescriptors, loadFaceDescriptors, compareFacesMulti } from '../services/faceService';

// Steps: 'uid' → 'face-register' | 'face-verify' → 'scan'
const StudentScanner = () => {
  const [step, setStep] = useState('uid');
  const [studentInfo, setStudentInfo] = useState(null);   // { studentId, studentName, studentUID, section, docId }
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // UID lookup
  const [studentUID, setStudentUID] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const lookupTimer = useRef(null);

  // Face
  const [modelsReady, setModelsReady] = useState(false);
  const [faceStatus, setFaceStatus] = useState('idle'); // idle | loading | capturing | success | fail
  const [faceMessage, setFaceMessage] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceIntervalRef = useRef(null);

  // QR scanner
  const html5QrcodeRef = useRef(null);
  const scannerDivId = 'qr-reader';

  useEffect(() => {
    loadModels().then(() => setModelsReady(true)).catch(console.error);
    return () => { stopScanner(); stopFaceCamera(); };
  }, []);

  // Live UID lookup debounced
  useEffect(() => {
    const uid = studentUID.trim().toUpperCase();
    setLookupResult(null);
    if (uid.length < 6) return;
    clearTimeout(lookupTimer.current);
    setLookupLoading(true);
    lookupTimer.current = setTimeout(async () => {
      try {
        const student = await getStudentByUID(uid);
        setLookupResult({ found: !!student, student: student || null });
      } catch (err) {
        setLookupResult({ found: false, student: null, error: err?.code });
      }
      setLookupLoading(false);
    }, 600);
    return () => clearTimeout(lookupTimer.current);
  }, [studentUID]);

  // Start face camera AFTER the step renders (so videoRef is in DOM)
  useEffect(() => {
    if (step === 'face-register') {
      setFaceStatus('loading');
      setFaceMessage('Starting camera...');
      // Small delay to ensure video element is mounted
      const t = setTimeout(async () => {
        await startFaceCamera();
        setFaceStatus('capturing');
        setFaceMessage('Look straight at the camera. Hold still...');
      }, 100);
      return () => clearTimeout(t);
    }
    if (step === 'face-verify') {
      setFaceStatus('loading');
      setFaceMessage('Loading stored face data...');
      const t = setTimeout(async () => {
        const storedList = await loadFaceDescriptors(studentInfo.docId);
        if (!storedList || storedList.length === 0) {
          setFaceStatus('fail');
          setFaceMessage('No face registered. Please register first.');
          return;
        }
        await startFaceCamera();
        setFaceStatus('capturing');
        setFaceMessage('Look at the camera to verify your identity...');
        faceIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          const live = await getFaceDescriptor(videoRef.current);
          if (!live) {
            setFaceMessage('No face detected — look directly at the camera.');
            return;
          }
          const result = compareFacesMulti(live, storedList);
          if (result.match) {
            clearInterval(faceIntervalRef.current);
            stopFaceCamera();
            setFaceStatus('success');
            setFaceMessage(`Identity verified! (distance: ${result.distance})`);
            setTimeout(() => setStep('scan'), 1200);
          } else {
            setFaceMessage(`Verifying... best distance: ${result.distance} (need < 0.5)`);
          }
        }, 1500);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  // ── Face camera helpers ──────────────────────────────────────────────────
  const startFaceCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
    } catch (err) {
      console.error('Face camera error:', err);
      setFaceStatus('fail');
      setFaceMessage('Camera permission denied. Please allow camera access.');
    }
  };

  const stopFaceCamera = () => {
    clearInterval(faceIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // ── Face Registration ────────────────────────────────────────────────────
  const handleStartRegister = () => {
    setFaceStatus('idle');
    setFaceMessage('');
    setStep('face-register');
  };

  const handleCaptureFace = async () => {
    if (!videoRef.current || faceStatus === 'loading') return;
    if (!studentInfo?.docId) {
      setFaceStatus('fail');
      setFaceMessage('Student ID missing — go back and re-enter your UID.');
      return;
    }
    setFaceStatus('loading');
    try {
      const descriptors = await captureMultipleDescriptors(videoRef.current, 8, (i, total) => {
        setFaceMessage(`Capturing sample ${i}/${total} — hold still...`);
      });
      if (descriptors.length < 3) {
        setFaceStatus('fail');
        setFaceMessage(`Only got ${descriptors.length} samples. Ensure good lighting and face the camera directly.`);
        return;
      }
      setFaceMessage(`Saving ${descriptors.length} samples to database...`);
      await saveFaceDescriptors(studentInfo.docId, descriptors);
      stopFaceCamera();
      setFaceStatus('success');
      setFaceMessage(`Registered with ${descriptors.length} samples. You can now scan QR codes.`);
      setTimeout(() => setStep('scan'), 1500);
    } catch (err) {
      setFaceStatus('fail');
      setFaceMessage(`Failed: ${err?.message || 'Unknown error'}. Try again.`);
      console.error('handleCaptureFace error:', err);
    }
  };

  // ── Face Verification ────────────────────────────────────────────────────
  const handleStartVerify = () => {
    setFaceStatus('idle');
    setFaceMessage('');
    setStep('face-verify');
  };

  // ── UID confirm ──────────────────────────────────────────────────────────
  const handleUIDConfirm = async () => {
    if (!lookupResult?.found) return;
    const s = lookupResult.student;
    setStudentInfo({
      studentId: s.id,
      studentName: s.name,
      studentUID: s.uid,
      section: s.section,
      docId: s.id,   // Firestore document ID — required for face save
      faceRegistered: s.faceRegistered || false,
    });
    // Go to face step
    if (!s.faceRegistered) {
      setStep('face-register-prompt');
    } else {
      setStep('face-verify-prompt');
    }
  };

  const handleLogout = async () => {
    await stopScanner();
    stopFaceCamera();
    setStep('uid');
    setStudentInfo(null);
    setScanResult(null);
    setStudentUID('');
    setLookupResult(null);
    setFaceStatus('idle');
    setFaceMessage('');
    setCameraError(null);
  };

  // ── QR Scanner ───────────────────────────────────────────────────────────
  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState();
        if (state === 2 || state === 3) await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch {}
      html5QrcodeRef.current = null;
    }
    setScanning(false);
  };

  const handleStartScanning = async () => {
    setScanResult(null);
    setCameraError(null);
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setCameraError('Camera requires HTTPS.');
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      setCameraError('Camera permission denied.');
      return;
    }
    try {
      const qr = new Html5Qrcode(scannerDivId);
      html5QrcodeRef.current = qr;
      await qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, () => {});
      setScanning(true);
    } catch (err) {
      console.error(err);
      setCameraError('Could not start camera.');
      html5QrcodeRef.current = null;
    }
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    try {
      const validation = validateQRData(decodedText);
      if (validation.valid) {
        const result = await attendanceStore.markAttendance(
          validation.data.sessionId,
          { ...studentInfo, method: 'QR' },
          validation.data
        );
        if (result.duplicate) {
          setScanResult({ success: false, message: 'You already marked attendance for this session.', duplicate: true });
        } else if (result.success) {
          setScanResult({ success: true, message: 'Attendance marked!', data: validation.data });
        } else {
          setScanResult({ success: false, message: result.error });
        }
      } else {
        setScanResult({ success: false, message: validation.error });
      }
    } catch (err) {
      const msg = err?.code === 'permission-denied'
        ? 'Permission denied — check Firestore rules.'
        : `Error: ${err?.message || 'Unknown'}`;
      setScanResult({ success: false, message: msg });
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────
  const faceStatusColor = { idle: 'gray', loading: 'blue', capturing: 'blue', success: 'green', fail: 'red' }[faceStatus];

  const renderFaceCamera = (title, subtitle, actionLabel, onAction, showAuto) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3">
            <ScanFace size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Video — always rendered so videoRef stays stable */}
        <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 border-4 border-white/60 rounded-full" />
          </div>
        </div>

        {/* Status */}
        <div className={`p-3 rounded-lg mb-4 text-sm text-center font-medium ${
          faceStatusColor === 'green' ? 'bg-green-50 text-green-800 border border-green-200' :
          faceStatusColor === 'red' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {faceStatus === 'loading' && <Loader size={14} className="inline animate-spin mr-2" />}
          {faceStatus === 'success' && <CheckCircle2 size={14} className="inline mr-2 text-green-600" />}
          {faceMessage || 'Initializing...'}
        </div>

        {showAuto && <p className="text-xs text-center text-gray-400 mb-3">Verifying automatically...</p>}

        <div className="flex gap-3">
          {onAction && faceStatus === 'capturing' && (
            <Button onClick={onAction} className="flex-1" icon={Camera}>{actionLabel}</Button>
          )}
          {faceStatus === 'fail' && (
            <Button onClick={() => { setFaceStatus('capturing'); setFaceMessage('Try again — look at the camera.'); }} className="flex-1">
              Try Again
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout} className="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  );

  // ── Step: UID entry ──────────────────────────────────────────────────────
  if (step === 'uid') {
    const uid = studentUID.trim().toUpperCase();
    const canContinue = lookupResult?.found === true;
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
              <div className="relative">
                <input type="text" value={studentUID}
                  onChange={e => setStudentUID(e.target.value.toUpperCase())}
                  placeholder="e.g., 24BCS10047"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-10 transition-colors ${
                    lookupResult?.found === true ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-200' :
                    lookupResult?.found === false ? 'border-red-400 bg-red-50 focus:ring-red-200' :
                    'border-gray-300 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]'
                  }`}
                  onKeyDown={e => e.key === 'Enter' && canContinue && handleUIDConfirm()}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {lookupLoading && <Loader size={18} className="animate-spin text-gray-400" />}
                  {!lookupLoading && lookupResult?.found === true && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {!lookupLoading && lookupResult?.found === false && <XCircle size={18} className="text-red-500" />}
                </div>
              </div>
            </div>

            {lookupResult?.found === true && lookupResult.student && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {lookupResult.student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-emerald-900 truncate">{lookupResult.student.name}</p>
                  <p className="text-sm text-emerald-700">{lookupResult.student.uid}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Section {lookupResult.student.section} • {lookupResult.student.year}</p>
                </div>
                {lookupResult.student.faceRegistered
                  ? <Badge variant="success" className="text-xs">Face ✓</Badge>
                  : <Badge variant="warning" className="text-xs">No Face</Badge>}
              </div>
            )}

            {lookupResult?.found === false && uid.length >= 6 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <XCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {lookupResult.error === 'permission-denied'
                    ? 'Database permission error — contact your teacher.'
                    : 'UID not found. Check your university ID card.'}
                </p>
              </div>
            )}

            <Button onClick={handleUIDConfirm} className="w-full py-3" disabled={!canContinue || lookupLoading}>
              {lookupLoading ? 'Verifying...' : canContinue ? `Continue as ${lookupResult.student.name.split(' ')[0]}` : 'Enter your UID above'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Section 605A UIDs:</p>
                <ul className="text-blue-800 space-y-0.5 text-xs">
                  <li>• 24BCS10047 — Rohit Raj</li>
                  <li>• 24BCS10096 — Diya Sharma</li>
                  <li>• 24BCS12794 — Aarav Sharma</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Step: prompt to register face ────────────────────────────────────────
  if (step === 'face-register-prompt') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ScanFace size={32} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Your Face</h2>
          <p className="text-gray-600 text-sm mb-6">
            You haven't registered your face yet. This is a one-time setup — it takes about 5 seconds.
          </p>
          <div className="space-y-3">
            <Button onClick={handleStartRegister} className="w-full" icon={Camera} disabled={!modelsReady}>
              {modelsReady ? 'Register Face Now' : 'Loading AI models...'}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full">Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Step: face registration camera ───────────────────────────────────────
  if (step === 'face-register') {
    return renderFaceCamera(
      'Register Your Face',
      'Position your face in the oval and tap Capture',
      'Capture Face',
      handleCaptureFace,
      false
    );
  }

  // ── Step: prompt to verify face ──────────────────────────────────────────
  if (step === 'face-verify-prompt') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[#1E3A8A]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
          <p className="text-gray-600 text-sm mb-2">
            Hi <span className="font-semibold">{studentInfo?.studentName}</span>! Quick face check before scanning.
          </p>
          <p className="text-xs text-gray-400 mb-6">This prevents proxy attendance.</p>
          <div className="space-y-3">
            <Button onClick={handleStartVerify} className="w-full" icon={ScanFace} disabled={!modelsReady}>
              {modelsReady ? 'Verify Face' : 'Loading AI models...'}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full">Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Step: face verification camera ───────────────────────────────────────
  if (step === 'face-verify') {
    return renderFaceCamera(
      'Face Verification',
      'Look at the camera — verifying automatically',
      null,
      null,
      true
    );
  }

  // ── Step: QR scan ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AttendAI Scanner</h1>
          <p className="text-gray-600 mt-1">Scan QR code to mark attendance</p>
        </div>

        {/* Student Info */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold text-lg">
                {studentInfo?.studentName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{studentInfo?.studentName}</p>
                <p className="text-sm text-gray-600">{studentInfo?.studentUID}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="neutral" className="text-xs">Section {studentInfo?.section}</Badge>
                  <Badge variant="success" className="text-xs flex items-center gap-1"><ShieldCheck size={10} /> Verified</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-sm">Logout</Button>
          </div>
        </Card>

        {/* Scanner */}
        {!scanResult && (
          <Card className="mb-6 p-6">
            <div id={scannerDivId} className={`rounded-lg overflow-hidden mb-4 ${scanning ? 'block' : 'hidden'}`} style={{ width: '100%', minHeight: '300px' }} />
            {!scanning && (
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50">
                  <QrCode size={64} className="text-gray-400" />
                </div>
                <Button onClick={handleStartScanning} className="w-full mb-3" icon={Camera}>Open Camera to Scan</Button>
                <p className="text-sm text-gray-500">Tap to activate your back camera</p>
              </div>
            )}
            {scanning && (
              <>
                <Button onClick={stopScanner} variant="outline" className="w-full mb-3" icon={StopCircle}>Stop Scanner</Button>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-900">📷 Point camera at the QR code</p>
                </div>
              </>
            )}
            {cameraError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-900">{cameraError}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Result */}
        {scanResult && (
          <Card className={`p-6 ${scanResult.success ? 'bg-green-50 border-green-200' : scanResult.duplicate ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${scanResult.success ? 'bg-green-100 text-green-600' : scanResult.duplicate ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                {scanResult.success ? <CheckCircle size={24} /> : scanResult.duplicate ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${scanResult.success ? 'text-green-900' : scanResult.duplicate ? 'text-amber-900' : 'text-red-900'}`}>
                  {scanResult.success ? 'Attendance Marked!' : scanResult.duplicate ? 'Already Marked' : 'Scan Failed'}
                </h3>
                <p className={`text-sm mb-4 ${scanResult.success ? 'text-green-800' : scanResult.duplicate ? 'text-amber-800' : 'text-red-800'}`}>{scanResult.message}</p>
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
                <Button onClick={() => { setScanResult(null); handleStartScanning(); }} variant="outline" className="w-full">
                  {scanResult.success ? 'Scan Another' : 'Try Again'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentScanner;

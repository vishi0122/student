import { useState, useEffect, useRef } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Loader, ScanFace, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/dataService';
import { loadModels, captureMultipleDescriptors, saveFaceDescriptors } from '../services/faceService';

// ── Inline Face Registration Modal ──────────────────────────────────────────
const FaceRegisterModal = ({ student, onClose, onSuccess }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | starting | capturing | saving | done | error
  const [message, setMessage] = useState('Click "Start Camera" to begin.');
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    loadModels().then(() => setModelsReady(true)).catch(() => setMessage('Failed to load face models.'));
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setStatus('starting');
    setMessage('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = () => videoRef.current.play().then(resolve).catch(resolve);
          if (videoRef.current.readyState >= 2) videoRef.current.play().then(resolve).catch(resolve);
        });
      }
      setStatus('idle');
      setMessage('Camera ready. Position the student\'s face in the oval and click Capture.');
    } catch {
      setStatus('error');
      setMessage('Camera permission denied. Allow camera access and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) return;
    setStatus('capturing');
    try {
      const descriptors = await captureMultipleDescriptors(videoRef.current, 8, (i, total) => {
        setMessage(`Capturing sample ${i}/${total} — hold still...`);
      });
      if (descriptors.length < 3) {
        setStatus('error');
        setMessage(`Only got ${descriptors.length} samples. Ensure good lighting and face the camera directly.`);
        return;
      }
      setStatus('saving');
      setMessage(`Saving ${descriptors.length} face samples...`);
      await saveFaceDescriptors(student.id, descriptors);
      stopCamera();
      setStatus('done');
      setMessage(`Face registered with ${descriptors.length} samples.`);
      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setStatus('error');
      setMessage(`Failed: ${err?.message || 'Unknown error'}. Try again.`);
    }
  };

  const isCapturing = status === 'capturing' || status === 'saving';
  const cameraActive = !!streamRef.current;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3">
            <ScanFace size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Register Face — {student.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{student.uid} · Section {student.section}</p>
        </div>

        {/* Video */}
        <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
          <video ref={videoRef} autoPlay muted playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* Face guide oval */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-44 h-52 border-4 rounded-full transition-colors duration-300 ${
              status === 'capturing' ? 'border-blue-400' :
              status === 'done' ? 'border-emerald-400' :
              'border-white/50'
            }`} />
          </div>
          {/* Done overlay */}
          {status === 'done' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center text-white">
                <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-lg">Registered!</p>
              </div>
            </div>
          )}
        </div>

        {/* Status message */}
        <div className={`p-3 rounded-lg mb-4 text-sm text-center font-medium ${
          status === 'done' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {isCapturing && <Loader size={13} className="inline animate-spin mr-2" />}
          {status === 'done' && <CheckCircle2 size={13} className="inline mr-2 text-emerald-600" />}
          {message}
        </div>

        <div className="flex gap-3">
          {!cameraActive && status !== 'done' && (
            <Button onClick={startCamera} disabled={!modelsReady || status === 'starting'} className="flex-1" icon={Camera}>
              {modelsReady ? 'Start Camera' : 'Loading models...'}
            </Button>
          )}
          {cameraActive && status !== 'done' && (
            <Button onClick={handleCapture} disabled={isCapturing} className="flex-1" icon={ScanFace}>
              {isCapturing ? 'Capturing...' : 'Capture Face'}
            </Button>
          )}
          {status === 'error' && cameraActive && (
            <Button onClick={() => { setStatus('idle'); setMessage('Try again — position face in the oval.'); }} variant="outline" className="flex-1">
              Retry
            </Button>
          )}
          <Button variant="outline" onClick={() => { stopCamera(); onClose(); }} className="flex-1">
            {status === 'done' ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ── Main Students Page ───────────────────────────────────────────────────────
const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [faceRegisterStudent, setFaceRegisterStudent] = useState(null); // student to register face for
  const [newStudent, setNewStudent] = useState({ name: '', uid: '', section: '601A', year: '2nd Year', email: '', parentEmail: '', faceRegistered: false, institution: 'college' });

  const sections = user?.sections || [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const filters = {};
      if (selectedSection !== 'all') filters.section = selectedSection;
      const data = await getStudents(filters);
      setStudents(data);
      setLoading(false);
    };
    load();
  }, [selectedSection]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.uid.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newStudent.name || !newStudent.uid) return;
    const id = `STU-${Date.now()}`;
    await addStudent({ ...newStudent, id });
    setStudents(prev => [...prev, { ...newStudent, id }]);
    setShowAddModal(false);
    setNewStudent({ name: '', uid: '', section: '601A', year: '2nd Year', email: '', parentEmail: '', faceRegistered: false, institution: 'college' });
  };

  const handleEditSave = async () => {
    if (!editStudent) return;
    await updateStudent(editStudent.id, { parentEmail: editStudent.parentEmail, email: editStudent.email, name: editStudent.name });
    setStudents(prev => prev.map(s => s.id === editStudent.id ? { ...s, ...editStudent } : s));
    setEditStudent(null);
  };

  const handleUnregisterFace = async (student) => {
    if (!confirm(`Remove face registration for ${student.name}?`)) return;
    await updateStudent(student.id, { faceRegistered: false, faceDescriptor: null, faceDescriptorMap: null });
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, faceRegistered: false } : s));
  };

  const handleFaceRegistered = (studentId) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, faceRegistered: true } : s));
    setFaceRegisterStudent(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    await deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Student Directory' : 'My Students'}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin ? 'Manage all enrollments and biometric profiles.' : 'Students in your assigned sections.'}
            </p>
          </div>
          {isAdmin && <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Student</Button>}
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or UID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] text-sm"
              />
            </div>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
            >
              <option value="all">All Sections</option>
              {(isAdmin ? ['601A', '601B', '602', '603', '604', '605', '605A', '606', '607', '12A'] : sections).map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={32} className="animate-spin text-[#1E3A8A]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">Student Name</th>
                    <th className="p-4 font-medium">UID</th>
                    <th className="p-4 font-medium">Section</th>
                    <th className="p-4 font-medium">Year</th>
                    <th className="p-4 font-medium">Parent Email</th>
                    <th className="p-4 font-medium">Face Profile</th>
                    {(isAdmin || isFaculty) && <th className="p-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-gray-400">No students found</td></tr>
                  ) : filtered.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm font-mono">{student.uid}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Sec {student.section}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{student.year}</td>
                      <td className="p-4 text-gray-600 text-sm">
                        {student.parentEmail
                          ? <span className="text-blue-700">{student.parentEmail}</span>
                          : <span className="text-amber-500 italic text-xs">Not set</span>
                        }
                      </td>
                      <td className="p-4">
                        {student.faceRegistered ? (
                          <Badge variant="success">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Registered</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <span className="flex items-center gap-1"><XCircle size={12}/> Pending</span>
                          </Badge>
                        )}
                      </td>
                      {(isAdmin || isFaculty) && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setEditStudent({ ...student })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Edit Email
                            </button>
                            {isAdmin && (
                              <>
                                {student.faceRegistered ? (
                                  <button onClick={() => handleUnregisterFace(student)} className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                                    Unregister
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setFaceRegisterStudent(student)}
                                    className="flex items-center gap-1 text-[#10B981] hover:text-emerald-700 text-sm font-medium"
                                  >
                                    <ScanFace size={14} /> Register Face
                                  </button>
                                )}
                                <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
              {[['Name', 'name', 'text', 'Full Name'], ['UID', 'uid', 'text', 'e.g. 24BCS10099'], ['Email', 'email', 'email', 'student@cumail.in'], ['Parent Email', 'parentEmail', 'email', 'parent@gmail.com']].map(([label, field, type, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={newStudent[field]}
                    onChange={e => setNewStudent(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select value={newStudent.section} onChange={e => setNewStudent(p => ({ ...p, section: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm bg-white">
                  {['601A', '601B', '602', '603', '604', '605', '605A', '606', '607', '12A'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleAdd} className="flex-1">Add Student</Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Email Modal */}
        {editStudent && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Emails — {editStudent.name}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input type="email" value={editStudent.email || ''}
                  onChange={e => setEditStudent(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                <input type="email" value={editStudent.parentEmail || ''}
                  onChange={e => setEditStudent(p => ({ ...p, parentEmail: e.target.value }))}
                  placeholder="parent@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
                <p className="text-xs text-gray-400 mt-1">Absence notifications will be sent to this email.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleEditSave} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditStudent(null)} className="flex-1">Cancel</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Face Registration Modal */}
        {faceRegisterStudent && (
          <FaceRegisterModal
            student={faceRegisterStudent}
            onClose={() => setFaceRegisterStudent(null)}
            onSuccess={() => handleFaceRegistered(faceRegisterStudent.id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Students;

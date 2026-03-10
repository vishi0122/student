import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Smartphone, CheckCircle2, QrCode, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SUBJECTS } from '../data/subjects';
import { getLecturesByTeacher } from '../data/timetable';

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultMode = user?.instType === 'college' ? 'university' : 'school';
  const [mode, setMode] = useState(defaultMode);
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';
  const [sessionType, setSessionType] = useState('lecture'); // 'lecture' or 'lab'

  // Use real CU subjects for college
  const cuSubjects = SUBJECTS.map(sub => sub.name);
  
  // Faculty only sees their assigned subjects (example: Juned's subjects)
  const facultySubjects = getLecturesByTeacher('Juned')
    .map(lecture => lecture.subject)
    .filter((subject, index, self) => self.indexOf(subject) === index); // Remove duplicates

  const schoolSubjects = [
    'Mathematics',
    'Science',
    'English',
    'Social Studies',
    'Hindi'
  ];

  const subjects = isCollege 
    ? (isFaculty ? facultySubjects : cuSubjects)
    : schoolSubjects;

  const handleStartSession = () => {
    navigate('/live-session', { state: { mode, sessionType } });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Initiate Attendance Session</h1>
          <p className="text-gray-500 mt-2">
            {isCollege && isFaculty 
              ? 'Generate QR code for your lecture or lab session.' 
              : 'Select the appropriate mode for your classroom environment.'}
          </p>
        </div>

        {/* Only show mode selection if NOT college faculty */}
        {!(isCollege && isFaculty) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* School Mode Card */}
            <div 
              onClick={() => setMode('school')}
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                mode === 'school' 
                  ? 'border-[#1E3A8A] bg-blue-50/50 shadow-md relative' 
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {mode === 'school' && (
                <div className="absolute top-4 right-4 text-[#1E3A8A]">
                  <CheckCircle2 size={24}/>
                </div>
              )}
              <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-4">
                <Camera size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">School Mode</h3>
              <p className="text-gray-600 text-sm">
                High-speed group facial recognition. Uses the admin's camera to scan the entire classroom simultaneously. Ideal for K-12.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981]"/> Group scanning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981]"/> Zero student devices needed
                </li>
              </ul>
            </div>

            {/* University Mode Card */}
            <div 
              onClick={() => setMode('university')}
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                mode === 'university' 
                  ? 'border-[#1E3A8A] bg-blue-50/50 shadow-md relative' 
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {mode === 'university' && (
                <div className="absolute top-4 right-4 text-[#1E3A8A]">
                  <CheckCircle2 size={24}/>
                </div>
              )}
              <div className="w-16 h-16 bg-emerald-100 text-[#10B981] rounded-2xl flex items-center justify-center mb-4">
                <Smartphone size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">University Mode</h3>
              <p className="text-gray-600 text-sm">
                Dynamic QR display + Student mobile face verification. Projects a changing QR code; students scan and verify via their device.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981]"/> Anti-proxy QR logic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981]"/> Scales to large lecture halls
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* College Faculty: Show session type selector */}
        {isCollege && isFaculty && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Session Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSessionType('lecture')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  sessionType === 'lecture'
                    ? 'border-[#1E3A8A] bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 text-[#1E3A8A] rounded-lg flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Lecture</h4>
                    <p className="text-sm text-gray-500">50 minutes</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Theory class with QR attendance</p>
              </button>

              <button
                onClick={() => setSessionType('lab')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  sessionType === 'lab'
                    ? 'border-[#1E3A8A] bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 text-[#10B981] rounded-lg flex items-center justify-center">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Lab</h4>
                    <p className="text-sm text-gray-500">100 minutes (50+50)</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Practical session with extended duration</p>
              </button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
              <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] py-2 px-3 border bg-white">
                {subjects.map((subject, idx) => (
                  <option key={idx}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] py-2 px-3 border bg-white">
                <option>Section 601A</option>
                <option>Section 601B</option>
                <option>Section 602</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isCollege && isFaculty ? 'Session Type' : 'Duration'}
              </label>
              {isCollege && isFaculty ? (
                <select 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] py-2 px-3 border bg-white"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                >
                  <option value="lecture">Lecture (50 min)</option>
                  <option value="lab">Lab (100 min)</option>
                </select>
              ) : (
                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] py-2 px-3 border bg-white">
                  {isCollege ? (
                    <>
                      <option>50 Minutes</option>
                      <option>100 Minutes</option>
                      <option>150 Minutes</option>
                    </>
                  ) : (
                    <>
                      <option>45 Minutes (1 Period)</option>
                      <option>90 Minutes (2 Periods)</option>
                    </>
                  )}
                </select>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <Button 
              className="px-8 py-3 text-lg" 
              onClick={handleStartSession}
              icon={mode === 'school' ? Camera : QrCode}
            >
              {isCollege && isFaculty 
                ? `Start ${sessionType === 'lecture' ? 'Lecture' : 'Lab'} Session`
                : `Start ${mode === 'school' ? 'Camera Scan' : 'QR Session'}`
              }
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;

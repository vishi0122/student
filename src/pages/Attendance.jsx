import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Smartphone, CheckCircle2, QrCode, BookOpen, Settings, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSubjects, getSubjectsByTeacher } from '../services/dataService';

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';
  const [mode, setMode] = useState(isCollege ? 'university' : 'school');
  const [sessionType, setSessionType] = useState('lecture');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState(isCollege ? '605A' : '12A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let data = isFaculty && user?.name
        ? await getSubjectsByTeacher(user.name)
        : await getSubjects();
      // Filter by institution so school users only see school subjects
      if (user?.instType) data = data.filter(s => !s.institution || s.institution === user.instType);
      setSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0].name);
      setLoading(false);
    };
    load();
  }, [user]);

  const sections = user?.sections || ['605A'];

  const handleStartSession = () => {
    navigate('/live-session', { state: { mode, sessionType, subject: selectedSubject, section: selectedSection } });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Initiate Attendance Session</h1>
          <p className="text-gray-500 mt-2">
            {isFaculty ? 'Generate QR code for your lecture or lab session.' : 'Select the appropriate mode for your classroom.'}
          </p>
        </div>

        {!isFaculty && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: 'school', icon: Camera, color: 'text-[#1E3A8A]', bg: 'bg-blue-100', title: 'School Mode', desc: 'High-speed group facial recognition. Scans the entire classroom simultaneously.', features: ['Group scanning', 'Zero student devices needed'] },
              { key: 'university', icon: Smartphone, color: 'text-[#10B981]', bg: 'bg-emerald-100', title: 'University Mode', desc: 'Dynamic QR display + student mobile verification. Anti-proxy with 5-second refresh.', features: ['Anti-proxy QR logic', 'Scales to large lecture halls'] },
            ].map(({ key, icon: Icon, color, bg, title, desc, features }) => (
              <div key={key} onClick={() => setMode(key)}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 relative ${
                  mode === key ? 'border-[#1E3A8A] bg-blue-50/50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                {mode === key && <div className="absolute top-4 right-4 text-[#1E3A8A]"><CheckCircle2 size={24}/></div>}
                <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#10B981]"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {isFaculty && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Session Type</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'lecture', icon: BookOpen, color: 'text-[#1E3A8A]', bg: 'bg-blue-100', title: 'Lecture', duration: '50 minutes', desc: 'Theory class with QR attendance' },
                { key: 'lab', icon: Settings, color: 'text-[#10B981]', bg: 'bg-emerald-100', title: 'Lab', duration: '100 minutes (50+50)', desc: 'Practical session with extended duration' },
              ].map(({ key, icon: Icon, color, bg, title, duration, desc }) => (
                <button key={key} onClick={() => setSessionType(key)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${sessionType === key ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 ${bg} ${color} rounded-lg flex items-center justify-center`}><Icon size={24}/></div>
                    <div>
                      <h4 className="font-bold text-gray-900">{title}</h4>
                      <p className="text-sm text-gray-500">{duration}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{desc}</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader size={28} className="animate-spin text-[#1E3A8A]"/></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                  <select value={sessionType} onChange={e => setSessionType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 bg-white text-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                    <option value="lecture">Lecture (50 min)</option>
                    <option value="lab">Lab (100 min)</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <Button className="px-8 py-3 text-lg" onClick={handleStartSession} icon={mode === 'school' ? Camera : QrCode}>
                  {isFaculty ? `Start ${sessionType === 'lecture' ? 'Lecture' : 'Lab'} Session` : `Start ${mode === 'school' ? 'Camera Scan' : 'QR Session'}`}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;

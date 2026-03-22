import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/dataService';

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null); // student being edited
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

  const handleToggleFace = async (student) => {
    await updateStudent(student.id, { faceRegistered: !student.faceRegistered });
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, faceRegistered: !s.faceRegistered } : s));
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
              {(isAdmin ? ['601A', '601B', '602', '603', '604', '605', '606', '607'] : sections).map(s => (
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
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
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
                          <Badge variant="success"><span className="flex items-center gap-1"><CheckCircle2 size={12}/> Registered</span></Badge>
                        ) : (
                          <Badge variant="warning"><span className="flex items-center gap-1"><XCircle size={12}/> Pending</span></Badge>
                        )}
                      </td>
                      {(isAdmin || isFaculty) && (
                        <td className="p-4 text-right space-x-3">
                          <button onClick={() => setEditStudent({ ...student })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit Email
                          </button>
                          {isAdmin && <>
                            <button onClick={() => handleToggleFace(student)} className="text-[#10B981] hover:text-emerald-700 text-sm font-medium">
                              {student.faceRegistered ? 'Unregister' : 'Register Face'}
                            </button>
                            <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                              Delete
                            </button>
                          </>}
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
                  {['601A', '601B', '602', '603', '604', '605', '606', '607'].map(s => <option key={s}>{s}</option>)}
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
      </div>
    </DashboardLayout>
  );
};

export default Students;

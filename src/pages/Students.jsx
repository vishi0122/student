import { useState } from 'react';
import { Plus, Search, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ALL_STUDENTS, getStudentsBySection } from '../data/students';

const Students = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';
  const [selectedSection, setSelectedSection] = useState('all');

  // Use real CU student data for college
  const cuStudents = ALL_STUDENTS.map(student => ({
    id: student.id,
    name: student.name,
    roll: student.uid,
    section: student.section,
    year: student.year,
    faceStatus: student.faceRegistered
  }));

  const schoolStudents = [
    { id: '201', name: 'Arjun Kumar', roll: 'X-A-15', section: 'A', grade: 'Class 10', faceStatus: true },
    { id: '202', name: 'Sneha Iyer', roll: 'X-A-16', section: 'A', grade: 'Class 10', faceStatus: true },
    { id: '203', name: 'Karan Singh', roll: 'X-B-12', section: 'B', grade: 'Class 10', faceStatus: true },
    { id: '204', name: 'Meera Joshi', roll: 'IX-A-20', section: 'A', grade: 'Class 9', faceStatus: false },
    { id: '205', name: 'Rahul Desai', roll: 'X-A-18', section: 'A', grade: 'Class 10', faceStatus: true },
  ];

  let students = isCollege ? cuStudents : schoolStudents;

  // Filter by section if college faculty
  if (isCollege && isFaculty && selectedSection !== 'all') {
    students = getStudentsBySection(selectedSection).map(student => ({
      id: student.id,
      name: student.name,
      roll: student.uid,
      section: student.section,
      year: student.year,
      faceStatus: student.faceRegistered
    }));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Student Directory' : 'My Students'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin 
                ? 'Manage all enrollments and biometric profiles.' 
                : 'View students enrolled in your assigned sections.'}
            </p>
          </div>
          {isAdmin && <Button icon={Plus}>Add Student</Button>}
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or roll number..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] text-sm"
              />
            </div>
            {/* Section filter for college faculty */}
            {isCollege && isFaculty && (
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] py-2 px-3 border bg-white text-sm"
              >
                <option value="all">All Sections</option>
                <option value="601A">Section 601A</option>
                <option value="601B">Section 601B</option>
                <option value="602">Section 602</option>
              </select>
            )}
            <Button variant="outline" icon={Settings}>Filters</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">Roll Number</th>
                  <th className="p-4 font-medium">Section</th>
                  <th className="p-4 font-medium">{isCollege ? 'Year' : 'Grade'}</th>
                  <th className="p-4 font-medium">Face Profile</th>
                  {isAdmin && <th className="p-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{student.roll}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Sec {student.section}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {isCollege ? student.year : student.grade}
                    </td>
                    <td className="p-4">
                      {student.faceStatus ? (
                        <Badge variant="success">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12}/> Registered
                          </span>
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <span className="flex items-center gap-1">
                            <XCircle size={12}/> Pending
                          </span>
                        </Badge>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <button className="text-[#1E3A8A] hover:text-blue-900 text-sm font-medium mr-3">
                          Edit
                        </button>
                        {!student.faceStatus && (
                          <button className="text-[#10B981] hover:text-emerald-700 text-sm font-medium">
                            Scan
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Students;

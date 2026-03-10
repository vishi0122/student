import { Plus, Search, BookOpen, UserSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SUBJECTS } from '../data/subjects';
import { TEACHERS } from '../data/teachers';
import { getLecturesByTeacher } from '../data/timetable';

const Subjects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';

  // Use real Chandigarh University data for college
  const cuSubjects = SUBJECTS.map(sub => ({
    id: sub.id,
    name: sub.name,
    code: sub.code,
    teacher: TEACHERS.find(t => t.subject === sub.name || t.subject.includes(sub.name.split(' ')[0]))?.name || 'TBA',
    sections: ['601A', '601B'],
    credits: sub.credits,
    type: sub.type
  }));

  // Faculty only sees assigned subjects (example: Juned's subjects - Full Stack)
  const facultyLectures = getLecturesByTeacher('Juned');
  const facultySubjectNames = [...new Set(facultyLectures.map(l => l.subject))];
  const facultySubjects = SUBJECTS
    .filter(sub => facultySubjectNames.includes(sub.name))
    .map(sub => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      teacher: 'You',
      sections: ['601A', '601B'],
      credits: sub.credits,
      type: sub.type
    }));

  const schoolSubjects = [
    { id: 'SUB101', name: 'Mathematics', code: 'MATH-X', teacher: 'Mrs. Sharma', sections: ['A', 'B'], periods: 6 },
    { id: 'SUB102', name: 'Science', code: 'SCI-X', teacher: 'Mr. Patel', sections: ['A', 'B'], periods: 6 },
    { id: 'SUB103', name: 'English', code: 'ENG-X', teacher: 'Ms. Reddy', sections: ['A', 'B', 'C'], periods: 5 },
    { id: 'SUB104', name: 'Social Studies', code: 'SS-X', teacher: 'Mr. Kumar', sections: ['A', 'B'], periods: 5 },
    { id: 'SUB105', name: 'Hindi', code: 'HIN-X', teacher: 'Mrs. Gupta', sections: ['A', 'B'], periods: 4 },
  ];

  const subjects = isCollege 
    ? (isFaculty ? facultySubjects : cuSubjects)
    : schoolSubjects;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Subject Management' : 'My Subjects'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin 
                ? 'Manage course catalog and instructor assignments.' 
                : 'View the details of subjects assigned to you.'}
            </p>
          </div>
          {isAdmin && <Button icon={Plus}>Add Subject</Button>}
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Subject Name</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">{isCollege ? 'Instructor' : 'Teacher'}</th>
                  <th className="p-4 font-medium">Sections</th>
                  <th className="p-4 font-medium">{isCollege ? 'Credits' : 'Periods/Week'}</th>
                  {isAdmin && <th className="p-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-lg">
                          <BookOpen size={18} />
                        </div>
                        <span className="font-medium text-gray-900">{sub.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm font-mono">{sub.code}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <UserSquare size={16} className="text-gray-400"/>
                        {sub.teacher}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {sub.sections.map(sec => (
                          <span key={sec} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm font-semibold">
                      {isCollege ? (
                        <div className="flex items-center gap-2">
                          <span>{sub.credits} Credits</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            sub.type === 'Lab' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sub.type}
                          </span>
                        </div>
                      ) : (
                        `${sub.periods} Periods`
                      )}
                    </td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        <button className="text-[#1E3A8A] hover:text-blue-900 text-sm font-medium">
                          Manage
                        </button>
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

export default Subjects;

import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, UserSquare, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSubjects, getSubjectsByTeacher } from '../services/dataService';

const Subjects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let data;
      if (isFaculty && user?.name) {
        data = await getSubjectsByTeacher(user.name);
      } else {
        data = await getSubjects();
      }
      // Filter by institution so school users only see school subjects
      if (user?.instType) data = data.filter(s => !s.institution || s.institution === user.instType);
      setSubjects(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Subject Management' : 'My Subjects'}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin ? 'Manage course catalog and instructor assignments.' : 'Subjects assigned to you.'}
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
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] text-sm"
              />
            </div>
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
                    <th className="p-4 font-medium">Subject Name</th>
                    <th className="p-4 font-medium">Code</th>
                    <th className="p-4 font-medium">Instructor</th>
                    <th className="p-4 font-medium">Sections</th>
                    <th className="p-4 font-medium">Credits / Type</th>
                    {isAdmin && <th className="p-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-gray-400">No subjects found</td></tr>
                  ) : filtered.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-lg"><BookOpen size={18} /></div>
                          <span className="font-medium text-gray-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm font-mono">{sub.code}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <UserSquare size={16} className="text-gray-400" />
                          {isFaculty ? 'You' : sub.teacher}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {(sub.sections || []).map(sec => (
                            <span key={sec} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{sec}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{sub.credits} Credits</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${sub.type === 'Lab' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {sub.type}
                          </span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-right">
                          <button className="text-[#1E3A8A] hover:text-blue-900 text-sm font-medium">Manage</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Subjects;

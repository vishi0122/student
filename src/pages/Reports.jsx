import React from 'react';
import { Download, Filter, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Reports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';

  // Different reports based on institution type and role
  const collegeAdminReports = [
    { name: 'Campus Monthly Overview', date: 'Oct 31, 2025', type: 'System Auto-Gen' },
    { name: 'Defaulters List (Below 75%)', date: 'Oct 28, 2025', type: 'Manual Export' },
    { name: 'CS101 - Section A Attendance Log', date: 'Oct 25, 2025', type: 'Subject Specific' },
    { name: 'Semester Attendance Summary', date: 'Oct 20, 2025', type: 'System Auto-Gen' },
  ];

  const collegeFacultyReports = [
    { name: 'My Lectures Overview', date: 'Oct 31, 2025', type: 'System Auto-Gen' },
    { name: 'CS101 - Section A Attendance', date: 'Oct 30, 2025', type: 'Subject Specific' },
    { name: 'CS101 - Section B Attendance', date: 'Oct 30, 2025', type: 'Subject Specific' },
    { name: 'Data Structures - Lab Attendance', date: 'Oct 29, 2025', type: 'Subject Specific' },
    { name: 'Database Systems - Lecture Attendance', date: 'Oct 28, 2025', type: 'Subject Specific' },
    { name: 'Low Attendance Students (My Classes)', date: 'Oct 25, 2025', type: 'Manual Export' },
  ];

  const schoolReports = [
    { name: isAdmin ? 'School Daily Overview' : 'My Class Overview', date: 'Oct 31, 2025', type: 'System Auto-Gen' },
    { name: 'Absentee Report - Class 10', date: 'Oct 30, 2025', type: 'Manual Export' },
    { name: 'Monthly Attendance Summary', date: 'Oct 28, 2025', type: 'System Auto-Gen' },
    { name: 'Parent Notification List', date: 'Oct 25, 2025', type: 'Manual Export' },
  ];

  const reports = isCollege 
    ? (isFaculty ? collegeFacultyReports : collegeAdminReports)
    : schoolReports;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 text-sm mt-1">Comprehensive attendance data and exportable insights.</p>
          </div>
          <Button icon={Download} className="bg-[#1E3A8A] hover:bg-blue-900 text-white">
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-t-[#1E3A8A]">
            <p className="text-sm font-medium text-gray-500 mb-1">Average Attendance</p>
            <p className="text-3xl font-bold text-gray-900">{isAdmin ? '89.4%' : '94.2%'}</p>
            <p className="text-xs text-emerald-600 flex items-center mt-2 font-medium">
              <BarChart3 size={14} className="mr-1"/> +1.2% from last month
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-[#10B981]">
            <p className="text-sm font-medium text-gray-500 mb-1">
              {isAdmin ? 'Total Classes Held' : 'My Classes Held'}
            </p>
            <p className="text-3xl font-bold text-gray-900">{isAdmin ? '248' : '42'}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              {isAdmin ? 'Across all subjects' : 'This semester'}
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-amber-500">
            <p className="text-sm font-medium text-gray-500 mb-1">Low Attendance Flags</p>
            <p className="text-3xl font-bold text-gray-900">{isAdmin ? '14' : '3'}</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Students below 75% threshold</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Automated Reports</h3>
            <Button variant="ghost" icon={Filter} className="text-sm">Filter</Button>
          </div>
          <div className="divide-y divide-gray-200">
            {reports.map((report, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{report.name}</p>
                    <p className="text-xs text-gray-500">{report.type} • Generated on {report.date}</p>
                  </div>
                </div>
                <button className="text-[#10B981] hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-colors">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

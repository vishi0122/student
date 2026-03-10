import { 
  Users, ShieldCheck, BookOpen, Bell, Clock, UserSquare, 
  BarChart3, Plus, Settings, QrCode, Camera, Calendar, FileText 
} from 'lucide-react';

export const getDashboardConfig = (user, navigate) => {
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';

  // College Admin Dashboard
  if (isAdmin && isCollege) {
    return {
      title: 'University Admin Dashboard',
      desc: 'Global overview of campus attendance, active lectures, and system health.',
      chartTitle: 'Campus Weekly Trends',
      stats: [
        { label: 'Campus Students', value: '12,405', trend: '+142 this semester', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Campus Attendance', value: '88.4%', trend: '+1.2% vs last week', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active Lectures', value: '145', trend: 'Live right now', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Proxy Alerts', value: '12', trend: 'Requires review', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
      ],
      actions: [
        { title: 'View Campus Reports', desc: 'Detailed Analytics', icon: BarChart3, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', onClick: () => navigate('/reports') },
        { title: 'Add New Student', desc: 'Admin Only', icon: Plus, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => navigate('/students') },
        { title: 'System Settings', desc: 'Manage Portal', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => {} },
      ]
    };
  }

  // College Faculty Dashboard
  if (!isAdmin && isCollege) {
    return {
      title: 'Professor Dashboard',
      desc: 'Overview of your lectures, student attendance, and active QR sessions.',
      chartTitle: 'My Lectures Weekly Trends',
      stats: [
        { label: 'My Students', value: '350', trend: 'Across 4 courses', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Attendance', value: '92.1%', trend: '+0.5% vs yesterday', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Lectures Today', value: '3', trend: 'Next in 15 mins', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Low Attendance', value: '15', trend: 'Students below 75%', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
      ],
      actions: [
        { title: 'Generate QR', desc: 'Start Lecture Attendance', icon: QrCode, color: 'text-[#10B981]', bg: 'bg-emerald-50', onClick: () => navigate('/attendance') },
        { title: 'Fallback Scan', desc: 'Manual Camera Scan', icon: Camera, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', onClick: () => navigate('/attendance') },
        { title: 'My Timetable', desc: 'View Schedule', icon: Calendar, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => navigate('/timetable') },
      ]
    };
  }

  // School Admin Dashboard
  if (isAdmin && !isCollege) {
    return {
      title: 'School Principal Dashboard',
      desc: 'Global overview of school-wide attendance, periods, and hardware status.',
      chartTitle: 'School Attendance Trends',
      stats: [
        { label: 'Total Enrolled', value: '1,200', trend: '+5 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'School Attendance', value: '95.8%', trend: '+0.2% vs yesterday', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active Classes', value: '40', trend: 'Period 3 ongoing', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Total Absentees', value: '45', trend: 'Today', icon: UserSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
      ],
      actions: [
        { title: 'View Daily Report', desc: 'School-wide analytics', icon: FileText, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', onClick: () => navigate('/reports') },
        { title: 'Add New Student', desc: 'Admin Only', icon: Plus, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => navigate('/students') },
        { title: 'Broadcast Alert', desc: 'Notify Parents/Staff', icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => {} },
      ]
    };
  }

  // School Faculty Dashboard
  return {
    title: 'Teacher Dashboard',
    desc: 'Overview of your assigned class strength and daily attendance.',
    chartTitle: 'Class Attendance Trends',
    stats: [
      { label: 'Class Strength', value: '45', trend: 'Section A', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: "Today's Attendance", value: '98.2%', trend: '1 Absent', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Periods Today', value: '6', trend: '2 remaining', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Pending Approvals', value: '2', trend: 'Leave requests', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
    ],
    actions: [
      { title: 'Start Face Scan', desc: 'Mark Class Attendance', icon: Camera, color: 'text-[#1E3A8A]', bg: 'bg-blue-50', onClick: () => navigate('/attendance') },
      { title: 'Class Timetable', desc: 'View Schedule', icon: Calendar, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => navigate('/timetable') },
      { title: 'Add Manual Entry', desc: 'Override Scanner', icon: UserSquare, color: 'text-gray-600', bg: 'bg-gray-100', onClick: () => navigate('/students') },
    ]
  };
};

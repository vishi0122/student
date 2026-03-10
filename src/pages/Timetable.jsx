import { useState } from 'react';
import { Plus, Calendar, Clock, Users, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TIMETABLE_601A, getLecturesByDay, getLecturesByTeacher } from '../data/timetable';

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCollege = user?.instType === 'college';
  const isFaculty = user?.role === 'faculty';
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Get real CU timetable data
  const cuTimetable = getLecturesByDay('601A', selectedDay).map((lecture, idx) => ({
    id: idx + 1,
    time: lecture.time,
    subject: lecture.subject,
    section: '601A',
    room: lecture.room,
    type: lecture.type,
    instructor: lecture.teacher
  }));

  // Faculty sees only their assigned lectures (example: Juned's schedule)
  const facultyTimetable = getLecturesByTeacher('Juned').map((lecture, idx) => ({
    id: idx + 1,
    time: lecture.time,
    subject: lecture.subject,
    section: '601A',
    room: lecture.room,
    type: lecture.type,
    instructor: 'You',
    day: lecture.day
  }));

  const schoolSchedule = [
    { id: 1, time: '08:00 AM - 08:45 AM', subject: 'Mathematics', section: 'A', room: 'Room 10-A', type: 'Period 1', teacher: 'Mrs. Sharma' },
    { id: 2, time: '08:45 AM - 09:30 AM', subject: 'Science', section: 'A', room: 'Lab 1', type: 'Period 2', teacher: 'Mr. Patel' },
    { id: 3, time: '09:45 AM - 10:30 AM', subject: 'English', section: 'A', room: 'Room 10-A', type: 'Period 3', teacher: 'Ms. Reddy' },
    { id: 4, time: '10:30 AM - 11:15 AM', subject: 'Social Studies', section: 'A', room: 'Room 10-A', type: 'Period 4', teacher: 'Mr. Kumar' },
    { id: 5, time: '12:00 PM - 12:45 PM', subject: 'Hindi', section: 'A', room: 'Room 10-A', type: 'Period 5', teacher: 'Mrs. Gupta' },
  ];

  const schedule = isCollege 
    ? (isFaculty ? facultyTimetable : cuTimetable)
    : schoolSchedule;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Timetable Management' : 'My Timetable'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin 
                ? 'View and edit daily campus schedules.' 
                : 'View your assigned classes for the week.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={Calendar}>Filter by Day</Button>
            {isAdmin && <Button icon={Plus}>Add Slot</Button>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Only show day selector for college admin and school users */}
          {!(isCollege && isFaculty) && (
            <Card className="p-2 h-fit">
              <div className="space-y-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDay(day)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedDay === day ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </Card>
          )}

          <div className={`${!(isCollege && isFaculty) ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4`}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isCollege && isFaculty ? 'Your Weekly Schedule' : `${selectedDay}'s Schedule`}
            </h2>
            {schedule.map((slot) => (
              <Card key={slot.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#1E3A8A]/30 transition-colors">
                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Clock size={20} />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{slot.time}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1E3A8A]">{slot.subject}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {isCollege && isFaculty && slot.day && (
                      <span className="font-medium text-gray-700">{slot.day}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={14}/> Sec {slot.section}
                    </span>
                    {slot.room && slot.room !== 'null' && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14}/> {slot.room}
                      </span>
                    )}
                    <span className="text-gray-600">
                      {isCollege ? slot.instructor : slot.teacher}
                    </span>
                    <Badge variant={slot.type === 'Lab' || slot.type.includes('Period') ? 'warning' : 'neutral'}>
                      {slot.type}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div>
                    <Button variant="outline" className="w-full sm:w-auto text-sm">
                      Edit
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;

// Utility to detect current lecture based on time, day, and section
import { getCurrentTimeSlot } from '../data/timeSlots';
import { getCurrentLecture } from '../data/timetable';

/**
 * Get the current lecture information based on current time and day
 * @param {string} section - Section code (e.g., '601A')
 * @returns {Object|null} Current lecture info or null if no lecture
 */
export const detectCurrentLecture = (section = '601A') => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  
  // Check if it's a weekday
  if (currentDay === 'Saturday' || currentDay === 'Sunday') {
    return null;
  }
  
  // Get current time slot
  const timeSlot = getCurrentTimeSlot();
  if (!timeSlot) {
    return null;
  }
  
  // Get lecture for current time slot and day
  const lecture = getCurrentLecture(section, currentDay, timeSlot.id);
  
  if (!lecture || lecture.type === 'Break') {
    return null;
  }
  
  return {
    subject: lecture.subject,
    teacher: lecture.teacher,
    room: lecture.room,
    type: lecture.type,
    time: lecture.time,
    day: currentDay,
    slot: timeSlot.id,
    section: `24BCS_KRG_${section}`
  };
};

/**
 * Get next lecture information
 * @param {string} section - Section code
 * @returns {Object|null} Next lecture info or null
 */
export const getNextLecture = (section = '601A') => {
  // This is a simplified version - can be enhanced
  const currentLecture = detectCurrentLecture(section);
  if (!currentLecture) {
    return null;
  }
  
  // Return next slot info (simplified)
  return {
    message: 'Next lecture detection coming soon'
  };
};

/**
 * Check if currently in a lecture period
 * @param {string} section - Section code
 * @returns {boolean} True if in lecture period
 */
export const isInLecturePeriod = (section = '601A') => {
  return detectCurrentLecture(section) !== null;
};

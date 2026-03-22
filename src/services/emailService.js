// EmailJS — free browser-based email sending (200 emails/month free)
// Setup: https://www.emailjs.com
// 1. Create account → Email Services → connect Gmail
// 2. Create Email Template with these variables:
//    {{to_email}}, {{to_name}}, {{student_name}}, {{subject}}, {{date}}, {{teacher}}, {{section}}
// 3. Copy Service ID, Template ID, Public Key into .env or constants below

import emailjs from '@emailjs/browser';

// ── Config — replace with your EmailJS credentials ──────────────────────────
// You can also put these in .env as VITE_EMAILJS_SERVICE_ID etc.
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_PUBLIC_KEY';

export const isEmailConfigured = () =>
  SERVICE_ID !== 'YOUR_SERVICE_ID' &&
  TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

// Send absence notification to a parent/student email
export const sendAbsenceNotification = async ({ studentName, toEmail, subject, date, teacher, section }) => {
  if (!isEmailConfigured()) {
    throw new Error('EmailJS not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to your .env file.');
  }

  const params = {
    to_email:     toEmail,
    to_name:      toEmail,          // EmailJS needs a name field
    student_name: studentName,
    subject_name: subject,          // class subject (not email subject)
    date,
    teacher,
    section,
  };

  const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY);
  return response;
};

// Send to multiple absent students — returns results array
export const sendBulkAbsenceNotifications = async (absentStudents, sessionInfo) => {
  const results = [];
  for (const student of absentStudents) {
    const email = student.parentEmail || student.email;
    if (!email) {
      results.push({ student: student.name, success: false, error: 'No email on file' });
      continue;
    }
    try {
      await sendAbsenceNotification({
        studentName: student.name,
        toEmail: email,
        subject: sessionInfo.subject,
        date: sessionInfo.date,
        teacher: sessionInfo.teacher,
        section: sessionInfo.section,
      });
      results.push({ student: student.name, success: true, email });
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      results.push({ student: student.name, success: false, error: err.message });
    }
  }
  return results;
};

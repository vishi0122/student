// Chandigarh University - Standard Time Slots
// All sections follow the same lecture timing

export const TIME_SLOTS = {
  1: { id: 1, start: '09:30', end: '10:20', label: '09:30 - 10:20' },
  2: { id: 2, start: '10:20', end: '11:10', label: '10:20 - 11:10' },
  3: { id: 3, start: '11:20', end: '12:10', label: '11:20 - 12:10' },
  4: { id: 4, start: '12:10', end: '13:00', label: '12:10 - 01:00' },
  5: { id: 5, start: '13:05', end: '13:55', label: '01:05 - 01:55' },
  6: { id: 6, start: '13:55', end: '14:45', label: '01:55 - 02:45' },
  7: { id: 7, start: '14:45', end: '15:35', label: '02:45 - 03:35' },
  8: { id: 8, start: '15:35', end: '16:25', label: '03:35 - 04:25' },
};

export const getTimeSlotByTime = (currentTime) => {
  // currentTime should be in format "HH:MM"
  const [hours, minutes] = currentTime.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  for (const slot of Object.values(TIME_SLOTS)) {
    const [startHours, startMinutes] = slot.start.split(':').map(Number);
    const [endHours, endMinutes] = slot.end.split(':').map(Number);
    
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    if (timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes) {
      return slot;
    }
  }
  return null;
};

export const getCurrentTimeSlot = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return getTimeSlotByTime(`${hours}:${minutes}`);
};

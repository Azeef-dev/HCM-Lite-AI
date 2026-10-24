// Working-day helpers used by Attendance, Leave and Payroll

export const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const isWeekend = (date, weekends = [0, 6]) => {
    return weekends.includes(new Date(date).getDay());
};

export const isHoliday = (date, holidays = []) => {
    const target = normalizeDate(date).getTime();
    return holidays.some((h) => normalizeDate(h.date).getTime() === target);
};

export const isWorkingDay = (date, weekends, holidays) => {
    return !isWeekend(date, weekends) && !isHoliday(date, holidays);
};

// Count working days between two dates, inclusive
export const countWorkingDays = (start, end, weekends, holidays) => {
    let count = 0;
    const cur = normalizeDate(start);
    const last = normalizeDate(end);
    while (cur <= last) {
        if (isWorkingDay(cur, weekends, holidays)) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
};

// All working days (as Date objects) in a given month
export const getWorkingDaysInMonth = (year, month, weekends, holidays) => {
    const days = [];
    const lastDay = new Date(year, month, 0).getDate(); // month is 1-indexed here
    for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month - 1, d);
        if (isWorkingDay(date, weekends, holidays)) days.push(date);
    }
    return days;
};

export const parseTimeString = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return { hours: h, minutes: m };
};

export const isLateCheckIn = (checkInDate, officeStartTime, graceMinutes) => {
    const { hours, minutes } = parseTimeString(officeStartTime);
    const thresholdMinutes = hours * 60 + minutes + graceMinutes;
    const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
    return checkInMinutes > thresholdMinutes;
};
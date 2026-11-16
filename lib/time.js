/** Clock helpers. Minutes are minutes from midnight, 0–1439. */

export function normalizeMinutes(minutes) {
  return ((Math.round(minutes) % 1440) + 1440) % 1440;
}

export function parseClock(input) {
  if (input == null) return null;
  const text = String(input).trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (!match) return null;
  const minute = match[2] ? Number(match[2]) : 0;
  if (minute > 59) return null;
  return applyMeridian(Number(match[1]), minute, match[3] || null, "none");
}

export function applyMeridian(hour, minute, meridian, context) {
  if (minute > 59 || minute < 0 || hour < 0) return null;
  if (meridian) {
    if (hour < 1 || hour > 12) return null;
    const pm = meridian.toLowerCase().startsWith("p");
    if (hour === 12) return (pm ? 12 : 0) * 60 + minute;
    return (pm ? hour + 12 : hour) * 60 + minute;
  }
  if (hour > 23) return null;
  if (context === "evening") {
    if (hour >= 1 && hour <= 11) return (hour + 12) * 60 + minute;
    if (hour === 12) return minute;
  }
  return hour * 60 + minute;
}

export function findClocks(text, context = "none") {
  const found = [];
  const re =
    /\b(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/gi;
  let match;
  const source = String(text);
  while ((match = re.exec(source))) {
    if (match[3]) {
      const hour = Number(match[1]);
      const minute = match[2] ? Number(match[2]) : 0;
      const value = applyMeridian(hour, minute, match[3], context);
      if (value != null) found.push(value);
    } else if (match[4] != null) {
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const value = applyMeridian(hour, minute, null, context);
      if (value != null) found.push(value);
    }
  }
  return found;
}

export function looseMorningHour(text) {
  const match = String(text)
    .trim()
    .match(/^(?:at\s+)?(\d{1,2})(?::00)?\s*(?:a\.?m\.?)?\.?$/i);
  if (!match) return null;
  const hour = Number(match[1]);
  if (hour < 4 || hour > 10) return null;
  return hour * 60;
}

export function isSchoolWake(minutes) {
  return minutes >= 4 * 60 && minutes <= 10 * 60 + 30;
}

export function formatClock(minutes) {
  const value = normalizeMinutes(minutes);
  const hour24 = Math.floor(value / 60);
  const minute = value % 60;
  const meridiem = hour24 >= 12 ? "p.m." : "a.m.";
  let hour = hour24 % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function toTimeInput(minutes) {
  if (minutes == null) return "";
  const value = normalizeMinutes(minutes);
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatDuration(hours) {
  const total = Math.round(Number(hours) * 60);
  const whole = Math.floor(Math.abs(total) / 60);
  const mins = Math.abs(total) % 60;
  const sign = total < 0 ? "−" : "";
  if (mins === 0) return `${sign}${whole} hour${whole === 1 ? "" : "s"}`;
  if (whole === 0) return `${sign}${mins} minute${mins === 1 ? "" : "s"}`;
  return `${sign}${whole} hour${whole === 1 ? "" : "s"} ${mins} minute${mins === 1 ? "" : "s"}`;
}

export function hoursBetween(startMinutes, endMinutes) {
  let diff = normalizeMinutes(endMinutes) - normalizeMinutes(startMinutes);
  if (diff <= 0) diff += 1440;
  return diff / 60;
}

/** Order a school-night clock so afternoon comes before the next morning. */
export function eveningOrder(minutes) {
  const shifted = normalizeMinutes(minutes) - 12 * 60;
  return shifted < 0 ? shifted + 1440 : shifted;
}

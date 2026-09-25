/**
 * Consultation booking calendar — shared by the slot picker (client) and the
 * booking action (server) so both agree on what is bookable.
 * All slots are in India Standard Time; Sundays are closed.
 */
export const BOOKING_TIMEZONE = "Asia/Kolkata";
export const BOOKING_TZ_LABEL = "IST";
export const BOOKING_DAYS_AHEAD = 14;

export const SLOT_GROUPS = [
  { label: "Morning", times: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"] },
  { label: "Afternoon", times: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"] },
  { label: "Evening", times: ["17:00", "17:30", "18:00", "18:30"] },
] as const;

const ALL_TIMES: readonly string[] = SLOT_GROUPS.flatMap((group) => group.times);

/** Today's calendar date in IST as a UTC-midnight Date. */
function todayInBookingZone(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
  return new Date(`${parts}T00:00:00Z`);
}

/** Next bookable dates (YYYY-MM-DD), starting tomorrow, skipping Sundays. */
export function upcomingBookingDates(now = new Date(), count = BOOKING_DAYS_AHEAD): string[] {
  const today = todayInBookingZone(now);
  const dates: string[] = [];
  for (let offset = 1; dates.length < count && offset < count * 2; offset += 1) {
    const day = new Date(today.getTime() + offset * 86_400_000);
    if (day.getUTCDay() !== 0) dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}

/** "14:30" → "2:30 PM". */
export function formatSlotTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Stored/displayed slot label, e.g. "2:30 PM IST". */
export function slotLabel(time: string): string {
  return `${formatSlotTime(time)} ${BOOKING_TZ_LABEL}`;
}

/** "2026-09-29" → { weekday: "Tue", day: "29", month: "Sep", long: "Tuesday, 29 September" }. */
export function describeDate(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...options }).format(value);
  return {
    weekday: format({ weekday: "short" }),
    day: format({ day: "numeric" }),
    month: format({ month: "short" }),
    long: format({ weekday: "long", day: "numeric", month: "long" }),
  };
}

export function slotKey(date: string, label: string): string {
  return `${date}|${label}`;
}

export function isBookableSlot(date: string, time: string, now = new Date()): boolean {
  return upcomingBookingDates(now).includes(date) && ALL_TIMES.includes(time);
}

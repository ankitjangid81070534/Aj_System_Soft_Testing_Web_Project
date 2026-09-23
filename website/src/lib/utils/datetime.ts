/**
 * The business runs on India time, but Server Components render on a UTC
 * host — without an explicit zone every admin timestamp was 5h30m behind.
 */
export const BUSINESS_TIME_ZONE = "Asia/Kolkata";

export function formatDateTime(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { timeZone: BUSINESS_TIME_ZONE, ...options });
}

/** Stored timestamp → `<input type="datetime-local">` value, shown in IST. */
export function toBusinessInputValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: BUSINESS_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** A zone-less `datetime-local` value means IST; anything with an offset is kept. */
export function fromBusinessInputValue(value: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)
    ? `${value.length === 16 ? `${value}:00` : value}+05:30`
    : value;
}

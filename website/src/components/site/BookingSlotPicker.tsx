"use client";

import { CalendarDays, Clock } from "lucide-react";
import {
  BOOKING_TZ_LABEL,
  SLOT_GROUPS,
  describeDate,
  formatSlotTime,
  slotKey,
  slotLabel,
} from "@/lib/booking/slots";
import styles from "./booking.module.css";

/**
 * Controlled date strip + time-slot grid. Selections travel to the server as
 * hidden `preferredDate` (YYYY-MM-DD) and `preferredTime` (HH:MM) fields.
 */
export function BookingSlotPicker({
  dates,
  taken,
  date,
  time,
  disabled,
  onDateChange,
  onTimeChange,
}: {
  dates: string[];
  taken: ReadonlySet<string>;
  date: string;
  time: string;
  disabled?: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}) {
  return (
    <div className={styles.picker}>
      <input type="hidden" name="preferredDate" value={date} />
      <input type="hidden" name="preferredTime" value={time} />

      <fieldset className={styles.step} disabled={disabled}>
        <legend className={styles.stepTitle}>
          <CalendarDays aria-hidden="true" size={16} /> Pick a date
        </legend>
        <div className={styles.dateStrip} role="radiogroup" aria-label="Available dates">
          {dates.map((value) => {
            const info = describeDate(value);
            const selected = value === date;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={info.long}
                data-selected={selected || undefined}
                className={styles.date}
                onClick={() => onDateChange(value)}
              >
                <span className={styles.dateWeekday}>{info.weekday}</span>
                <span className={styles.dateDay}>{info.day}</span>
                <span className={styles.dateMonth}>{info.month}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.step} disabled={disabled}>
        <legend className={styles.stepTitle}>
          <Clock aria-hidden="true" size={16} /> Pick a time{" "}
          <span className={styles.tz}>({BOOKING_TZ_LABEL})</span>
        </legend>
        {SLOT_GROUPS.map((group) => (
          <div key={group.label} className={styles.slotGroup}>
            <p className={styles.slotGroupLabel}>{group.label}</p>
            <div className={styles.slots} role="radiogroup" aria-label={`${group.label} slots`}>
              {group.times.map((value) => {
                const booked = taken.has(slotKey(date, slotLabel(value)));
                const selected = value === time;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={booked ? `${formatSlotTime(value)} — already booked` : formatSlotTime(value)}
                    disabled={booked}
                    data-selected={selected || undefined}
                    className={styles.slot}
                    onClick={() => onTimeChange(value)}
                  >
                    {formatSlotTime(value)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>
    </div>
  );
}

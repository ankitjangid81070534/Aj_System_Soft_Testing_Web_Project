-- Prevent two active bookings for the same date + time slot (race-safe).
-- Additive + idempotent. Lost/spam requests free the slot again.
-- If old duplicate rows already exist, the index is skipped with a notice
-- (no data is touched); resolve the duplicates and re-run this file.
do $$
begin
  create unique index if not exists ajsystemsoft_in_appointment_active_slot_uidx
    on public.appointment_requests (preferred_date, preferred_time)
    where preferred_date is not null
      and preferred_time is not null
      and status not in ('lost', 'spam');
exception when unique_violation then
  raise notice 'ajsystemsoft_in_appointment_active_slot_uidx skipped: duplicate active bookings exist';
end $$;

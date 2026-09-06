begin;

create index if not exists testimonials_submitted_by_created_idx
  on public.testimonials (submitted_by, created_at desc)
  where submitted_by is not null;

commit;

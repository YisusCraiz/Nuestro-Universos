begin;

-- Keep IDs 0–11 for classic stickers, 12–21 for Jesús and 22–31 for Julie.
alter table public.jj_live_chat
  drop constraint jj_live_chat_builtin_check,
  add constraint jj_live_chat_builtin_check check (builtin between 0 and 31);

commit;

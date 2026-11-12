begin;

alter table public.yuki_memory_topics add column reply_for_julie text
 check (reply_for_julie is null or length(btrim(reply_for_julie)) between 1 and 450);

create function public.yuki_set_topic_reply(p_memory uuid, p_reply text)
returns void language plpgsql security definer set search_path='' as $fn$
begin
 if not public.yuki_access() or not exists (
  select 1 from public.profiles where id=auth.uid() and handle='jesus'
 ) then raise exception 'NOT_ALLOWED'; end if;
 update public.yuki_memory_topics set reply_for_julie=nullif(btrim(p_reply),'')
 where owner_id=auth.uid() and memory_id=p_memory;
 if not found then raise exception 'TOPIC_NOT_FOUND'; end if;
end;
$fn$;

create function public.yuki_topic_reply_for_julie(p_viewer uuid, p_message text)
returns text language sql stable security definer set search_path='' as $fn$
 select t.reply_for_julie
 from public.yuki_memory_topics t
 join public.profiles owner on owner.id=t.owner_id and owner.handle='jesus'
 join public.profiles viewer on viewer.id=p_viewer and viewer.handle='julisa'
 join public.yuki_memories m on m.owner_id=t.owner_id and m.id=t.memory_id
 where m.visibility='private' and t.reply_for_julie is not null
 and strpos(' '||public.yuki_normalize_topic(left(p_message,2000))||' ',' '||t.topic||' ')>0
 order by length(t.topic) desc, m.approved_at desc, t.memory_id
 limit 1;
$fn$;

create table public.yuki_personal_questions (
 id uuid primary key default gen_random_uuid(),
 requester_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 question text not null check (length(btrim(question)) between 1 and 500),
 created_at timestamptz not null default now(),
 decided_at timestamptz,
 approved_reply text check (approved_reply is null or length(btrim(approved_reply)) between 1 and 500),
 check (approved_reply is null or decided_at is not null)
);

alter table public.yuki_personal_questions enable row level security;
revoke all on public.yuki_personal_questions from public,anon,authenticated;
grant select on public.yuki_personal_questions to authenticated;
create policy yuki_questions_participants on public.yuki_personal_questions
 for select to authenticated using (
 ((select auth.uid())=requester_id or (select auth.uid())=recipient_id) and (select public.yuki_access())
 );
create index yuki_questions_requester_idx on public.yuki_personal_questions(requester_id,created_at desc);
create index yuki_questions_recipient_idx on public.yuki_personal_questions(recipient_id,created_at desc);

create function public.yuki_ask_julie(p_question text)
returns void language plpgsql security definer set search_path='' as $fn$
begin
 if not public.yuki_access() then raise exception 'NOT_ALLOWED'; end if;
 insert into public.yuki_personal_questions(requester_id,recipient_id,question)
 select sender.id,recipient.id,btrim(p_question)
 from public.profiles sender cross join public.profiles recipient
 where sender.id=auth.uid() and sender.handle='jesus' and recipient.handle='julisa';
 if not found then raise exception 'NOT_ALLOWED'; end if;
end;
$fn$;

create function public.yuki_decide_personal_question(p_id uuid,p_reply text)
returns void language plpgsql security definer set search_path='' as $fn$
begin
 if not public.yuki_access() or (p_reply is not null and btrim(p_reply)='') then
  raise exception 'NOT_ALLOWED';
 end if;
 update public.yuki_personal_questions
 set decided_at=now(),approved_reply=btrim(p_reply)
 where id=p_id and recipient_id=auth.uid() and decided_at is null;
 if not found then raise exception 'QUESTION_UNAVAILABLE'; end if;
end;
$fn$;

revoke all on function public.yuki_set_topic_reply(uuid,text),public.yuki_ask_julie(text),
 public.yuki_decide_personal_question(uuid,text),public.yuki_topic_reply_for_julie(uuid,text)
 from public,anon,authenticated;
grant execute on function public.yuki_set_topic_reply(uuid,text),public.yuki_ask_julie(text),
 public.yuki_decide_personal_question(uuid,text) to authenticated;
grant execute on function public.yuki_topic_reply_for_julie(uuid,text) to service_role;

commit;

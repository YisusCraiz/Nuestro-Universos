begin;
alter table public.jj_inbox drop constraint jj_inbox_kind_check;
alter table public.jj_inbox add constraint jj_inbox_kind_check check(kind in ('online','offline','crown','music','memories','messages'));
create or replace function public.jj_content_inbox() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.kind not in ('music','memories','messages') then return new; end if;
 insert into public.jj_inbox(recipient,subject,kind,reference)
 select id,new.author_id,new.kind,new.id::text from public.profiles where id<>new.author_id
 on conflict(recipient,subject,kind,reference) do nothing;
 return new;
end $$;
revoke all on function public.jj_content_inbox() from public,anon,authenticated;
create trigger jj_content_inbox after insert on public.posts for each row execute function public.jj_content_inbox();
commit;

-- profiles: one row per Auth user, owner-only access.

create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 50)
);

alter table public.profiles enable row level security;

-- Least privilege: signed-in users may read and edit their own display name only.
-- Rows are created by the trigger below, so no INSERT/DELETE grant is needed.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create a profile whenever an Auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(split_part(coalesce(new.email, ''), '@', 1), 50));
  return new;
end;
$$;

-- The function is a trigger target only; it must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

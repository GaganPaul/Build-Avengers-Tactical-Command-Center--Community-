-- The browser talks only to FastAPI. Keep Supabase service-role credentials
-- on the server and remove the broad classroom-demo access from the supplied SQL.
drop policy if exists "classroom demo access" on public.heroes;
drop policy if exists "classroom demo access" on public.missions;
drop policy if exists "classroom demo access" on public.teams;
drop policy if exists "classroom demo access" on public.team_members;
drop policy if exists "classroom demo access" on public.mission_assignments;

grant usage on schema public to service_role;

revoke all on table
  public.heroes,
  public.missions,
  public.teams,
  public.team_members,
  public.mission_assignments
from anon, authenticated;
revoke all on table
  public.heroes,
  public.missions,
  public.teams,
  public.team_members,
  public.mission_assignments
from public;

grant select, insert, update, delete on
  public.heroes,
  public.missions,
  public.teams,
  public.team_members,
  public.mission_assignments
to service_role;

revoke execute on function public.create_team(text, uuid[]) from public, anon, authenticated;
revoke execute on function public.allocate_team(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.update_mission_status(uuid, text) from public, anon, authenticated;
grant execute on function public.create_team(text, uuid[]) to service_role;
grant execute on function public.allocate_team(uuid, uuid) to service_role;
grant execute on function public.update_mission_status(uuid, text) to service_role;

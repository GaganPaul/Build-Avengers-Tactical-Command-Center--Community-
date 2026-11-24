begin;

create table if not exists public.heroes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  real_name text not null,
  powers text[] not null default '{}',
  strength integer not null check (strength between 1 and 100),
  intelligence integer not null check (intelligence between 1 and 100),
  combat integer not null check (combat between 1 and 100),
  status text not null default 'Available'
    check (status in ('Available', 'Assigned'))
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  villain text not null,
  location text not null,
  threat_level text not null
    check (threat_level in ('Low', 'Medium', 'High', 'Critical')),
  description text not null default '',
  status text not null default 'Pending'
    check (status in ('Pending', 'In Progress', 'Completed'))
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  hero_id uuid not null references public.heroes(id) on delete restrict,
  constraint team_members_team_hero_unique unique (team_id, hero_id)
);

create table if not exists public.mission_assignments (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  constraint mission_assignments_mission_team_unique unique (mission_id, team_id)
);

insert into public.heroes (name, real_name, powers, strength, intelligence, combat)
values
  ('Iron Man', 'Tony Stark', array['Technology', 'Flight', 'Weapons'], 85, 100, 75),
  ('Captain America', 'Steve Rogers', array['Super Soldier', 'Shield'], 75, 75, 95),
  ('Thor', 'Thor Odinson', array['Lightning', 'Strength'], 100, 80, 95),
  ('Hulk', 'Bruce Banner', array['Super Strength', 'Durability'], 100, 85, 80),
  ('Black Widow', 'Natasha Romanoff', array['Espionage', 'Martial Arts'], 50, 85, 95),
  ('Hawkeye', 'Clint Barton', array['Archery', 'Precision'], 45, 80, 95)
on conflict (name) do update set
  real_name = excluded.real_name,
  powers = excluded.powers,
  strength = excluded.strength,
  intelligence = excluded.intelligence,
  combat = excluded.combat;

insert into public.missions (name, villain, location, threat_level, description)
values
  ('Operation Infinity', 'Thanos', 'New York', 'Critical', 'Respond to the threat posed by Thanos.'),
  ('Operation Ultron', 'Ultron', 'Washington, DC', 'High', 'Contain Ultron and protect the city.'),
  ('Operation Loki', 'Loki', 'New Mexico', 'Medium', 'Investigate and contain Loki.')
on conflict (name) do update set
  villain = excluded.villain,
  location = excluded.location,
  threat_level = excluded.threat_level,
  description = excluded.description;

alter table public.heroes enable row level security;
alter table public.missions enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.mission_assignments enable row level security;

create or replace function public.create_team(p_name text, p_hero_ids uuid[])
returns setof public.teams
language plpgsql
set search_path = ''
as $$
declare
  v_team_id uuid;
  v_hero_count integer;
  v_available_count integer;
begin
  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'Team name is required';
  end if;

  if p_hero_ids is null or cardinality(p_hero_ids) < 4 then
    raise exception 'A team must contain at least four heroes';
  end if;

  if cardinality(p_hero_ids) <> (
    select count(distinct selected.hero_id)
    from unnest(p_hero_ids) as selected(hero_id)
  ) then
    raise exception 'A team cannot contain duplicate heroes';
  end if;

  perform h.id
  from public.heroes as h
  where h.id = any(p_hero_ids)
  order by h.id
  for update;

  select count(*), count(*) filter (where h.status = 'Available')
  into v_hero_count, v_available_count
  from public.heroes as h
  where h.id = any(p_hero_ids);

  if v_hero_count <> cardinality(p_hero_ids) then
    raise exception 'One or more selected heroes do not exist';
  end if;

  if v_available_count <> cardinality(p_hero_ids) then
    raise exception 'All selected heroes must be Available';
  end if;

  insert into public.teams (team_name)
  values (btrim(p_name))
  returning id into v_team_id;

  insert into public.team_members (team_id, hero_id)
  select v_team_id, selected.hero_id
  from unnest(p_hero_ids) as selected(hero_id);

  return query select t.* from public.teams as t where t.id = v_team_id;
end;
$$;

create or replace function public.allocate_team(p_mission_id uuid, p_team_id uuid)
returns setof public.mission_assignments
language plpgsql
set search_path = ''
as $$
declare
  v_mission_status text;
  v_member_count integer;
  v_available_count integer;
  v_assignment_id uuid;
begin
  select m.status into v_mission_status
  from public.missions as m
  where m.id = p_mission_id
  for update;

  if not found then
    raise exception 'Mission not found';
  end if;
  if v_mission_status = 'Completed' then
    raise exception 'Cannot allocate a team to a completed mission';
  end if;

  if not exists (select 1 from public.teams as t where t.id = p_team_id) then
    raise exception 'Team not found';
  end if;

  if exists (
    select 1
    from public.mission_assignments as a
    where a.mission_id = p_mission_id and a.team_id = p_team_id
  ) then
    raise exception 'Team is already allocated to this mission';
  end if;

  select count(*) into v_member_count
  from public.team_members as tm
  where tm.team_id = p_team_id;

  if v_member_count < 4 then
    raise exception 'A team must contain at least four heroes';
  end if;

  perform h.id
  from public.heroes as h
  join public.team_members as tm on tm.hero_id = h.id
  where tm.team_id = p_team_id
  order by h.id
  for update of h;

  select count(*) filter (where h.status = 'Available')
  into v_available_count
  from public.heroes as h
  join public.team_members as tm on tm.hero_id = h.id
  where tm.team_id = p_team_id;

  if v_available_count <> v_member_count then
    raise exception 'All team heroes must be Available';
  end if;

  insert into public.mission_assignments (mission_id, team_id)
  values (p_mission_id, p_team_id)
  returning id into v_assignment_id;

  update public.heroes as h
  set status = 'Assigned'
  from public.team_members as tm
  where tm.team_id = p_team_id and tm.hero_id = h.id;

  update public.missions as m
  set status = 'In Progress'
  where m.id = p_mission_id and m.status = 'Pending';

  return query
  select a.* from public.mission_assignments as a where a.id = v_assignment_id;
end;
$$;

create or replace function public.update_mission_status(p_mission_id uuid, p_status text)
returns setof public.missions
language plpgsql
set search_path = ''
as $$
begin
  if p_status is null or p_status not in ('Pending', 'In Progress', 'Completed') then
    raise exception 'Invalid mission status: %', p_status;
  end if;

  perform m.id
  from public.missions as m
  where m.id = p_mission_id
  for update;

  if not found then
    raise exception 'Mission not found';
  end if;
  if p_status = 'In Progress' and not exists (
    select 1
    from public.mission_assignments as a
    where a.mission_id = p_mission_id
  ) then
    raise exception 'Deploy a team before starting this mission';
  end if;

  update public.missions as m
  set status = p_status
  where m.id = p_mission_id;

  if p_status <> 'In Progress' then
    update public.heroes as h
    set status = 'Available'
    where h.status = 'Assigned'
      and exists (
        select 1
        from public.mission_assignments as a
        join public.team_members as tm on tm.team_id = a.team_id
        where a.mission_id = p_mission_id and tm.hero_id = h.id
      )
      and not exists (
        select 1
        from public.mission_assignments as a
        join public.missions as m on m.id = a.mission_id
        join public.team_members as tm on tm.team_id = a.team_id
        where tm.hero_id = h.id
          and m.status = 'In Progress'
      );
  end if;

  return query select m.* from public.missions as m where m.id = p_mission_id;
end;
$$;

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
from public, anon, authenticated;
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

notify pgrst, 'reload schema';

commit;

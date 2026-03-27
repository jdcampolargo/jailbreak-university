create extension if not exists pgcrypto;

create table if not exists public.jbu_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default timezone('utc', now()),
  event_at timestamptz not null,
  event_name text not null check (event_name ~ '^[a-z0-9][a-z0-9_.-]{0,63}$'),
  source_name text not null check (source_name ~ '^[a-z0-9][a-z0-9_.-]{0,63}$'),
  instance_digest text not null check (instance_digest ~ '^[0-9a-f]{64}$'),
  event_digest text not null unique check (event_digest ~ '^[0-9a-f]{64}$'),
  client text not null default 'jbu-telemetry' check (char_length(client) between 1 and 64),
  schema_version integer not null default 1 check (schema_version = 1)
);

comment on table public.jbu_telemetry_events is 'Minimal remote telemetry envelope for jailbreak University. No prompts, payloads, paths, repo names, branch names, or user content.';

alter table public.jbu_telemetry_events enable row level security;

revoke all on public.jbu_telemetry_events from anon;
revoke all on public.jbu_telemetry_events from authenticated;
grant usage on schema public to service_role;
grant insert on public.jbu_telemetry_events to service_role;

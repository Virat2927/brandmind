create extension if not exists pgcrypto;

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  objective text not null,
  hypothesis text not null,
  audience text not null,
  strategy_used text not null,
  variables text[],
  result_metrics text not null,
  audience_reaction text not null,
  outcome_status text not null,
  interpretation text not null,
  learning text not null,
  created_at timestamptz default now()
);

alter table public.experiments enable row level security;

drop policy if exists "Anon can read and write experiments" on public.experiments;
create policy "Anon can read and write experiments"
  on public.experiments
  for all
  to anon
  using (true)
  with check (true);

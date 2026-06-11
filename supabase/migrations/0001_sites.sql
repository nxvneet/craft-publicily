-- Voxel — sites table + RLS. Apply once the `voxel` Supabase project exists.
create table if not exists public.sites (
  id          text primary key,
  owner       uuid references auth.users (id) on delete cascade,
  prompt      text,
  name        text,
  config      jsonb not null,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists sites_owner_idx on public.sites (owner);

alter table public.sites enable row level security;

-- Anyone can read a published site (so /s/[id] works for visitors).
create policy "public can read published sites"
  on public.sites for select
  using (published = true);

-- Owners can read all of their own sites (published or not).
create policy "owner can read own sites"
  on public.sites for select
  using (auth.uid() = owner);

-- Owners (incl. anonymous users) can create their own sites.
create policy "owner can insert sites"
  on public.sites for insert
  with check (auth.uid() = owner);

-- Owners can update / unpublish their own sites.
create policy "owner can update own sites"
  on public.sites for update
  using (auth.uid() = owner);

create policy "owner can delete own sites"
  on public.sites for delete
  using (auth.uid() = owner);

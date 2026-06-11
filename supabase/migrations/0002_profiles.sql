-- Voxel — per-user plan (set by the Stripe webhook via the service role).
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  plan               text not null default 'free',
  stripe_customer_id text,
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read their own plan. Writes happen only via the service role
-- (Stripe webhook), which bypasses RLS — so no insert/update policy is granted.
create policy "owner can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

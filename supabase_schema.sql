-- ==============================================================================
-- Rideshare_X: Supabase Database Schema & Row-Level Security (RLS) Policies
-- Enforces backend-level authorization locked to: prasadmhankraj21@gmail.com
-- ==============================================================================

-- 1. Create Profiles Table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text not null default 'passenger' check (role in ('admin', 'driver', 'passenger')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row-Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- Policy A: Anyone authenticated can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy B: Only the designated admin (prasadmhankraj21@gmail.com) has full admin access
create policy "Designated admin full control"
  on public.profiles for all
  using (
    auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com'
  );

-- 3. Automatic Profile Creation on User Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    -- STRICT RULE: Only prasadmhankraj21@gmail.com gets admin role!
    case 
      when lower(new.email) = 'prasadmhankraj21@gmail.com' then 'admin'
      else 'passenger'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Driver Verifications Table with Admin RLS
create table if not exists public.driver_verifications (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  vehicle_plate text not null,
  license_number text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'not_verified')),
  rejection_reason text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.driver_verifications enable row level security;

-- Driver can view their own verification status
create policy "Drivers can view own verification"
  on public.driver_verifications for select
  using (auth.uid() = driver_id);

-- ONLY designated admin can approve/reject verifications
create policy "Only designated admin can arbitrate verifications"
  on public.driver_verifications for all
  using (
    auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com'
  );

-- 5. Cancellation Deposit Escrow Table with Admin Arbitrage RLS
create table if not exists public.cancellation_escrows (
  id uuid default gen_random_uuid() primary key,
  ride_id text not null,
  driver_id uuid references public.profiles(id) not null,
  deposit_amount numeric not null,
  status text not null default 'pending_review' check (status in ('escrowed', 'pending_review', 'refunded', 'forfeited')),
  dispute_reason text,
  admin_decision text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cancellation_escrows enable row level security;

-- Only designated admin can resolve cancellation disputes
create policy "Only designated admin can arbitrate deposits"
  on public.cancellation_escrows for all
  using (
    auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com'
  );

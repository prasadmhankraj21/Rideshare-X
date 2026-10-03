-- ==============================================================================
-- Rideshare_X: Complete Supabase Database Schema & Row-Level Security (RLS)
-- Supports Real Supabase Auth + Database for Drivers, Passengers, Rides, Bookings
-- Designated Admin: prasadmhankraj21@gmail.com
-- ==============================================================================

-- 1. Create Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  phone text,
  city text,
  role text not null default 'passenger' check (role in ('admin', 'driver', 'passenger')),
  avatar_url text,
  verification_status text default 'not_verified' check (verification_status in ('not_verified', 'pending', 'verified', 'rejected')),
  rating numeric default 5.0,
  trips_completed integer default 0,
  vehicle jsonb default null,
  verification_doc jsonb default null,
  cancellation_deposit_balance numeric default 0,
  emergency_contact jsonb default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Policy A: Everyone can read profiles (needed for ride listings and driver/passenger details)
drop policy if exists "Profiles are viewable by all users" on public.profiles;
create policy "Profiles are viewable by all users"
  on public.profiles for select
  using (true);

-- Policy B: Authenticated users can insert their own profile
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy C: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy D: Designated Admin has full control
drop policy if exists "Designated admin full profile control" on public.profiles;
create policy "Designated admin full profile control"
  on public.profiles for all
  using (auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com');

-- 3. Automatic Profile Creation Trigger on Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_name text;
  user_phone text;
  user_city text;
  user_avatar text;
begin
  -- If designated admin email signs up, assign admin role
  if lower(new.email) = 'prasadmhankraj21@gmail.com' then
    user_role := 'admin';
  else
    user_role := coalesce(new.raw_user_meta_data->>'role', 'passenger');
  end if;

  user_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  user_phone := new.raw_user_meta_data->>'phone';
  user_city := new.raw_user_meta_data->>'city';
  user_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    city,
    role,
    avatar_url,
    verification_status
  ) values (
    new.id,
    new.email,
    user_name,
    user_phone,
    user_city,
    user_role,
    user_avatar,
    case when user_role = 'driver' then 'not_verified' else 'verified' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, profiles.phone),
    city = coalesce(excluded.city, profiles.city),
    role = excluded.role;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create Rides Table
create table if not exists public.rides (
  id text primary key,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  driver_name text not null,
  driver_avatar text,
  driver_rating numeric default 5.0,
  driver_verified boolean default false,
  from_location text not null,
  to_location text not null,
  from_coordinates jsonb default '[18.4088, 76.5604]'::jsonb,
  to_coordinates jsonb default '[18.5204, 73.8567]'::jsonb,
  date text not null,
  departure_time text not null,
  estimated_arrival_time text not null,
  estimated_duration text default '4h 30m',
  vehicle_type text not null default '5-Seater',
  vehicle_details text,
  total_seats integer not null default 5,
  available_seats integer not null default 2,
  total_passenger_seats_allowed integer not null default 2,
  shared_cost_per_seat numeric not null default 300,
  cost_breakdown jsonb default null,
  cancellation_deposit numeric not null default 250,
  deposit_status text not null default 'escrowed' check (deposit_status in ('escrowed', 'pending_review', 'refunded', 'forfeited')),
  pickup_drop_points jsonb default '[]'::jsonb,
  description text default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  route_optimized boolean default false,
  route_deviation_detected boolean default false,
  active_location jsonb default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Rides
alter table public.rides enable row level security;

-- All users (guests & authenticated) can view rides
drop policy if exists "Rides are viewable by everyone" on public.rides;
create policy "Rides are viewable by everyone"
  on public.rides for select
  using (true);

-- Drivers can create their own rides
drop policy if exists "Drivers can create their own rides" on public.rides;
create policy "Drivers can create their own rides"
  on public.rides for insert
  with check (auth.uid() = driver_id);

-- Drivers can update their own rides
drop policy if exists "Drivers can update their own rides" on public.rides;
create policy "Drivers can update their own rides"
  on public.rides for update
  using (auth.uid() = driver_id);

-- Designated admin has full control over all rides
drop policy if exists "Designated admin full ride control" on public.rides;
create policy "Designated admin full ride control"
  on public.rides for all
  using (auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com');

-- 5. Create Bookings Table
create table if not exists public.bookings (
  id text primary key,
  ride_id text references public.rides(id) on delete cascade not null,
  passenger_id uuid references public.profiles(id) on delete cascade not null,
  passenger_name text not null,
  passenger_phone text,
  passenger_avatar text,
  seats_requested integer not null default 1,
  from_location text not null,
  to_location text not null,
  pickup_point text,
  dropoff_point text,
  total_shared_contribution numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'completed', 'cancelled_by_passenger', 'cancelled_by_driver')),
  notes text,
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Bookings
alter table public.bookings enable row level security;

-- Passengers can view their own bookings, and Drivers can view bookings for their rides
drop policy if exists "Participants can view their bookings" on public.bookings;
create policy "Participants can view their bookings"
  on public.bookings for select
  using (
    auth.uid() = passenger_id
    or exists (
      select 1 from public.rides
      where public.rides.id = public.bookings.ride_id
      and public.rides.driver_id = auth.uid()
    )
    or auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com'
  );

-- Authenticated passengers can create bookings
drop policy if exists "Passengers can create bookings" on public.bookings;
create policy "Passengers can create bookings"
  on public.bookings for insert
  with check (auth.uid() = passenger_id);

-- Drivers can accept/reject; Passengers can cancel
drop policy if exists "Participants can update bookings" on public.bookings;
create policy "Participants can update bookings"
  on public.bookings for update
  using (
    auth.uid() = passenger_id
    or exists (
      select 1 from public.rides
      where public.rides.id = public.bookings.ride_id
      and public.rides.driver_id = auth.uid()
    )
    or auth.jwt() ->> 'email' = 'prasadmhankraj21@gmail.com'
  );

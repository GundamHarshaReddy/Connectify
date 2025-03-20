-- Services table
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  provider_id uuid references profiles(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration integer not null, -- in minutes
  is_active boolean default true
);

-- RLS policies for services
alter table services enable row level security;

create policy "Providers can manage their own services"
on services for all
using (auth.uid() = provider_id);

create policy "Anyone can view active services"
on services for select
using (is_active = true);

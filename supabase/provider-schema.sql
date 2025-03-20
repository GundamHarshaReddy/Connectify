-- Services table
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  provider_id uuid references profiles(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration integer not null,
  is_active boolean default true
);

-- Provider availability stored in providers table
alter table providers add column if not exists availability jsonb default '{"days": [], "hours": {"start": "09:00", "end": "17:00"}}'::jsonb;

-- RLS policies
alter table services enable row level security;

create policy "Providers can manage their own services"
on services for all
using (auth.uid() = provider_id);

create policy "Anyone can view active services"
on services for select
using (is_active = true);

-- Trigger to update services timestamps
create or replace function update_updated_at_services()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger services_updated_at
  before update on services
  for each row
  execute function update_updated_at_services();

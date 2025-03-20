-- Drop existing policies if they exist
drop policy if exists "Users can create their own profile" on profiles;
drop policy if exists "Users can view all profiles" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can delete their own profile" on profiles;

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Service role can manage all profiles"
on profiles for all
using (auth.role() = 'service_role');

create policy "Users can create their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can view all profiles"
on profiles for select
using (true);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "Users can delete own profile"
on profiles for delete
using (auth.uid() = id);

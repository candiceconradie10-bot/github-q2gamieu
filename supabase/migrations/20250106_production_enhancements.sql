-- Production enhancements migration
-- Creates wishlist, payment_methods, admin_activity tables and proper RLS policies

-- Create wishlist table
create table if not exists wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- Create payment methods table
create table if not exists payment_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- e.g. 'stripe', 'mock'
  provider_pm_id text not null, -- token/id from provider
  is_default boolean default false,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create admin activity table for audit logging
create table if not exists admin_activity (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id text,
  payload jsonb,
  created_at timestamptz default now()
);

-- Ensure products table has proper structure (if not already exists)
create table if not exists products (
  id serial primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text not null,
  rating decimal(2,1) default 0,
  reviews_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure profiles table has role field
alter table profiles add column if not exists role text default 'user';

-- Create storage bucket for product images if not exists
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Enable RLS on all tables
alter table wishlists enable row level security;
alter table payment_methods enable row level security;
alter table admin_activity enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "wishlists: users can manage their own" on wishlists;
drop policy if exists "payment_methods: users manage own" on payment_methods;
drop policy if exists "admin_activity: admin only" on admin_activity;
drop policy if exists "products: public read access" on products;
drop policy if exists "products: admin full access" on products;
drop policy if exists "profiles: users can view and update own profile" on profiles;
drop policy if exists "profiles: admin can view all profiles" on profiles;

-- Wishlist policies
create policy "wishlists: users can manage their own" on wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Payment methods policies
create policy "payment_methods: users manage own" on payment_methods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin activity policies - only admins can insert/select
create policy "admin_activity: admin only" on admin_activity
  for all using (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.is_admin = true)
  )) with check (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.is_admin = true)
  ));

-- Products policies - public read, admin write
create policy "products: public read access" on products
  for select using (true);

create policy "products: admin full access" on products
  for all using (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.is_admin = true)
  )) with check (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.is_admin = true)
  ));

-- Profiles policies
create policy "profiles: users can view and update own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles: admin can view all profiles" on profiles
  for select using (exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.is_admin = true)
  ));

-- Storage policies for product images
create policy "Product images: public read access" on storage.objects
  for select using (bucket_id = 'products');

create policy "Product images: admin upload access" on storage.objects
  for insert with check (
    bucket_id = 'products' 
    and exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and (p.role = 'admin' or p.is_admin = true)
    )
  );

create policy "Product images: admin update access" on storage.objects
  for update using (
    bucket_id = 'products' 
    and exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and (p.role = 'admin' or p.is_admin = true)
    )
  );

create policy "Product images: admin delete access" on storage.objects
  for delete using (
    bucket_id = 'products' 
    and exists (
      select 1 from profiles p 
      where p.id = auth.uid() 
      and (p.role = 'admin' or p.is_admin = true)
    )
  );

-- Create indexes for better performance
create index if not exists wishlists_user_id_idx on wishlists (user_id);
create index if not exists wishlists_product_id_idx on wishlists (product_id);
create index if not exists payment_methods_user_id_idx on payment_methods (user_id);
create index if not exists admin_activity_admin_id_idx on admin_activity (admin_id);
create index if not exists admin_activity_created_at_idx on admin_activity (created_at desc);
create index if not exists products_category_idx on products (category);
create index if not exists products_is_active_idx on products (is_active);

-- Update trigger for products updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_products_updated_at on products;
create trigger update_products_updated_at
  before update on products
  for each row
  execute function update_updated_at_column();
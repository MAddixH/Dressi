-- Dressi Phase 2 creator platform schema.
-- Monetization, payouts, earnings, and analytics are intentionally excluded.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  account_type text not null default 'shopper' check (account_type in ('shopper', 'creator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  bio text not null default '',
  location text,
  cover_url text,
  style_categories text[] not null default '{}',
  social_links jsonb not null default '{}',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, creator_id)
);

create table if not exists public.creator_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  title text not null,
  caption text not null default '',
  media_type text not null check (media_type in ('photo', 'video', 'carousel')),
  style_tags text[] not null default '{}',
  occasion text,
  season text,
  gender_category text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order integer not null default 0 check (sort_order >= 0),
  alt_text text,
  created_at timestamptz not null default now(),
  unique (post_id, sort_order)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  brand text not null,
  product_name text not null,
  category text not null,
  color text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  retailer text not null,
  product_url text,
  inventory_status text not null default 'in_stock',
  sizes_available text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_post_products (
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  category text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  tag_position jsonb,
  created_at timestamptz not null default now(),
  primary key (post_id, product_id)
);

create table if not exists public.creator_closet_items (
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  is_favorite boolean not null default false,
  times_worn integer not null default 0 check (times_worn >= 0),
  created_at timestamptz not null default now(),
  primary key (creator_id, product_id)
);

create table if not exists public.creator_collections (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  name text not null,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_collection_posts (
  collection_id uuid not null references public.creator_collections(id) on delete cascade,
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, post_id)
);

create table if not exists public.saved_creator_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists creator_posts_creator_created_idx on public.creator_posts (creator_id, created_at desc);
create index if not exists creator_posts_style_tags_idx on public.creator_posts using gin (style_tags);
create index if not exists creator_profiles_styles_idx on public.creator_profiles using gin (style_categories);
create index if not exists creator_follows_creator_idx on public.creator_follows (creator_id);
create index if not exists creator_post_products_sort_idx on public.creator_post_products (post_id, sort_order);

alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.creator_follows enable row level security;
alter table public.creator_posts enable row level security;
alter table public.creator_post_media enable row level security;
alter table public.products enable row level security;
alter table public.creator_post_products enable row level security;
alter table public.creator_closet_items enable row level security;
alter table public.creator_collections enable row level security;
alter table public.creator_collection_posts enable row level security;
alter table public.saved_creator_posts enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (true);
create policy "Users create their profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Creator profiles are readable" on public.creator_profiles for select using (true);
create policy "Creators manage their profile" on public.creator_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Follows are readable" on public.creator_follows for select using (true);
create policy "Users manage their follows" on public.creator_follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "Published creator posts are readable" on public.creator_posts for select using (status = 'published' or creator_id in (select id from public.creator_profiles where user_id = auth.uid()));
create policy "Creators manage their posts" on public.creator_posts for all using (creator_id in (select id from public.creator_profiles where user_id = auth.uid())) with check (creator_id in (select id from public.creator_profiles where user_id = auth.uid()));
create policy "Published post media is readable" on public.creator_post_media for select using (post_id in (select id from public.creator_posts where status = 'published'));
create policy "Creators manage post media" on public.creator_post_media for all using (post_id in (select cp.id from public.creator_posts cp join public.creator_profiles cr on cr.id = cp.creator_id where cr.user_id = auth.uid())) with check (post_id in (select cp.id from public.creator_posts cp join public.creator_profiles cr on cr.id = cp.creator_id where cr.user_id = auth.uid()));
create policy "Products are readable" on public.products for select using (true);
create policy "Creators add products" on public.products for insert with check (auth.uid() = created_by and exists (select 1 from public.creator_profiles where user_id = auth.uid()));
create policy "Creators update their products" on public.products for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "Creators delete their products" on public.products for delete using (auth.uid() = created_by);
create policy "Post products are readable" on public.creator_post_products for select using (true);
create policy "Creators manage post products" on public.creator_post_products for all using (post_id in (select cp.id from public.creator_posts cp join public.creator_profiles cr on cr.id = cp.creator_id where cr.user_id = auth.uid())) with check (post_id in (select cp.id from public.creator_posts cp join public.creator_profiles cr on cr.id = cp.creator_id where cr.user_id = auth.uid()));
create policy "Closet items are readable" on public.creator_closet_items for select using (true);
create policy "Creators manage closet items" on public.creator_closet_items for all using (creator_id in (select id from public.creator_profiles where user_id = auth.uid())) with check (creator_id in (select id from public.creator_profiles where user_id = auth.uid()));
create policy "Collections are readable" on public.creator_collections for select using (true);
create policy "Creators manage collections" on public.creator_collections for all using (creator_id in (select id from public.creator_profiles where user_id = auth.uid())) with check (creator_id in (select id from public.creator_profiles where user_id = auth.uid()));
create policy "Collection posts are readable" on public.creator_collection_posts for select using (true);
create policy "Creators manage collection posts" on public.creator_collection_posts for all using (collection_id in (select cc.id from public.creator_collections cc join public.creator_profiles cr on cr.id = cc.creator_id where cr.user_id = auth.uid())) with check (collection_id in (select cc.id from public.creator_collections cc join public.creator_profiles cr on cr.id = cc.creator_id where cr.user_id = auth.uid()));
create policy "Users read their saved posts" on public.saved_creator_posts for select using (auth.uid() = user_id);
create policy "Users manage their saved posts" on public.saved_creator_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

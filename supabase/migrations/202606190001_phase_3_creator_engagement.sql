-- Dressi Phase 3 creator engagement and analytics foundation.
-- Financial metrics are intentionally excluded until checkout attribution has a product plan.

create table if not exists public.creator_analytics (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  date date not null,
  profile_views integer not null default 0 check (profile_views >= 0),
  outfit_views integer not null default 0 check (outfit_views >= 0),
  post_views integer not null default 0 check (post_views >= 0),
  saves integer not null default 0 check (saves >= 0),
  product_clicks integer not null default 0 check (product_clicks >= 0),
  follows integer not null default 0 check (follows >= 0),
  unfollows integer not null default 0 check (unfollows >= 0),
  shares integer not null default 0 check (shares >= 0),
  comments integer not null default 0 check (comments >= 0),
  collection_follows integer not null default 0 check (collection_follows >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, date)
);

create table if not exists public.creator_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.creator_posts(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  event_type text not null check (event_type in ('profile_view', 'post_view', 'save', 'product_click', 'follow', 'unfollow', 'share', 'comment', 'collection_follow', 'collection_unfollow')),
  session_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  comment text not null check (char_length(comment) between 1 and 2000),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.creator_posts(id) on delete cascade,
  type text not null check (type in ('follow', 'save', 'comment', 'milestone', 'collection')),
  title text not null,
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.creator_collection_follows (
  collection_id uuid not null references public.creator_collections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, user_id)
);

create index if not exists creator_analytics_creator_date_idx on public.creator_analytics (creator_id, date desc);
create index if not exists creator_events_creator_created_idx on public.creator_events (creator_id, created_at desc);
create index if not exists creator_events_post_type_idx on public.creator_events (post_id, event_type, created_at desc);
create index if not exists creator_events_product_type_idx on public.creator_events (product_id, event_type, created_at desc);
create index if not exists comments_post_created_idx on public.comments (post_id, created_at desc);
create index if not exists comments_parent_idx on public.comments (parent_comment_id);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id, read) where read = false;
create index if not exists collection_follows_collection_idx on public.creator_collection_follows (collection_id);

alter table public.creator_analytics enable row level security;
alter table public.creator_events enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.creator_collection_follows enable row level security;

create policy "Creators read their analytics"
  on public.creator_analytics for select
  using (creator_id in (select id from public.creator_profiles where user_id = auth.uid()));

create policy "Creators read their engagement events"
  on public.creator_events for select
  using (creator_id in (select id from public.creator_profiles where user_id = auth.uid()));

create policy "Visitors record creator engagement"
  on public.creator_events for insert
  with check (viewer_id is null or viewer_id = auth.uid());

create policy "Comments are publicly readable"
  on public.comments for select
  using (true);

create policy "Authenticated users create comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Authors and creators update comments"
  on public.comments for update to authenticated
  using (
    auth.uid() = user_id
    or post_id in (
      select cp.id from public.creator_posts cp
      join public.creator_profiles cr on cr.id = cp.creator_id
      where cr.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or post_id in (
      select cp.id from public.creator_posts cp
      join public.creator_profiles cr on cr.id = cp.creator_id
      where cr.user_id = auth.uid()
    )
  );

create policy "Authors and creators delete comments"
  on public.comments for delete to authenticated
  using (
    auth.uid() = user_id
    or post_id in (
      select cp.id from public.creator_posts cp
      join public.creator_profiles cr on cr.id = cp.creator_id
      where cr.user_id = auth.uid()
    )
  );

create policy "Comment likes are publicly readable"
  on public.comment_likes for select
  using (true);

create policy "Users manage their comment likes"
  on public.comment_likes for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read their notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "Users mark their notifications read"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Collection follows are publicly readable"
  on public.creator_collection_follows for select
  using (true);

create policy "Users manage collection follows"
  on public.creator_collection_follows for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.notify_creator_follow()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, actor_id, type, title, message)
  select creator.user_id, new.follower_id, 'follow', 'New follower', 'Someone new is following your creator account.'
  from public.creator_profiles creator
  where creator.id = new.creator_id and creator.user_id <> new.follower_id;
  return new;
end;
$$;

create or replace function public.notify_creator_save()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  creator_user_id uuid;
  post_title text;
  save_count integer;
begin
  select creator.user_id, post.title
  into creator_user_id, post_title
  from public.creator_posts post
  join public.creator_profiles creator on creator.id = post.creator_id
  where post.id = new.post_id;

  if creator_user_id is not null and creator_user_id <> new.user_id then
    insert into public.notifications (user_id, actor_id, post_id, type, title, message)
    values (creator_user_id, new.user_id, new.post_id, 'save', 'Outfit saved', post_title || ' was saved.');
  end if;

  select count(*) into save_count from public.saved_creator_posts where post_id = new.post_id;
  if creator_user_id is not null and save_count > 0 and save_count % 100 = 0 then
    insert into public.notifications (user_id, post_id, type, title, message)
    values (creator_user_id, new.post_id, 'milestone', 'Save milestone', post_title || ' reached ' || save_count || ' saves.');
  end if;
  return new;
end;
$$;

create or replace function public.notify_creator_comment()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, actor_id, post_id, type, title, message)
  select creator.user_id, new.user_id, new.post_id, 'comment', 'New comment', left(new.comment, 140)
  from public.creator_posts post
  join public.creator_profiles creator on creator.id = post.creator_id
  where post.id = new.post_id and creator.user_id <> new.user_id;
  return new;
end;
$$;

create or replace function public.notify_collection_follow()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, actor_id, type, title, message)
  select creator.user_id, new.user_id, 'collection', 'Collection followed', collection.name || ' has a new follower.'
  from public.creator_collections collection
  join public.creator_profiles creator on creator.id = collection.creator_id
  where collection.id = new.collection_id and creator.user_id <> new.user_id;
  return new;
end;
$$;

drop trigger if exists on_creator_followed_notify on public.creator_follows;
create trigger on_creator_followed_notify after insert on public.creator_follows
  for each row execute procedure public.notify_creator_follow();

drop trigger if exists on_creator_post_saved_notify on public.saved_creator_posts;
create trigger on_creator_post_saved_notify after insert on public.saved_creator_posts
  for each row execute procedure public.notify_creator_save();

drop trigger if exists on_creator_comment_notify on public.comments;
create trigger on_creator_comment_notify after insert on public.comments
  for each row execute procedure public.notify_creator_comment();

drop trigger if exists on_collection_followed_notify on public.creator_collection_follows;
create trigger on_collection_followed_notify after insert on public.creator_collection_follows
  for each row execute procedure public.notify_collection_follow();

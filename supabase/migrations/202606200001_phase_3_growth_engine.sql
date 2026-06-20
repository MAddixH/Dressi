-- Dressi Phase 3 growth engine: reliable creator rollups plus platform usage,
-- retention, session, search, and style-demand analytics.

alter table public.creator_events add column if not exists event_value numeric(12,2) not null default 0 check (event_value >= 0);
alter table public.creator_events drop constraint if exists creator_events_event_type_check;
alter table public.creator_events add constraint creator_events_event_type_check
  check (event_type in ('profile_view', 'post_view', 'save', 'product_click', 'follow', 'unfollow', 'share', 'comment', 'collection_follow', 'collection_unfollow', 'purchase'));

alter table public.creator_analytics add column if not exists purchases integer not null default 0 check (purchases >= 0);
alter table public.creator_analytics add column if not exists estimated_earnings numeric(12,2) not null default 0 check (estimated_earnings >= 0);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('follow', 'save', 'comment', 'milestone', 'collection', 'purchase'));

create table if not exists public.creator_post_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.creator_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.liked_outfit_references (
  user_id uuid not null references public.profiles(id) on delete cascade,
  outfit_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, outfit_key)
);

create index if not exists creator_post_likes_post_idx on public.creator_post_likes (post_id);
create index if not exists liked_outfit_references_outfit_idx on public.liked_outfit_references (outfit_key);

alter table public.creator_post_likes enable row level security;
alter table public.liked_outfit_references enable row level security;

create policy "Users manage their post likes" on public.creator_post_likes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their outfit likes" on public.liked_outfit_references for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.get_creator_post_engagement()
returns table (post_id uuid, likes bigint, saves bigint, comments bigint)
language sql
stable
security definer set search_path = ''
as $$
  select
    cp.id as post_id,
    (select count(*) from public.creator_post_likes pl where pl.post_id = cp.id) as likes,
    (select count(*) from public.saved_creator_posts sp where sp.post_id = cp.id) as saves,
    (select count(*) from public.comments c where c.post_id = cp.id) as comments
  from public.creator_posts cp
  where cp.status = 'published';
$$;

revoke all on function public.get_creator_post_engagement() from public;
grant execute on function public.get_creator_post_engagement() to anon, authenticated;

create table if not exists public.platform_sessions (
  id uuid primary key default gen_random_uuid(),
  session_key text not null unique,
  visitor_key text not null,
  user_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (last_seen_at >= started_at)
);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  session_key text not null references public.platform_sessions(session_key) on delete cascade,
  visitor_key text not null,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('page_view', 'search', 'style_view', 'style_save')),
  route text,
  entity_id text,
  style text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists platform_sessions_visitor_started_idx on public.platform_sessions (visitor_key, started_at desc);
create index if not exists platform_sessions_started_idx on public.platform_sessions (started_at desc);
create index if not exists platform_events_created_idx on public.platform_events (created_at desc);
create index if not exists platform_events_type_created_idx on public.platform_events (event_type, created_at desc);
create index if not exists platform_events_style_created_idx on public.platform_events (style, created_at desc) where style is not null;

alter table public.platform_sessions enable row level security;
alter table public.platform_events enable row level security;

-- Raw platform analytics remain private. Clients write and read aggregates through
-- narrow security-definer functions below.

create or replace function public.rollup_creator_event()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.creator_analytics (
    creator_id, date, profile_views, outfit_views, post_views, saves,
    product_clicks, follows, unfollows, shares, comments, collection_follows,
    purchases, estimated_earnings
  ) values (
    new.creator_id,
    (new.created_at at time zone 'utc')::date,
    case when new.event_type = 'profile_view' then 1 else 0 end,
    case when new.event_type = 'post_view' then 1 else 0 end,
    case when new.event_type = 'post_view' then 1 else 0 end,
    case when new.event_type = 'save' then 1 else 0 end,
    case when new.event_type = 'product_click' then 1 else 0 end,
    case when new.event_type = 'follow' then 1 else 0 end,
    case when new.event_type = 'unfollow' then 1 else 0 end,
    case when new.event_type = 'share' then 1 else 0 end,
    case when new.event_type = 'comment' then 1 else 0 end,
    case when new.event_type = 'collection_follow' then 1 else 0 end,
    case when new.event_type = 'purchase' then 1 else 0 end,
    case when new.event_type = 'purchase' then new.event_value else 0 end
  )
  on conflict (creator_id, date) do update set
    profile_views = public.creator_analytics.profile_views + excluded.profile_views,
    outfit_views = public.creator_analytics.outfit_views + excluded.outfit_views,
    post_views = public.creator_analytics.post_views + excluded.post_views,
    saves = public.creator_analytics.saves + excluded.saves,
    product_clicks = public.creator_analytics.product_clicks + excluded.product_clicks,
    follows = public.creator_analytics.follows + excluded.follows,
    unfollows = public.creator_analytics.unfollows + excluded.unfollows,
    shares = public.creator_analytics.shares + excluded.shares,
    comments = public.creator_analytics.comments + excluded.comments,
    collection_follows = public.creator_analytics.collection_follows + excluded.collection_follows,
    purchases = public.creator_analytics.purchases + excluded.purchases,
    estimated_earnings = public.creator_analytics.estimated_earnings + excluded.estimated_earnings,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_creator_event_rollup on public.creator_events;
create trigger on_creator_event_rollup
  after insert on public.creator_events
  for each row execute procedure public.rollup_creator_event();

create or replace function public.notify_creator_purchase()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.event_type = 'purchase' then
    insert into public.notifications (user_id, actor_id, post_id, type, title, message)
    select cp.user_id, new.viewer_id, new.post_id, 'purchase', 'New attributed purchase',
      'Estimated earnings: $' || to_char(new.event_value, 'FM999999990.00')
    from public.creator_profiles cp where cp.id = new.creator_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_creator_purchase_notify on public.creator_events;
create trigger on_creator_purchase_notify
  after insert on public.creator_events
  for each row execute procedure public.notify_creator_purchase();

create or replace function public.track_platform_event(
  p_session_key text,
  p_visitor_key text,
  p_event_type text,
  p_user_id uuid default null,
  p_route text default null,
  p_entity_id text default null,
  p_style text default null,
  p_metadata jsonb default '{}'
)
returns boolean
language plpgsql
security definer set search_path = ''
as $$
declare
  resolved_user uuid;
begin
  if p_event_type not in ('page_view', 'search', 'style_view', 'style_save') then
    raise exception 'Unsupported platform event type';
  end if;
  if char_length(p_session_key) > 100 or char_length(p_visitor_key) > 100 then
    raise exception 'Invalid analytics identity';
  end if;

  resolved_user := auth.uid();
  if p_user_id is not null and p_user_id is distinct from resolved_user then
    raise exception 'Analytics user does not match authenticated user';
  end if;

  insert into public.platform_sessions (session_key, visitor_key, user_id)
  values (p_session_key, p_visitor_key, resolved_user)
  on conflict (session_key) do update set
    user_id = coalesce(public.platform_sessions.user_id, excluded.user_id),
    last_seen_at = greatest(public.platform_sessions.last_seen_at, now());

  insert into public.platform_events (
    session_key, visitor_key, user_id, event_type, route, entity_id, style, metadata
  ) values (
    p_session_key, p_visitor_key, resolved_user, p_event_type,
    left(p_route, 100), left(p_entity_id, 160), left(p_style, 120), coalesce(p_metadata, '{}')
  );
  return true;
end;
$$;

create or replace function public.get_platform_analytics(
  p_start_date date default null,
  p_end_date date default null
)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
  with bounds as (
    select
      coalesce(p_start_date, current_date - 29) as start_date,
      coalesce(p_end_date, current_date) as end_date
  ),
  filtered as (
    select pe.*
    from public.platform_events pe, bounds b
    where pe.created_at >= b.start_date::timestamptz
      and pe.created_at < (b.end_date + 1)::timestamptz
  ),
  days as (
    select generate_series(b.start_date, b.end_date, interval '1 day')::date as day
    from bounds b
  ),
  daily as (
    select d.day, count(distinct f.visitor_key)::integer as users
    from days d
    left join filtered f on f.created_at >= d.day::timestamptz and f.created_at < (d.day + 1)::timestamptz
    group by d.day
    order by d.day
  ),
  previous_week as (
    select distinct pe.visitor_key
    from public.platform_events pe, bounds b
    where pe.created_at >= (b.end_date - 13)::timestamptz
      and pe.created_at < (b.end_date - 6)::timestamptz
  ),
  returning_week as (
    select distinct pe.visitor_key
    from public.platform_events pe, bounds b
    where pe.created_at >= (b.end_date - 6)::timestamptz
      and pe.created_at < (b.end_date + 1)::timestamptz
  ),
  viewed as (
    select coalesce(nullif(trim(style), ''), 'Uncategorized') as label, count(*)::integer as count
    from filtered where event_type in ('style_view', 'page_view') and style is not null
    group by 1 order by 2 desc limit 5
  ),
  searched as (
    select coalesce(nullif(trim(style), ''), 'Uncategorized') as label, count(*)::integer as count
    from filtered where event_type = 'search' and style is not null
    group by 1 order by 2 desc limit 5
  ),
  saved as (
    select coalesce(nullif(trim(style), ''), 'Uncategorized') as label, count(*)::integer as count
    from filtered where event_type = 'style_save' and style is not null
    group by 1 order by 2 desc limit 5
  )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'daily_users', (select count(distinct visitor_key) from public.platform_events, bounds where created_at >= bounds.end_date::timestamptz and created_at < (bounds.end_date + 1)::timestamptz),
      'weekly_users', (select count(distinct visitor_key) from public.platform_events, bounds where created_at >= (bounds.end_date - 6)::timestamptz and created_at < (bounds.end_date + 1)::timestamptz),
      'monthly_users', (select count(distinct visitor_key) from public.platform_events, bounds where created_at >= (bounds.end_date - 29)::timestamptz and created_at < (bounds.end_date + 1)::timestamptz),
      'retention_rate', coalesce((select round(100.0 * count(*) filter (where rw.visitor_key is not null) / nullif(count(*), 0), 1) from previous_week pw left join returning_week rw using (visitor_key)), 0),
      'average_session_minutes', coalesce((select round(avg(extract(epoch from (last_seen_at - started_at))) / 60.0, 1) from public.platform_sessions, bounds where started_at >= bounds.start_date::timestamptz and started_at < (bounds.end_date + 1)::timestamptz), 0),
      'searches', (select count(*) from filtered where event_type = 'search')
    ),
    'activity', coalesce((select jsonb_agg(jsonb_build_object('date', to_char(day, 'Mon DD'), 'users', users) order by day) from daily), '[]'::jsonb),
    'viewed_styles', coalesce((select jsonb_agg(to_jsonb(viewed) order by count desc) from viewed), '[]'::jsonb),
    'searched_styles', coalesce((select jsonb_agg(to_jsonb(searched) order by count desc) from searched), '[]'::jsonb),
    'saved_styles', coalesce((select jsonb_agg(to_jsonb(saved) order by count desc) from saved), '[]'::jsonb)
  );
$$;

revoke all on function public.track_platform_event(text, text, text, uuid, text, text, text, jsonb) from public;
grant execute on function public.track_platform_event(text, text, text, uuid, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.get_platform_analytics(date, date) from public;
grant execute on function public.get_platform_analytics(date, date) to authenticated;

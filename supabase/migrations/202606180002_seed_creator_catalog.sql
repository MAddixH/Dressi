-- Persist the curated Dressi creator catalog so follows and saves use real IDs.
-- Editorial creators have no auth user and remain read-only under the existing RLS policies.

alter table public.creator_profiles alter column user_id drop not null;
alter table public.creator_profiles add column if not exists display_name text;
alter table public.creator_profiles add column if not exists avatar_url text;

update public.creator_profiles as creator
set
  display_name = coalesce(creator.display_name, profile.display_name),
  avatar_url = coalesce(creator.avatar_url, profile.avatar_url)
from public.profiles as profile
where creator.user_id = profile.id;

insert into public.creator_profiles (
  id, user_id, username, display_name, avatar_url, bio, location, cover_url,
  style_categories, social_links, is_verified
) values
  (
    '11111111-1111-4111-8111-111111111111', null, 'oldmoneyjake', 'Jake Morrison',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    'Helping guys build a timeless wardrobe, one considered layer at a time.', 'New York, NY',
    '/assets/old-money-fit.png', array['Old Money', 'Business Casual', 'Luxury'],
    '{"instagram":"@oldmoneyjake","website":"oldmoneyedit.com"}'::jsonb, true
  ),
  (
    '22222222-2222-4222-8222-222222222222', null, 'mayalayers', 'Maya Brooks',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85',
    'Minimal layers, strong silhouettes, and a soft spot for an excellent coat.', 'London, UK',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    array['Minimalist', 'Clean Girl', 'Workwear'], '{"instagram":"@mayalayers"}'::jsonb, true
  ),
  (
    '33333333-3333-4333-8333-333333333333', null, 'noahafterdark', 'Noah Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    'Streetwear, rare sneakers, and practical fits for nights in the city.', 'Los Angeles, CA',
    'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85',
    array['Streetwear', 'Y2K', 'Techwear'], '{"instagram":"@noahafterdark","website":"noahafterdark.com"}'::jsonb, false
  ),
  (
    '44444444-4444-4444-8444-444444444444', null, 'sofiacoast', 'Sofia Reyes',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    'Resort tailoring, warm-weather color, and a suitcase that is always half packed.', 'Miami, FL',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85',
    array['Vacation', 'Resort', 'Date Night'], '{"instagram":"@sofiacoast"}'::jsonb, true
  )
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  bio = excluded.bio,
  location = excluded.location,
  cover_url = excluded.cover_url,
  style_categories = excluded.style_categories,
  social_links = excluded.social_links,
  is_verified = excluded.is_verified;

insert into public.creator_posts (
  id, creator_id, title, caption, media_type, style_tags, occasion, season,
  gender_category, status, created_at
) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111',
    'Spring City Fit', 'Clean layers, neutral tones, and timeless pieces. Built for brunch that turns into dinner.',
    'video', array['Old Money', 'Business Casual', 'Neutral'], 'Brunch, Work, Date', 'Spring', 'Menswear', 'published', now() - interval '2 hours'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222',
    'Quiet Luxury Workday', 'Four repeat-wear pieces, no overthinking required.',
    'photo', array['Minimalist', 'Workwear', 'Monochrome'], 'Work', 'Fall', 'Womenswear', 'published', now() - interval '4 hours'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '33333333-3333-4333-8333-333333333333',
    'After Dark Utility', 'Tough textures, roomy proportions, and one very comfortable sneaker.',
    'video', array['Streetwear', 'Techwear', 'Urban'], 'Going Out', 'Fall', 'Unisex', 'published', now() - interval '7 hours'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '44444444-4444-4444-8444-444444444444',
    'Late Lunch by the Coast', 'Natural texture, a clean white shirt, and sandals made for walking.',
    'carousel', array['Vacation', 'Resort', 'Summer'], 'Vacation', 'Summer', 'Womenswear', 'published', now() - interval '1 day'
  )
on conflict (id) do update set
  title = excluded.title,
  caption = excluded.caption,
  media_type = excluded.media_type,
  style_tags = excluded.style_tags,
  occasion = excluded.occasion,
  season = excluded.season,
  gender_category = excluded.gender_category,
  status = excluded.status;

insert into public.creator_post_media (id, post_id, media_url, media_type, sort_order, alt_text) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '/assets/old-money-fit.png', 'image', 0, 'Spring City Fit'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85', 'image', 0, 'Quiet Luxury Workday'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85', 'image', 0, 'After Dark Utility'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85', 'image', 0, 'Late Lunch by the Coast')
on conflict (id) do update set media_url = excluded.media_url, alt_text = excluded.alt_text;

insert into public.products (
  id, created_by, brand, product_name, category, color, price, image_url,
  retailer, product_url, inventory_status, sizes_available
) values
  ('10000000-0000-4000-8000-000000000001', null, 'Ralph Lauren', 'Pima Cotton Sweater', 'Top', 'Navy', 128, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80', 'Ralph Lauren', 'https://www.ralphlauren.com/', 'in_stock', array['XS','S','M','L','XL']),
  ('10000000-0000-4000-8000-000000000002', null, 'Massimo Dutti', 'Pleated Trousers', 'Pants', 'Ecru', 89.95, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80', 'Massimo Dutti', 'https://www.massimodutti.com/', 'in_stock', array['28','30','32','34','36']),
  ('10000000-0000-4000-8000-000000000003', null, 'Tod''s', 'Suede Loafers', 'Shoes', 'Brown', 695, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80', 'Tod''s', 'https://www.tods.com/', 'in_stock', array['7','8','9','10','11','12']),
  ('10000000-0000-4000-8000-000000000004', null, 'Persol', 'PO0714 Sunglasses', 'Accessories', 'Tortoise', 320, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80', 'Persol', 'https://www.persol.com/', 'in_stock', array['One size']),
  ('20000000-0000-4000-8000-000000000001', null, 'COS', 'Double-Faced Wool Coat', 'Outerwear', 'Black', 390, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80', 'COS', 'https://www.cos.com/', 'in_stock', array['XS','S','M','L']),
  ('20000000-0000-4000-8000-000000000002', null, 'Toteme', 'Fine Merino Turtleneck', 'Top', 'Ivory', 210, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80', 'Toteme', 'https://toteme.com/', 'in_stock', array['XS','S','M','L']),
  ('20000000-0000-4000-8000-000000000003', null, 'Aritzia', 'Effortless Pant', 'Pants', 'Charcoal', 148, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80', 'Aritzia', 'https://www.aritzia.com/', 'in_stock', array['0','2','4','6','8','10']),
  ('20000000-0000-4000-8000-000000000004', null, 'Vagabond', 'Delia Leather Flat', 'Shoes', 'Black', 160, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 'Vagabond', 'https://www.vagabond.com/', 'in_stock', array['6','7','8','9','10']),
  ('30000000-0000-4000-8000-000000000001', null, 'Carhartt WIP', 'Detroit Jacket', 'Outerwear', 'Washed black', 248, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', 'Carhartt WIP', 'https://us.carhartt-wip.com/', 'in_stock', array['XS','S','M','L','XL']),
  ('30000000-0000-4000-8000-000000000002', null, 'Stussy', 'World Tour Tee', 'Top', 'White', 48, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', 'Stussy', 'https://www.stussy.com/', 'in_stock', array['S','M','L','XL']),
  ('30000000-0000-4000-8000-000000000003', null, 'Nike ACG', 'Smith Summit Cargo', 'Pants', 'Olive', 180, 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=600&q=80', 'Nike', 'https://www.nike.com/', 'in_stock', array['28','30','32','34','36']),
  ('30000000-0000-4000-8000-000000000004', null, 'New Balance', '9060 Sneakers', 'Shoes', 'Sea salt', 150, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 'New Balance', 'https://www.newbalance.com/', 'in_stock', array['7','8','9','10','11','12']),
  ('40000000-0000-4000-8000-000000000001', null, 'Reformation', 'Linen Relaxed Shirt', 'Top', 'White', 128, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', 'Reformation', 'https://www.thereformation.com/', 'in_stock', array['XS','S','M','L']),
  ('40000000-0000-4000-8000-000000000002', null, 'Faithfull', 'Bias Midi Skirt', 'Pants', 'Olive', 189, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80', 'Faithfull', 'https://faithfullthebrand.com/', 'in_stock', array['XS','S','M','L']),
  ('40000000-0000-4000-8000-000000000003', null, 'Amanu', 'Style 09 Sandal', 'Shoes', 'Tan', 275, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', 'Amanu', 'https://amanustudio.com/', 'in_stock', array['6','7','8','9','10']),
  ('40000000-0000-4000-8000-000000000004', null, 'Mango', 'Woven Shoulder Bag', 'Accessories', 'Natural', 89, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80', 'Mango', 'https://shop.mango.com/', 'in_stock', array['One size'])
on conflict (id) do update set
  brand = excluded.brand,
  product_name = excluded.product_name,
  category = excluded.category,
  color = excluded.color,
  price = excluded.price,
  image_url = excluded.image_url,
  retailer = excluded.retailer,
  product_url = excluded.product_url,
  inventory_status = excluded.inventory_status,
  sizes_available = excluded.sizes_available;

insert into public.creator_post_products (post_id, product_id, category, sort_order) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','10000000-0000-4000-8000-000000000001','Top',0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','10000000-0000-4000-8000-000000000002','Pants',1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','10000000-0000-4000-8000-000000000003','Shoes',2),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','10000000-0000-4000-8000-000000000004','Accessories',3),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','20000000-0000-4000-8000-000000000001','Outerwear',0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','20000000-0000-4000-8000-000000000002','Top',1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','20000000-0000-4000-8000-000000000003','Pants',2),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','20000000-0000-4000-8000-000000000004','Shoes',3),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','30000000-0000-4000-8000-000000000001','Outerwear',0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','30000000-0000-4000-8000-000000000002','Top',1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','30000000-0000-4000-8000-000000000003','Pants',2),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','30000000-0000-4000-8000-000000000004','Shoes',3),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','40000000-0000-4000-8000-000000000001','Top',0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','40000000-0000-4000-8000-000000000002','Pants',1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','40000000-0000-4000-8000-000000000003','Shoes',2),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','40000000-0000-4000-8000-000000000004','Accessories',3)
on conflict (post_id, product_id) do update set category = excluded.category, sort_order = excluded.sort_order;

insert into public.creator_closet_items (creator_id, product_id)
select post.creator_id, link.product_id
from public.creator_post_products as link
join public.creator_posts as post on post.id = link.post_id
where post.creator_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444'
)
on conflict (creator_id, product_id) do nothing;

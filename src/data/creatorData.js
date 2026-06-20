const product = (id, category, brand, name, price, image, extras = {}) => ({
  id,
  category,
  brand,
  name,
  price,
  image,
  retailer: extras.retailer ?? brand,
  color: extras.color ?? 'As shown',
  availability: extras.availability ?? 'In stock',
  sizes: extras.sizes ?? ['XS', 'S', 'M', 'L', 'XL'],
  affiliateUrl: extras.affiliateUrl ?? `https://example.com/products/${id}`,
});

export const creators = [
  {
    id: 'creator-jake',
    username: 'oldmoneyjake',
    displayName: 'Jake Morrison',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    cover: '/assets/old-money-fit.png',
    bio: 'Helping guys build a timeless wardrobe, one considered layer at a time.',
    location: 'New York, NY',
    tags: ['Old Money', 'Business Casual', 'Luxury'],
    socialLinks: { instagram: '@oldmoneyjake', website: 'oldmoneyedit.com' },
    followers: 12400,
    following: 152,
    outfitPosts: 85,
    likes: 241000,
    saves: 48300,
    purchases: 1294,
    status: 'Trending',
    verified: true,
  },
  {
    id: 'creator-maya',
    username: 'mayalayers',
    displayName: 'Maya Brooks',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    bio: 'Minimal layers, strong silhouettes, and a soft spot for an excellent coat.',
    location: 'London, UK',
    tags: ['Minimalist', 'Clean Girl', 'Workwear'],
    socialLinks: { instagram: '@mayalayers' },
    followers: 28900,
    following: 311,
    outfitPosts: 132,
    likes: 418000,
    saves: 92100,
    purchases: 2380,
    status: 'Most Saved',
    verified: true,
  },
  {
    id: 'creator-noah',
    username: 'noahafterdark',
    displayName: 'Noah Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85',
    bio: 'Streetwear, rare sneakers, and practical fits for nights in the city.',
    location: 'Los Angeles, CA',
    tags: ['Streetwear', 'Y2K', 'Techwear'],
    socialLinks: { instagram: '@noahafterdark', website: 'noahafterdark.com' },
    followers: 19700,
    following: 428,
    outfitPosts: 104,
    likes: 362000,
    saves: 67700,
    purchases: 3120,
    status: 'Most Purchased',
    verified: false,
  },
  {
    id: 'creator-sofia',
    username: 'sofiacoast',
    displayName: 'Sofia Reyes',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85',
    bio: 'Resort tailoring, warm-weather color, and a suitcase that is always half packed.',
    location: 'Miami, FL',
    tags: ['Vacation', 'Resort', 'Date Night'],
    socialLinks: { instagram: '@sofiacoast' },
    followers: 8600,
    following: 194,
    outfitPosts: 47,
    likes: 126000,
    saves: 28400,
    purchases: 684,
    status: 'New',
    verified: true,
  },
];

const jakeSpringProducts = [
  product('creator-rl-knit', 'Top', 'Ralph Lauren', 'Pima Cotton Sweater', 128, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80', { color: 'Navy' }),
  product('creator-md-pleat', 'Pants', 'Massimo Dutti', 'Pleated Trousers', 89.95, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80', { color: 'Ecru', sizes: ['28', '30', '32', '34', '36'] }),
  product('creator-tods-suede', 'Shoes', "Tod's", 'Suede Loafers', 695, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80', { color: 'Brown', sizes: ['7', '8', '9', '10', '11', '12'] }),
  product('creator-cartier-tank', 'Watches', 'Cartier', 'Tank Must Watch', 3550, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80', { color: 'Leather strap', sizes: ['One size'] }),
  product('creator-persol', 'Accessories', 'Persol', 'PO0714 Sunglasses', 320, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80', { color: 'Tortoise', sizes: ['One size'] }),
];

const mayaProducts = [
  product('maya-cos-coat', 'Outerwear', 'COS', 'Double-Faced Wool Coat', 390, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80', { color: 'Black' }),
  product('maya-knit', 'Top', 'Toteme', 'Fine Merino Turtleneck', 210, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80', { color: 'Ivory' }),
  product('maya-trouser', 'Pants', 'Aritzia', 'Effortless Pant', 148, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80', { color: 'Charcoal' }),
  product('maya-flat', 'Shoes', 'Vagabond', 'Delia Leather Flat', 160, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', { color: 'Black', sizes: ['6', '7', '8', '9', '10'] }),
];

const noahProducts = [
  product('noah-bomber', 'Outerwear', 'Carhartt WIP', 'Detroit Jacket', 248, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80', { color: 'Washed black' }),
  product('noah-tee', 'Top', 'Stussy', 'World Tour Tee', 48, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', { color: 'White' }),
  product('noah-cargo', 'Pants', 'Nike ACG', 'Smith Summit Cargo', 180, 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=600&q=80', { color: 'Olive', sizes: ['28', '30', '32', '34', '36'] }),
  product('noah-sneaker', 'Shoes', 'New Balance', '9060 Sneakers', 150, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', { color: 'Sea salt', sizes: ['7', '8', '9', '10', '11', '12'] }),
];

const sofiaProducts = [
  product('sofia-linen', 'Top', 'Reformation', 'Linen Relaxed Shirt', 128, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', { color: 'White' }),
  product('sofia-skirt', 'Pants', 'Faithfull', 'Bias Midi Skirt', 189, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80', { color: 'Olive' }),
  product('sofia-sandal', 'Shoes', 'Amanu', 'Style 09 Sandal', 275, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80', { color: 'Tan', sizes: ['6', '7', '8', '9', '10'] }),
  product('sofia-bag', 'Accessories', 'Mango', 'Woven Shoulder Bag', 89, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80', { color: 'Natural', sizes: ['One size'] }),
];

export const creatorPosts = [
  {
    id: 'spring-city-fit',
    creatorUsername: 'oldmoneyjake',
    title: 'Spring City Fit',
    caption: 'Clean layers, neutral tones, and timeless pieces. Built for brunch that turns into dinner.',
    mediaType: 'video',
    image: '/assets/old-money-fit.png',
    gallery: ['/assets/old-money-fit.png', '/assets/old-money-collage.png'],
    tags: ['Old Money', 'Business Casual', 'Neutral'],
    occasion: 'Brunch, Work, Date',
    season: 'Spring',
    genderCategory: 'Menswear',
    likes: 23100,
    saves: 10800,
    comments: 486,
    createdAt: '2h',
    products: jakeSpringProducts,
  },
  {
    id: 'three-ways-tailoring',
    creatorUsername: 'oldmoneyjake',
    title: 'Three Ways to Wear White Pants',
    caption: 'One trouser, three very different days. The navy knit version remains undefeated.',
    mediaType: 'carousel',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85',
    gallery: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85', '/assets/old-money-fit.png'],
    tags: ['Classic', 'Tailored', 'Spring'],
    occasion: 'Everyday',
    season: 'Spring',
    genderCategory: 'Menswear',
    likes: 18700,
    saves: 7600,
    comments: 312,
    createdAt: '1d',
    products: jakeSpringProducts.slice(0, 3),
  },
  {
    id: 'quiet-luxury-workday',
    creatorUsername: 'mayalayers',
    title: 'Quiet Luxury Workday',
    caption: 'Four repeat-wear pieces, no overthinking required.',
    mediaType: 'photo',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    gallery: [],
    tags: ['Minimalist', 'Workwear', 'Monochrome'],
    occasion: 'Work',
    season: 'Fall',
    genderCategory: 'Womenswear',
    likes: 34200,
    saves: 14900,
    comments: 721,
    createdAt: '4h',
    products: mayaProducts,
  },
  {
    id: 'gallery-night-layers',
    creatorUsername: 'mayalayers',
    title: 'Gallery Night Layers',
    caption: 'A long line coat makes the simplest base feel intentional.',
    mediaType: 'video',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85',
    gallery: [],
    tags: ['Date Night', 'Minimalist', 'Layered'],
    occasion: 'Date Night',
    season: 'Winter',
    genderCategory: 'Womenswear',
    likes: 27800,
    saves: 12100,
    comments: 503,
    createdAt: '2d',
    products: mayaProducts.slice(0, 3),
  },
  {
    id: 'after-dark-utility',
    creatorUsername: 'noahafterdark',
    title: 'After Dark Utility',
    caption: 'Tough textures, roomy proportions, and one very comfortable sneaker.',
    mediaType: 'video',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85',
    gallery: [],
    tags: ['Streetwear', 'Techwear', 'Urban'],
    occasion: 'Going Out',
    season: 'Fall',
    genderCategory: 'Unisex',
    likes: 29600,
    saves: 9400,
    comments: 811,
    createdAt: '7h',
    products: noahProducts,
  },
  {
    id: 'late-lunch-resort',
    creatorUsername: 'sofiacoast',
    title: 'Late Lunch by the Coast',
    caption: 'Natural texture, a clean white shirt, and sandals made for walking.',
    mediaType: 'carousel',
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85',
    gallery: [],
    tags: ['Vacation', 'Resort', 'Summer'],
    occasion: 'Vacation',
    season: 'Summer',
    genderCategory: 'Womenswear',
    likes: 13200,
    saves: 6100,
    comments: 194,
    createdAt: '1d',
    products: sofiaProducts,
  },
];

export const demoCommentsByPost = {
  'spring-city-fit': [
    {
      id: 'comment-demo-1', postId: 'spring-city-fit', userId: 'demo-maya', parentId: null,
      comment: 'The navy knit with those trousers is exactly the balance I was looking for.',
      pinned: true, createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
      authorName: 'Maya Brooks', authorAvatar: creators[1].avatar, likes: 38, likedByMe: false,
    },
    {
      id: 'comment-demo-2', postId: 'spring-city-fit', userId: 'demo-noah', parentId: null,
      comment: 'Would this work with a darker loafer too?',
      pinned: false, createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      authorName: 'Noah Chen', authorAvatar: creators[2].avatar, likes: 12, likedByMe: false,
    },
    {
      id: 'comment-demo-3', postId: 'spring-city-fit', userId: 'creator-jake', parentId: 'comment-demo-2',
      comment: 'Absolutely. Dark brown keeps the same feel and adds a little more contrast.',
      pinned: false, createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      authorName: 'Jake Morrison', authorAvatar: creators[0].avatar, likes: 19, likedByMe: false,
    },
  ],
};

export const currentCreator = {
  id: 'creator-morgan',
  username: 'morganstyles',
  displayName: 'Morgan Ellis',
  avatar: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=85',
  cover: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  bio: 'Modern tailoring and useful outfits for real calendars.',
  location: 'Chicago, IL',
  tags: ['Business Casual', 'Minimalist', 'Date Night'],
  socialLinks: { instagram: '@morganstyles' },
  followers: 0,
  following: 12,
  outfitPosts: 0,
  likes: 0,
  saves: 0,
  purchases: 0,
  status: 'New',
  verified: false,
};

export const closetExtras = [
  product('closet-rl-blazer', 'Outerwear', 'Ralph Lauren', 'Polo Wool Blazer', 498, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80', { color: 'Navy' }),
  product('closet-tom-belt', 'Accessories', 'Tom Ford', 'Leather T-Buckle Belt', 490, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', { color: 'Brown', sizes: ['30', '32', '34', '36'] }),
  product('closet-omega', 'Watches', 'Omega', 'De Ville Prestige', 4300, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80', { color: 'Silver', sizes: ['One size'] }),
];

export function getCreator(username) {
  return [...creators, currentCreator].find((creator) => creator.username === username) ?? creators[0];
}

export function getCreatorPosts(username, posts = creatorPosts) {
  return posts.filter((post) => post.creatorUsername === username);
}

export function getCreatorCloset(username, posts = creatorPosts) {
  const seen = new Set();
  const products = getCreatorPosts(username, posts).flatMap((post) => post.products);
  if (username === 'oldmoneyjake') products.push(...closetExtras);
  return products.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

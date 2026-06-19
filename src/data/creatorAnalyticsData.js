const baseSummary = {
  profileViews: 125430,
  outfitViews: 320876,
  postViews: 178420,
  saves: 48302,
  productClicks: 12340,
  followersGained: 2840,
  unfollows: 186,
  collectionFollows: 920,
  comments: 1846,
  shares: 6230,
};

const rangeConfig = {
  Today: { factor: 0.032, labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', 'Now'], curve: [0.38, 0.52, 0.47, 0.72, 0.84, 1] },
  '7 Days': { factor: 0.24, labels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'], curve: [0.42, 0.56, 0.48, 0.68, 0.74, 0.88, 1] },
  '30 Days': { factor: 1, labels: ['May 21', 'May 25', 'May 29', 'Jun 2', 'Jun 6', 'Jun 10', 'Jun 14', 'Jun 18'], curve: [0.31, 0.39, 0.47, 0.44, 0.62, 0.72, 0.83, 1] },
  '90 Days': { factor: 2.74, labels: ['Mar 20', 'Apr 2', 'Apr 15', 'Apr 28', 'May 11', 'May 24', 'Jun 6', 'Jun 18'], curve: [0.19, 0.27, 0.32, 0.45, 0.53, 0.68, 0.79, 1] },
  Custom: { factor: 1.38, labels: ['Start', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'End'], curve: [0.28, 0.35, 0.43, 0.51, 0.49, 0.69, 0.82, 1] },
};

const metricRates = { views: 51000, saves: 7600, clicks: 2200, follows: 510, comments: 380, shares: 940 };

export const analyticsRanges = Object.keys(rangeConfig);
export const chartMetrics = [
  { id: 'views', label: 'Views' },
  { id: 'saves', label: 'Saves' },
  { id: 'clicks', label: 'Clicks' },
  { id: 'follows', label: 'Follows' },
  { id: 'comments', label: 'Comments' },
  { id: 'shares', label: 'Shares' },
];

function dateWindow(range, customRange = {}) {
  const end = customRange.end ? new Date(`${customRange.end}T23:59:59`) : new Date();
  let start;
  if (range === 'Today') {
    start = new Date(end);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'Custom' && customRange.start) {
    start = new Date(`${customRange.start}T00:00:00`);
  } else {
    const days = { '7 Days': 7, '30 Days': 30, '90 Days': 90, Custom: 45 }[range] ?? 30;
    start = new Date(end.getTime() - days * 86400000);
  }
  return { start, end };
}

function rowsInWindow(rows, start, end) {
  return (rows ?? []).filter((row) => {
    const created = new Date(row.created_at);
    return created >= start && created <= end;
  });
}

function cumulativeSeries(rows, labels, start, end) {
  const buckets = Array.from({ length: labels.length }, () => 0);
  const duration = Math.max(end.getTime() - start.getTime(), 1);
  rows.forEach((row) => {
    const progress = (new Date(row.created_at).getTime() - start.getTime()) / duration;
    const index = Math.max(0, Math.min(labels.length - 1, Math.floor(progress * labels.length)));
    buckets[index] += 1;
  });
  return buckets.reduce((series, value, index) => {
    series.push(value + (series[index - 1] ?? 0));
    return series;
  }, []);
}

export function getAnalyticsForRange(range, liveInsights = null, customRange = {}) {
  const config = rangeConfig[range] ?? rangeConfig['30 Days'];
  if (liveInsights) {
    const { start, end } = dateWindow(range, customRange);
    const events = rowsInWindow(liveInsights.events, start, end);
    const count = (type) => events.filter((event) => event.event_type === type).length;
    const postViews = count('post_view');
    const seriesFor = (types) => cumulativeSeries(events.filter((event) => types.includes(event.event_type)), config.labels, start, end);
    return {
      ...config,
      live: true,
      window: { start, end },
      summary: {
        profileViews: count('profile_view'),
        outfitViews: postViews,
        postViews,
        saves: count('save'),
        productClicks: count('product_click'),
        followersGained: count('follow'),
        unfollows: count('unfollow'),
        collectionFollows: count('collection_follow'),
        comments: count('comment'),
        shares: count('share'),
      },
      series: {
        views: seriesFor(['profile_view', 'post_view']),
        saves: seriesFor(['save']),
        clicks: seriesFor(['product_click']),
        follows: seriesFor(['follow']),
        comments: seriesFor(['comment']),
        shares: seriesFor(['share']),
      },
    };
  }
  const summary = Object.fromEntries(Object.entries(baseSummary).map(([key, value]) => [key, Math.round(value * config.factor)]));
  const series = Object.fromEntries(Object.entries(metricRates).map(([metric, rate]) => [metric, config.curve.map((point, index) => Math.round(rate * config.factor * point * (0.88 + index * 0.025)))]));
  return { ...config, summary, series };
}

const outfitSeeds = [
  { id: 'spring-city-fit', title: 'Spring City Fit', image: '/assets/old-money-fit.png', views: 54328, saves: 4302, shares: 812, clicks: 1244 },
  { id: 'three-ways-tailoring', title: 'Three Ways to Wear White Pants', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80', views: 41860, saves: 3710, shares: 634, clicks: 982 },
  { id: 'quiet-luxury-workday', title: 'Quiet Luxury Workday', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80', views: 37720, saves: 3250, shares: 521, clicks: 864 },
];

export function getOutfitPerformance(posts, liveInsights = null) {
  if (liveInsights) {
    const events = liveInsights.events ?? [];
    return posts.map((post) => {
      const postEvents = events.filter((event) => event.post_id === post.id);
      const count = (type) => postEvents.filter((event) => event.event_type === type).length;
      return { id: post.id, title: post.title, image: post.image, views: count('post_view'), saves: count('save'), shares: count('share'), clicks: count('product_click'), comments: count('comment') };
    }).sort((a, b) => b.views - a.views || b.saves - a.saves);
  }
  const fallback = posts[0];
  return outfitSeeds.map((seed, index) => {
    const post = posts.find((item) => item.id === seed.id) ?? posts[index] ?? fallback;
    return { ...seed, id: post?.id ?? seed.id, title: post?.title ?? seed.title, image: post?.image ?? seed.image };
  });
}

export const productPerformance = [
  { id: 'creator-tods-suede', brand: "Tod's", name: 'Suede Loafers', clicks: 1320 },
  { id: 'creator-rl-knit', brand: 'Ralph Lauren', name: 'Pima Cotton Sweater', clicks: 1184 },
  { id: 'creator-md-pleat', brand: 'Massimo Dutti', name: 'Pleated Trousers', clicks: 946 },
  { id: 'creator-persol', brand: 'Persol', name: 'PO0714 Sunglasses', clicks: 721 },
];

export function getProductPerformance(posts, liveInsights = null) {
  if (!liveInsights) return productPerformance;
  const products = posts.flatMap((post) => post.products.map((product) => ({ ...product, postId: post.id })));
  const uniqueProducts = [...new Map(products.map((product) => [product.id, product])).values()];
  return uniqueProducts.map((product) => ({
    id: product.id,
    brand: product.brand,
    name: product.name,
    clicks: (liveInsights.events ?? []).filter((event) => event.product_id === product.id && event.event_type === 'product_click').length,
  })).sort((a, b) => b.clicks - a.clicks);
}

export const followerInsights = { total: 12400, newFollowers: 2840, unfollows: 186, netGrowth: 2654, labels: ['May 21', 'May 28', 'Jun 4', 'Jun 11', 'Jun 18'], values: [9746, 10290, 10840, 11620, 12400] };

export function getFollowerInsights(liveInsights = null, range = '30 Days', customRange = {}) {
  if (!liveInsights) return followerInsights;
  const config = rangeConfig[range] ?? rangeConfig['30 Days'];
  const { start, end } = dateWindow(range, customRange);
  const events = rowsInWindow(liveInsights.events, start, end);
  const follows = events.filter((event) => event.event_type === 'follow');
  const unfollows = events.filter((event) => event.event_type === 'unfollow');
  const total = liveInsights.followers?.length ?? 0;
  const additions = cumulativeSeries(liveInsights.followers ?? [], config.labels, start, end);
  const beforeWindow = Math.max(total - (additions.at(-1) ?? 0), 0);
  return { total, newFollowers: follows.length || (additions.at(-1) ?? 0), unfollows: unfollows.length, netGrowth: follows.length - unfollows.length || (additions.at(-1) ?? 0), labels: config.labels, values: additions.map((value) => beforeWindow + value) };
}

export const creatorRankings = [
  { badge: 'Trending Creator', detail: 'Strong engagement this month' },
  { badge: 'Fast Growing', detail: 'Follower momentum is rising' },
  { badge: 'Most Saved', detail: 'Fits shoppers return to' },
];

export const creatorNotifications = [
  { id: 'milestone-saves', type: 'milestone', title: 'Your outfit was saved 100 times today.', time: '12 min', unread: true },
  { id: 'new-followers', type: 'follow', title: 'Your creator account gained 50 new followers.', time: '1 hr', unread: true },
  { id: 'comment', type: 'comment', title: 'Maya commented: “The navy knit is perfect.”', time: 'Yesterday', unread: false },
];

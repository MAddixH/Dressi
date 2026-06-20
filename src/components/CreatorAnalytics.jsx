import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  Bookmark,
  Clock3,
  ChevronRight,
  DollarSign,
  Eye,
  MessageCircle,
  MousePointerClick,
  Share2,
  Search,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  analyticsRanges,
  chartMetrics,
  creatorNotifications,
  creatorRankings,
  getAnalyticsForRange,
  getEstimatedEarnings,
  getFollowerInsights,
  getOutfitPerformance,
  getProductPerformance,
} from '../data/creatorAnalyticsData.js';
import { normalizePlatformAnalytics, previewPlatformAnalytics } from '../data/platformAnalyticsData.js';

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

function compact(value) {
  return compactNumber.format(value);
}

function normalizeNotifications(items = []) {
  return items.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.message ? `${item.title}: ${item.message}` : item.title,
    time: item.time ?? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    unread: item.unread ?? !item.read,
  }));
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function TrendChart({ labels, values }) {
  const safeLabels = labels?.length ? labels : ['No activity'];
  const safeValues = values?.length ? values : [0];
  const width = 320;
  const height = 126;
  const pad = 10;
  const max = Math.max(...safeValues, 1);
  const min = Math.min(...safeValues, 0);
  const spread = Math.max(max - min, 1);
  const points = safeValues.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(safeValues.length - 1, 1);
    const y = height - pad - ((value - min) / spread) * (height - pad * 2);
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  const firstNonZero = safeValues.find((value) => value > 0) ?? 0;
  const growth = firstNonZero ? ((safeValues.at(-1) - firstNonZero) / firstNonZero) * 100 : 0;

  return (
    <div className="trend-chart">
      <div className="trend-chart-value"><strong>{compact(safeValues.at(-1))}</strong><span><TrendingUp size={13} /> {growth.toFixed(1)}%</span></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Performance trend">
        <defs><linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#171717" stopOpacity="0.22" /><stop offset="100%" stopColor="#171717" stopOpacity="0" /></linearGradient></defs>
        <line x1="10" y1="32" x2="310" y2="32" /><line x1="10" y1="72" x2="310" y2="72" /><line x1="10" y1="112" x2="310" y2="112" />
        <polygon points={area} fill="url(#analytics-fill)" /><polyline points={line} />
        {points.map(([x, y], index) => <circle cx={x} cy={y} r={index === points.length - 1 ? 4 : 2.5} key={`${x}-${y}`} />)}
      </svg>
      <div className="trend-chart-labels">{safeLabels.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, trend = null, format = compact }) {
  return (
    <article className="analytics-summary-card">
      <span><Icon size={16} /></span><small>{label}</small><strong>{format(value)}</strong>
      {trend !== null && <em className={trend < 0 ? 'down' : ''}>{trend > 0 ? '+' : ''}{trend}%</em>}
    </article>
  );
}

function OutfitPerformanceList({ posts, liveInsights, onOpenPost, limit }) {
  const outfits = useMemo(() => getOutfitPerformance(posts, liveInsights), [posts, liveInsights]);
  const visible = limit ? outfits.slice(0, limit) : outfits;
  return (
    <div className="outfit-performance-list">
      {!visible.length && <p className="analytics-empty">Performance appears here as published fits receive views, saves, shares, comments, and product clicks.</p>}
      {visible.map((outfit, index) => (
        <button onClick={() => onOpenPost?.(outfit.id)} type="button" key={outfit.id}>
          <span className="performance-rank">{String(index + 1).padStart(2, '0')}</span><img src={outfit.image} alt={outfit.title} />
          <span className="performance-copy"><strong>{outfit.title}</strong><small>{compact(outfit.views)} views / {compact(outfit.saves)} saves</small><span><b>{compact(outfit.shares)} shares</b><b>{compact(outfit.comments || 0)} comments</b><b>{compact(outfit.purchases || 0)} purchases</b><b>{(outfit.conversionRate || 0).toFixed(1)}% conversion</b></span></span>
          <span className="performance-total">{compact(outfit.clicks)}<small>clicks</small><em>{money.format(outfit.estimatedEarnings ?? 0)} est.</em><ChevronRight size={15} /></span>
        </button>
      ))}
    </div>
  );
}

function StyleRanking({ title, items, emptyCopy }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return (
    <article className="style-ranking-card">
      <h3>{title}</h3>
      {!items.length && <p className="analytics-empty">{emptyCopy}</p>}
      {items.map((item, index) => (
        <div key={`${title}-${item.label}`}>
          <span>{index + 1}</span>
          <p><strong>{item.label}</strong><i style={{ width: `${Math.max(5, (item.count / maximum) * 100)}%` }} /></p>
          <b>{compact(item.count)}</b>
        </div>
      ))}
    </article>
  );
}

function CreatorLeaderboards({ creators = [] }) {
  const boards = [
    { title: 'Most followed', rows: [...creators].sort((a, b) => b.followers - a.followers).slice(0, 3), value: (item) => compact(item.followers) },
    { title: 'Most saved', rows: [...creators].sort((a, b) => b.saves - a.saves).slice(0, 3), value: (item) => compact(item.saves) },
    { title: 'Most purchased', rows: [...creators].sort((a, b) => (b.purchases || 0) - (a.purchases || 0)).slice(0, 3), value: (item) => compact(item.purchases || 0) },
  ];
  return (
    <section className="analytics-panel creator-leaderboards">
      <div className="analytics-panel-heading"><div><p className="eyebrow">Creator rankings</p><h2>Community leaders</h2></div></div>
      <div className="leaderboard-grid">{boards.map((board) => <article key={board.title}><h3>{board.title}</h3>{board.rows.map((creator, index) => <div key={`${board.title}-${creator.id}`}><span>{index + 1}</span><img src={creator.avatar} alt="" /><p><strong>@{creator.username}</strong><small>{creator.status || 'Creator'}</small></p><b>{board.value(creator)}</b></div>)}</article>)}</div>
    </section>
  );
}

export function CreatorDashboard({ creator, creators = [], posts, liveInsights, platformInsights, insightsLoading = false, insightsError = '', onOpenPost, onOpenEarnings, onMarkNotificationsRead }) {
  const [range, setRange] = useState('30 Days');
  const [metric, setMetric] = useState('views');
  const [section, setSection] = useState('Overview');
  const [customRange, setCustomRange] = useState({ start: '2026-05-01', end: '2026-06-18' });
  const isLive = liveInsights !== undefined;
  const liveSource = liveInsights ?? { events: [], followers: [], notifications: [] };
  const [notifications, setNotifications] = useState(() => normalizeNotifications(isLive ? liveSource.notifications : creatorNotifications));
  useEffect(() => setNotifications(normalizeNotifications(isLive ? liveSource.notifications : creatorNotifications)), [isLive, liveInsights]);
  const analytics = getAnalyticsForRange(range, isLive ? liveSource : null, customRange);
  const followerData = getFollowerInsights(isLive ? liveSource : null, range, customRange);
  const liveProducts = getProductPerformance(posts, isLive ? liveSource : null);
  const platform = normalizePlatformAnalytics(platformInsights) ?? previewPlatformAnalytics;
  const platformIsPreview = !platformInsights;
  const { summary } = analytics;
  const estimatedEarnings = getEstimatedEarnings(summary);
  const sections = ['Overview', 'Outfits', 'Products', 'Followers', 'Platform'];
  const cards = [
    ['Profile views', summary.profileViews, Eye, isLive ? null : 18.4],
    ['Outfit views', summary.outfitViews, BarChart3, isLive ? null : 24.1],
    ['Post views', summary.postViews, Sparkles, isLive ? null : 12.7],
    ['Saves', summary.saves, Bookmark, isLive ? null : 16.9],
    ['Product clicks', summary.productClicks, MousePointerClick, isLive ? null : 9.8],
    ['Followers gained', summary.followersGained, UserPlus, isLive ? null : 21.7],
    ['Unfollows', summary.unfollows, Users, isLive ? null : -2.1],
    ['Collection follows', summary.collectionFollows, Bookmark, isLive ? null : 13.4],
    ['Comments', summary.comments, MessageCircle, isLive ? null : 15.2],
    ['Shares', summary.shares, Share2, isLive ? null : 11.6],
    ['Purchases', summary.purchases, ShoppingBag, isLive ? null : 8.8],
    ['Estimated earnings', estimatedEarnings, DollarSign, isLive ? null : 9.4, money.format],
  ];

  return (
    <section className="creator-dashboard page-stack">
      <section className="analytics-hero"><div><p className="eyebrow">Creator studio</p><h1>Good momentum, {creator.displayName.split(' ')[0]}.</h1><p>See how people discover, save, discuss, and shop your fits.</p></div><span className="creator-score"><strong>{Math.min(99, 60 + Math.round(Math.log10(Math.max(liveSource.events.length, 1)) * 12))}</strong><small>Engagement score</small></span></section>
      <div className={insightsError ? 'analytics-live-status error' : isLive ? 'analytics-live-status live' : 'analytics-live-status'}><span /><strong>{insightsLoading ? 'Syncing creator activity…' : insightsError ? 'Live tracking needs setup' : isLive ? 'Live Supabase activity' : 'Preview analytics'}</strong><small>{isLive ? `${liveSource.events.length} tracked events` : 'Preview data'}</small></div>
      {insightsError && <div className="inline-notice error">{insightsError}</div>}

      <div className="analytics-range-row horizontal-scroll" aria-label="Analytics date range">{analyticsRanges.map((item) => <button className={range === item ? 'active' : ''} onClick={() => setRange(item)} type="button" key={item}>{item}</button>)}</div>
      {range === 'Custom' && <div className="custom-range"><label>From<input type="date" value={customRange.start} onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))} /></label><label>To<input type="date" value={customRange.end} onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))} /></label></div>}
      <div className="analytics-section-tabs">{sections.map((item) => <button className={section === item ? 'active' : ''} onClick={() => setSection(item)} type="button" key={item}>{item}</button>)}</div>

      {section === 'Overview' && <>
        <div className="analytics-summary-grid">{cards.map(([label, value, Icon, trend, format]) => <SummaryCard label={label} value={value} icon={Icon} trend={trend} format={format} key={label} />)}</div>
        <button className="earnings-disclaimer" onClick={onOpenEarnings} type="button"><DollarSign size={15} /><span><strong>{money.format(estimatedEarnings)} estimated earnings</strong><small>View earnings details and attribution.</small></span><ChevronRight size={16} /></button>
        <section className="analytics-panel performance-chart-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Performance</p><h2>Growth over time</h2></div><span>{range}</span></div><div className="metric-switcher horizontal-scroll">{chartMetrics.map((item) => <button className={metric === item.id ? 'active' : ''} onClick={() => setMetric(item.id)} type="button" key={item.id}>{item.label}</button>)}</div><TrendChart labels={analytics.labels} values={analytics.series[metric]} /></section>
        <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Top performing outfits</p><h2>What shoppers respond to</h2></div><button onClick={() => setSection('Outfits')} type="button">View all</button></div><OutfitPerformanceList posts={posts} liveInsights={isLive ? liveSource : null} onOpenPost={onOpenPost} limit={3} /></section>
        <section className="dashboard-split">
          <article className="ranking-card"><Award size={25} /><p className="eyebrow">Creator rankings</p><h2>{creatorRankings[0].badge}</h2><p>{creatorRankings[0].detail}</p><div>{creatorRankings.slice(1).map((rank) => <span key={rank.badge}><strong>{rank.badge}</strong><small>{rank.detail}</small></span>)}</div></article>
          <article className="engagement-preview"><Users size={25} /><small>Audience activity</small><strong>{compact(summary.saves + summary.comments + summary.shares)}</strong><span>Saves, comments, and shares in this period</span></article>
        </section>
        <CreatorLeaderboards creators={creators} />
        <section className="analytics-panel notification-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Activity</p><h2>Creator notifications</h2></div><button onClick={() => { setNotifications((current) => current.map((item) => ({ ...item, unread: false }))); onMarkNotificationsRead?.(); }} type="button">Mark read</button></div><div className="creator-notification-list">{!notifications.length && <p className="analytics-empty">Follower, save, comment, and milestone activity will appear here.</p>}{notifications.map((notification) => <button className={notification.unread ? 'unread' : ''} onClick={() => { setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, unread: false } : item)); onMarkNotificationsRead?.(notification.id); }} type="button" key={notification.id}><span><Bell size={16} /></span><strong>{notification.title}</strong><small>{notification.time}</small></button>)}</div></section>
      </>}

      {section === 'Outfits' && <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Outfit performance</p><h2>Discovery and engagement</h2></div></div><OutfitPerformanceList posts={posts} liveInsights={isLive ? liveSource : null} onOpenPost={onOpenPost} /><div className="performance-legend"><span><Eye size={13} /> Views</span><span><Bookmark size={13} /> Saves</span><span><Share2 size={13} /> Shares</span><span><MousePointerClick size={13} /> Clicks</span></div></section>}
      {section === 'Products' && <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Product performance</p><h2>Clicks to attributed purchases</h2></div></div><div className="product-performance-list">{!liveProducts.length && <p className="analytics-empty">Tagged product clicks will appear here.</p>}{liveProducts.map((product, index) => <article key={product.id}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{product.brand}</small><strong>{product.name}</strong><em>{compact(product.clicks)} clicks · {product.purchases || 0} purchases · {(product.conversionRate || 0).toFixed(1)}% conversion · {money.format(product.estimatedEarnings ?? 0)} estimated</em></div><b>{compact(product.purchases || 0)}</b></article>)}</div></section>}
      {section === 'Followers' && <><div className="follower-summary-grid"><article><small>Total followers</small><strong>{compact(followerData.total)}</strong></article><article><small>New followers</small><strong>+{compact(followerData.newFollowers)}</strong></article><article><small>Unfollows</small><strong>-{followerData.unfollows}</strong></article><article><small>Net growth</small><strong>{followerData.netGrowth >= 0 ? '+' : ''}{compact(followerData.netGrowth)}</strong></article></div><section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Follower insights</p><h2>Audience growth</h2></div><span>{range}</span></div><TrendChart labels={followerData.labels} values={followerData.values} /></section></>}
      {section === 'Platform' && <>
        <div className="platform-analytics-intro"><div><p className="eyebrow">Dressi pulse</p><h2>What the community wants now</h2></div><span>{platformIsPreview ? 'Preview' : 'Live'}</span></div>
        <div className="analytics-summary-grid platform-summary-grid">
          <SummaryCard label="Daily users" value={platform.summary.dailyUsers} icon={Users} />
          <SummaryCard label="Weekly users" value={platform.summary.weeklyUsers} icon={Users} />
          <SummaryCard label="Monthly users" value={platform.summary.monthlyUsers} icon={Users} />
          <SummaryCard label="7-day retention" value={platform.summary.retentionRate} icon={TrendingUp} format={(value) => `${value.toFixed(1)}%`} />
          <SummaryCard label="Avg. session" value={platform.summary.averageSessionMinutes} icon={Clock3} format={(value) => `${value.toFixed(1)}m`} />
          <SummaryCard label="Style searches" value={platform.summary.searches} icon={Search} />
        </div>
        <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">Active audience</p><h2>Daily users over time</h2></div><span>30 days</span></div><TrendChart labels={platform.activity.map((row) => row.date)} values={platform.activity.map((row) => row.users)} /></section>
        <div className="style-ranking-grid">
          <StyleRanking title="Most viewed styles" items={platform.viewedStyles} emptyCopy="Style views will rank here." />
          <StyleRanking title="Most searched styles" items={platform.searchedStyles} emptyCopy="Search demand will rank here." />
          <StyleRanking title="Most saved styles" items={platform.savedStyles} emptyCopy="Saved styles will rank here." />
        </div>
      </>}
    </section>
  );
}

export function NotificationsCenter({ items = creatorNotifications, onMarkRead }) {
  const [notifications, setNotifications] = useState(() => normalizeNotifications(items));
  useEffect(() => setNotifications(normalizeNotifications(items)), [items]);
  const unread = notifications.filter((item) => item.unread).length;

  function markRead(id = null) {
    setNotifications((current) => current.map((item) => (!id || item.id === id) ? { ...item, unread: false } : item));
    onMarkRead?.(id);
  }

  return (
    <section className="notifications-page page-stack">
      <section className="notifications-hero">
        <span><Bell size={22} /></span>
        <div><p className="eyebrow">Activity center</p><h1>{unread ? `${unread} new updates` : 'You are all caught up'}</h1><p>Follows, saves, comments, purchases, and milestones appear here.</p></div>
      </section>
      <div className="notifications-toolbar"><strong>Recent activity</strong><button onClick={() => markRead()} disabled={!unread} type="button">Mark all read</button></div>
      <div className="notification-feed">
        {!notifications.length && <p className="analytics-empty">Your activity will appear here.</p>}
        {notifications.map((item) => (
          <button className={item.unread ? 'unread' : ''} onClick={() => markRead(item.id)} type="button" key={item.id}>
            <span>{item.type === 'comment' ? <MessageCircle size={17} /> : item.type === 'purchase' ? <ShoppingBag size={17} /> : item.type === 'save' ? <Bookmark size={17} /> : item.type === 'follow' ? <UserPlus size={17} /> : <Bell size={17} />}</span>
            <div><strong>{item.title}</strong><small>{item.time}</small></div>
            {item.unread && <i />}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CreatorEarnings({ posts, liveInsights, onOpenPost }) {
  const isLive = liveInsights !== undefined;
  const source = isLive ? liveInsights : null;
  const month = getAnalyticsForRange('30 Days', source);
  const lifetime = getAnalyticsForRange('90 Days', source);
  const current = getEstimatedEarnings(month.summary);
  const lifetimeTotal = getEstimatedEarnings(lifetime.summary);
  const pending = current * 0.35;
  const paid = Math.max(lifetimeTotal - pending, 0);
  const outfits = getOutfitPerformance(posts, source);
  const products = getProductPerformance(posts, source);

  return (
    <section className="earnings-page page-stack">
      <section className="earnings-hero"><p className="eyebrow">Estimated earnings</p><h1>{money.format(current)}</h1><p>Current 30-day estimate from attributed purchases and high-intent product activity.</p></section>
      <div className="earnings-summary-grid">
        <article><small>Pending</small><strong>{money.format(pending)}</strong></article>
        <article><small>Paid estimate</small><strong>{money.format(paid)}</strong></article>
        <article><small>Lifetime estimate</small><strong>{money.format(lifetimeTotal)}</strong></article>
        <article><small>Purchases</small><strong>{compact(month.summary.purchases || 0)}</strong></article>
      </div>
      <div className="earnings-note"><DollarSign size={16} /><p><strong>MVP estimate</strong><span>These figures are directional until retailer checkout and payout reconciliation are connected.</span></p></div>
      <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">By outfit</p><h2>Top earning fits</h2></div></div><div className="earnings-list">{outfits.map((item) => <button onClick={() => onOpenPost?.(item.id)} type="button" key={item.id}><img src={item.image} alt="" /><span><strong>{item.title}</strong><small>{item.purchases || 0} purchases · {(item.conversionRate || 0).toFixed(1)}% conversion</small></span><b>{money.format(item.estimatedEarnings || 0)}</b></button>)}</div></section>
      <section className="analytics-panel"><div className="analytics-panel-heading"><div><p className="eyebrow">By product</p><h2>Products driving value</h2></div></div><div className="earnings-product-list">{products.map((item) => <div key={item.id}><span><strong>{item.name}</strong><small>{item.brand} · {item.purchases || 0} purchases</small></span><b>{money.format(item.estimatedEarnings || 0)}</b></div>)}</div></section>
    </section>
  );
}

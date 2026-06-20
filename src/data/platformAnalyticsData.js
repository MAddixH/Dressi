const previewActivity = [
  { date: 'May 22', users: 1840 },
  { date: 'May 26', users: 2130 },
  { date: 'May 30', users: 2050 },
  { date: 'Jun 3', users: 2480 },
  { date: 'Jun 7', users: 2720 },
  { date: 'Jun 11', users: 3010 },
  { date: 'Jun 15', users: 3260 },
  { date: 'Jun 19', users: 3540 },
];

export const previewPlatformAnalytics = {
  summary: {
    dailyUsers: 3540,
    weeklyUsers: 18420,
    monthlyUsers: 48630,
    retentionRate: 38.6,
    averageSessionMinutes: 8.4,
    searches: 12780,
  },
  activity: previewActivity,
  viewedStyles: [
    { label: 'Old Money', count: 12840 },
    { label: 'Streetwear', count: 10620 },
    { label: 'Minimalist', count: 9180 },
    { label: 'Business Casual', count: 7340 },
    { label: 'Y2K', count: 5290 },
  ],
  searchedStyles: [
    { label: 'Old Money', count: 4360 },
    { label: 'Summer outfits', count: 3910 },
    { label: 'Date night', count: 3220 },
    { label: 'Quiet luxury', count: 2840 },
    { label: 'Streetwear', count: 2460 },
  ],
  savedStyles: [
    { label: 'Minimalist', count: 2140 },
    { label: 'Old Money', count: 1980 },
    { label: 'Business Casual', count: 1530 },
    { label: 'Streetwear', count: 1310 },
    { label: 'Coastal', count: 870 },
  ],
};

function normalizeRankings(rows = []) {
  return rows.map((row) => ({
    label: row.label ?? row.style ?? row.query ?? 'Uncategorized',
    count: Number(row.count ?? 0),
  }));
}

export function normalizePlatformAnalytics(value) {
  if (!value) return null;
  const summary = value.summary ?? {};
  return {
    summary: {
      dailyUsers: Number(summary.dailyUsers ?? summary.daily_users ?? 0),
      weeklyUsers: Number(summary.weeklyUsers ?? summary.weekly_users ?? 0),
      monthlyUsers: Number(summary.monthlyUsers ?? summary.monthly_users ?? 0),
      retentionRate: Number(summary.retentionRate ?? summary.retention_rate ?? 0),
      averageSessionMinutes: Number(summary.averageSessionMinutes ?? summary.average_session_minutes ?? 0),
      searches: Number(summary.searches ?? 0),
    },
    activity: (value.activity ?? []).map((row) => ({
      date: row.date ?? row.label,
      users: Number(row.users ?? 0),
    })),
    viewedStyles: normalizeRankings(value.viewedStyles ?? value.viewed_styles),
    searchedStyles: normalizeRankings(value.searchedStyles ?? value.searched_styles),
    savedStyles: normalizeRankings(value.savedStyles ?? value.saved_styles),
  };
}

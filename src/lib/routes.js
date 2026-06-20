export const ROUTES = {
  home: '/home',
  search: '/search',
  saved: '/saved',
  profile: '/profile',
  'creator-settings': '/profile/creator',
  creators: '/creators',
  upload: '/creator/upload',
  dashboard: '/creator/dashboard',
  earnings: '/creator/earnings',
  notifications: '/notifications',
  collections: '/creator/collections/manage',
  bag: '/bag',
  checkout: '/checkout',
};

export function buildPath(route, context = {}) {
  if (route === 'creator') return `/creator/${context.username}`;
  if (route === 'closet') return `/creator/${context.username}/closet`;
  if (route === 'fit-check') return `/fit-check/${context.postId}`;
  if (route === 'shop-fit') return `/fit-check/${context.postId}/shop`;
  if (route === 'recreate-fit') return `/fit-check/${context.postId}/recreate`;
  if (route === 'detail') return `/outfit/${context.outfitId}`;
  if (route === 'items') return `/outfit/${context.outfitId}/items`;
  return ROUTES[route] ?? '/home';
}

export function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'profile' && parts[1] === 'creator') return { route: 'creator-settings' };
  if (parts[0] === 'creator' && parts[1] === 'upload') return { route: 'upload' };
  if (parts[0] === 'creator' && parts[1] === 'dashboard') return { route: 'dashboard' };
  if (parts[0] === 'creator' && parts[1] === 'earnings') return { route: 'earnings' };
  if (parts[0] === 'creator' && parts[1] === 'collections' && parts[2] === 'manage') return { route: 'collections' };
  if (parts[0] === 'creator' && parts[1] && parts[2] === 'closet') {
    return { route: 'closet', username: parts[1] };
  }
  if (parts[0] === 'creator' && parts[1]) return { route: 'creator', username: parts[1] };
  if (parts[0] === 'fit-check' && parts[1] && parts[2] === 'shop') {
    return { route: 'shop-fit', postId: parts[1] };
  }
  if (parts[0] === 'fit-check' && parts[1] && parts[2] === 'recreate') {
    return { route: 'recreate-fit', postId: parts[1] };
  }
  if (parts[0] === 'fit-check' && parts[1]) return { route: 'fit-check', postId: parts[1] };
  if (parts[0] === 'outfit' && parts[1] && parts[2] === 'items') {
    return { route: 'items', outfitId: parts[1] };
  }
  if (parts[0] === 'outfit' && parts[1]) return { route: 'detail', outfitId: parts[1] };
  const route = Object.entries(ROUTES).find(([, path]) => path === pathname)?.[0];
  return { route: route ?? 'home' };
}

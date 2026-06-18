import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Compass,
  Heart,
  Home,
  LockKeyhole,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
} from 'lucide-react';
import { outfits, popularSearches, styleCards } from './data/dressiData.js';
import {
  creators as seedCreators,
  creatorPosts as initialCreatorPosts,
  currentCreator,
  getCreator,
  getCreatorPosts,
} from './data/creatorData.js';
import {
  AccountProfile,
  CreatorCloset,
  CreatorDiscovery,
  CreatorFeedCard,
  CreatorProfile,
  CreatorUpload,
  FitCheckDetail,
  RecreateThisFit,
  ShopThisFit,
} from './components/CreatorPlatform.jsx';
import { buildPath, parsePath } from './lib/routes.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import {
  getAccount,
  getSession,
  loadCreatorPlatform,
  onAuthStateChange,
  publishCreatorPost,
  setCreatorFollow,
  setOutfitSaved,
  setPostSaved,
  signIn,
  signOut,
  signUp,
  upgradeAccountToCreator,
} from './services/dressiApi.js';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatPrice(value) {
  return currency.format(value);
}

function getItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function LogoMark({ compact = false }) {
  return (
    <img
      className={compact ? 'logo logo-compact' : 'logo'}
      src="/assets/dressi-icon.png"
      alt="Dressi"
    />
  );
}

function LogoWordmark() {
  return <img className="wordmark" src="/assets/dressi-wordmark.png" alt="Dressi" />;
}

function StatusBar({ dark = false }) {
  return (
    <div className={dark ? 'status-bar dark' : 'status-bar'} aria-hidden="true">
      <span>9:41</span>
      <span />
    </div>
  );
}

function App() {
  const initialPath = parsePath(window.location.pathname);
  const [stage, setStage] = useState(window.location.pathname === '/' ? 'splash' : 'app');
  const [authMode, setAuthMode] = useState('sign-up');
  const [accountType, setAccountType] = useState('shopper');
  const [route, setRoute] = useState(initialPath.route);
  const [selectedOutfitId, setSelectedOutfitId] = useState(initialPath.outfitId ?? outfits[0].id);
  const [selectedCreatorUsername, setSelectedCreatorUsername] = useState(initialPath.username ?? seedCreators[0].username);
  const [selectedPostId, setSelectedPostId] = useState(initialPath.postId ?? initialCreatorPosts[0].id);
  const [creatorPosts, setCreatorPosts] = useState(initialCreatorPosts);
  const [creatorDirectory, setCreatorDirectory] = useState(seedCreators);
  const [followedCreators, setFollowedCreators] = useState(['oldmoneyjake']);
  const [savedPostIds, setSavedPostIds] = useState(['spring-city-fit']);
  const [savedIds, setSavedIds] = useState([outfits[0].id, outfits[2].id]);
  const [bagItems, setBagItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [backendState, setBackendState] = useState(isSupabaseConfigured ? 'loading' : 'mock');
  const [appNotice, setAppNotice] = useState('');
  const [authFeedback, setAuthFeedback] = useState({ error: '', message: '', loading: false });
  const [isPublishing, setIsPublishing] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState({
    preference: 'All',
    budget: 'Mixed',
    fit: 'No preference',
    occasion: 'Everyday',
    styles: ['Old Money', 'Minimalist', 'Business Casual'],
    colors: ['Neutrals', 'Dark tones', 'Monochrome'],
  });

  const selectedOutfit = useMemo(
    () => outfits.find((outfit) => outfit.id === selectedOutfitId) ?? outfits[0],
    [selectedOutfitId],
  );

  const savedOutfits = useMemo(
    () => outfits.filter((outfit) => savedIds.includes(outfit.id)),
    [savedIds],
  );

  const selectedPost = useMemo(
    () => creatorPosts.find((post) => post.id === selectedPostId) ?? creatorPosts[0],
    [creatorPosts, selectedPostId],
  );

  const selectedCreator = useMemo(
    () => creatorDirectory.find((creator) => creator.username === selectedCreatorUsername) ?? getCreator(selectedCreatorUsername),
    [creatorDirectory, selectedCreatorUsername],
  );

  const selectedPostCreator = useMemo(
    () => creatorDirectory.find((creator) => creator.username === selectedPost.creatorUsername) ?? getCreator(selectedPost.creatorUsername),
    [creatorDirectory, selectedPost],
  );

  const accountCreator = useMemo(() => {
    const persistedCreator = creatorDirectory.find((creator) => creator.userId === session?.user?.id);
    if (persistedCreator) return persistedCreator;
    return {
      ...currentCreator,
      displayName: account?.profile?.display_name ?? currentCreator.displayName,
      avatar: account?.profile?.avatar_url ?? currentCreator.avatar,
      outfitPosts: getCreatorPosts(currentCreator.username, creatorPosts).length,
    };
  }, [account, creatorDirectory, creatorPosts, session]);

  const bagSubtotal = getItemsTotal(bagItems);
  const bagShipping = bagItems.length ? 12 : 0;
  const bagTax = bagSubtotal * 0.0825;
  const bagService = bagItems.length ? 4.95 : 0;
  const bagTotal = bagSubtotal + bagShipping + bagTax + bagService;

  async function refreshBackendData(activeSession = session) {
    if (!isSupabaseConfigured) return;
    setBackendState('loading');
    try {
      const platform = await loadCreatorPlatform(activeSession?.user?.id);
      const liveUsernames = new Set(platform.creators.map((creator) => creator.username));
      const livePostIds = new Set(platform.posts.map((post) => post.id));
      setCreatorDirectory([
        ...platform.creators,
        ...seedCreators.filter((creator) => !liveUsernames.has(creator.username)),
      ]);
      setCreatorPosts([
        ...platform.posts,
        ...initialCreatorPosts.filter((post) => !livePostIds.has(post.id)),
      ]);
      setFollowedCreators(platform.followedUsernames);
      setSavedPostIds(platform.savedPostIds);
      setSavedIds(platform.savedOutfitIds);

      if (activeSession?.user?.id) {
        const nextAccount = await getAccount(activeSession.user.id);
        setAccount(nextAccount);
        setAccountType(nextAccount.profile.account_type);
      } else {
        setAccount(null);
      }
      setBackendState('live');
    } catch (error) {
      setBackendState('error');
      setAppNotice(error.message);
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;

    getSession()
      .then((currentSession) => {
        if (!active) return;
        setSession(currentSession);
        return refreshBackendData(currentSession);
      })
      .catch((error) => {
        if (!active) return;
        setBackendState('error');
        setAppNotice(error.message);
      });

    const { data } = onAuthStateChange((nextSession) => {
      if (!active) return;
      setSession(nextSession);
      refreshBackendData(nextSession);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      const next = parsePath(window.location.pathname);
      setRoute(next.route);
      if (next.outfitId) setSelectedOutfitId(next.outfitId);
      if (next.username) setSelectedCreatorUsername(next.username);
      if (next.postId) setSelectedPostId(next.postId);
      setStage('app');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextRoute, context = {}, replace = false) {
    const nextContext = {
      outfitId: context.outfitId ?? selectedOutfitId,
      username: context.username ?? selectedCreatorUsername,
      postId: context.postId ?? selectedPostId,
    };
    if (context.outfitId) setSelectedOutfitId(context.outfitId);
    if (context.username) setSelectedCreatorUsername(context.username);
    if (context.postId) setSelectedPostId(context.postId);
    setRoute(nextRoute);
    const path = buildPath(nextRoute, nextContext);
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (route === 'shop-fit' || route === 'recreate-fit') {
      navigate('fit-check', { postId: selectedPostId });
    } else if (route === 'fit-check') {
      navigate('creator', { username: selectedPost.creatorUsername });
    } else if (route === 'closet') {
      navigate('creator', { username: selectedCreatorUsername });
    } else if (route === 'items') {
      navigate('detail', { outfitId: selectedOutfitId });
    } else {
      navigate('home');
    }
  }

  function openOutfit(outfitId, nextRoute = 'detail') {
    navigate(nextRoute, { outfitId });
  }

  async function toggleSave(outfitId) {
    const wasSaved = savedIds.includes(outfitId);
    if (isSupabaseConfigured && !session) {
      setAuthMode('log-in');
      setStage('auth');
      setAuthFeedback({ error: '', message: 'Log in to save outfits.', loading: false });
      return;
    }
    setSavedIds((current) => wasSaved
      ? current.filter((id) => id !== outfitId)
      : [...current, outfitId]);
    if (!isSupabaseConfigured) return;
    try {
      await setOutfitSaved({ userId: session.user.id, outfitId, saved: !wasSaved });
    } catch (error) {
      setSavedIds((current) => wasSaved
        ? [...current, outfitId]
        : current.filter((id) => id !== outfitId));
      setAppNotice(error.message);
    }
  }

  async function toggleCreatorFollow(username) {
    const wasFollowing = followedCreators.includes(username);
    if (isSupabaseConfigured && !session) {
      setAuthMode('log-in');
      setStage('auth');
      setAuthFeedback({ error: '', message: 'Log in to follow creators.', loading: false });
      return;
    }
    setFollowedCreators((current) => wasFollowing
      ? current.filter((item) => item !== username)
      : [...current, username]);
    if (!isSupabaseConfigured) return;
    try {
      const creator = creatorDirectory.find((item) => item.username === username);
      await setCreatorFollow({ userId: session.user.id, creatorId: creator?.id, following: !wasFollowing });
    } catch (error) {
      setFollowedCreators((current) => wasFollowing
        ? [...current, username]
        : current.filter((item) => item !== username));
      setAppNotice(error.message);
    }
  }

  async function togglePostSave(postId) {
    const wasSaved = savedPostIds.includes(postId);
    if (isSupabaseConfigured && !session) {
      setAuthMode('log-in');
      setStage('auth');
      setAuthFeedback({ error: '', message: 'Log in to save creator fits.', loading: false });
      return;
    }
    setSavedPostIds((current) => wasSaved
      ? current.filter((item) => item !== postId)
      : [...current, postId]);
    if (!isSupabaseConfigured) return;
    try {
      await setPostSaved({ userId: session.user.id, postId, saved: !wasSaved });
    } catch (error) {
      setSavedPostIds((current) => wasSaved
        ? [...current, postId]
        : current.filter((item) => item !== postId));
      setAppNotice(error.message);
    }
  }

  async function handleAuthSubmit(credentials) {
    if (!isSupabaseConfigured) {
      setStage('onboarding');
      return;
    }
    setAuthFeedback({ error: '', message: '', loading: true });
    try {
      if (authMode === 'sign-up') {
        const result = await signUp({ ...credentials, accountType });
        if (!result.session) {
          setAuthFeedback({ error: '', message: 'Check your email to confirm your Dressi account, then log in.', loading: false });
          return;
        }
        setSession(result.session);
        await refreshBackendData(result.session);
        setStage('onboarding');
      } else {
        const result = await signIn(credentials);
        setSession(result.session);
        await refreshBackendData(result.session);
        setStage('app');
        navigate('home', {}, true);
      }
      setAuthFeedback({ error: '', message: '', loading: false });
    } catch (error) {
      setAuthFeedback({ error: error.message, message: '', loading: false });
    }
  }

  async function handleUpgradeAccount() {
    if (!isSupabaseConfigured) {
      setAccountType('creator');
      return;
    }
    if (!session) {
      setAuthMode('log-in');
      setStage('auth');
      setAuthFeedback({ error: '', message: 'Log in before upgrading to a creator account.', loading: false });
      return;
    }
    try {
      await upgradeAccountToCreator(session.user.id, {
        username: accountCreator.username,
        bio: accountCreator.bio,
        location: accountCreator.location,
        styleCategories: accountCreator.tags,
        coverUrl: accountCreator.cover,
      });
      setAccountType('creator');
      await refreshBackendData(session);
    } catch (error) {
      setAppNotice(error.message);
    }
  }

  async function handlePublishPost(post, mediaFiles) {
    if (!isSupabaseConfigured) {
      setCreatorPosts((current) => [post, ...current]);
      setSelectedCreatorUsername(currentCreator.username);
      navigate('creator', { username: currentCreator.username });
      return;
    }
    if (!session) {
      setAuthMode('log-in');
      setStage('auth');
      return;
    }
    setIsPublishing(true);
    try {
      await publishCreatorPost({ userId: session.user.id, post, mediaFiles });
      await refreshBackendData(session);
      const refreshedAccount = await getAccount(session.user.id);
      setAccount(refreshedAccount);
      navigate('creator', { username: refreshedAccount.creator.username });
    } catch (error) {
      setAppNotice(error.message);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSignOut() {
    if (isSupabaseConfigured) await signOut();
    setSession(null);
    setAccount(null);
    setAccountType('shopper');
    setStage('splash');
    window.history.replaceState({}, '', '/');
  }

  function openCreator(username) {
    navigate('creator', { username });
  }

  function openPost(postId) {
    navigate('fit-check', { postId });
  }

  function addOutfitToBag(outfit = selectedOutfit) {
    addProductsToBag(outfit.items, outfit.id);
  }

  function addProductsToBag(products, sourceId) {
    setBagItems(products.map((item) => ({
      ...item,
      outfitId: sourceId,
      quantity: 1,
      selectedSize: item.sizes?.[0] ?? 'One size',
      sizes: item.sizes ?? ['One size'],
    })));
    setOrderPlaced(false);
    navigate('bag');
  }

  function addClosetItemToBag(item) {
    setBagItems((current) => [
      ...current.filter((bagItem) => bagItem.id !== item.id),
      { ...item, outfitId: `closet-${selectedCreatorUsername}`, quantity: 1, selectedSize: item.sizes?.[0] ?? 'One size', sizes: item.sizes ?? ['One size'] },
    ]);
    setOrderPlaced(false);
    navigate('bag');
  }

  function updateBagItem(itemId, changes) {
    setBagItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...changes } : item)),
    );
  }

  function removeBagItem(itemId) {
    setBagItems((current) => current.filter((item) => item.id !== itemId));
  }

  if (stage === 'splash') {
    return (
      <SplashScreen
        onStart={() => setStage('onboarding')}
        onLogin={() => setStage('auth')}
      />
    );
  }

  if (stage === 'auth') {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        accountType={accountType}
        setAccountType={setAccountType}
        feedback={authFeedback}
        onContinue={handleAuthSubmit}
        onGuest={() => setStage('onboarding')}
        onBack={() => setStage('splash')}
      />
    );
  }

  if (stage === 'onboarding') {
    return (
      <Onboarding
        answers={onboardingAnswers}
        setAnswers={setOnboardingAnswers}
        onComplete={() => {
          setStage('app');
          navigate('home', {}, true);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <AppHeader route={route} onBack={goBack} onOpenBag={() => navigate('bag')} bagCount={bagItems.length} />
      <main className="screen">
        {appNotice && (
          <button className="app-notice" onClick={() => setAppNotice('')} type="button">
            <span>{appNotice}</span>
            <strong>Dismiss</strong>
          </button>
        )}
        {route === 'home' && (
          <HomeFeed
            savedIds={savedIds}
            toggleSave={toggleSave}
            openOutfit={openOutfit}
            addOutfitToBag={addOutfitToBag}
            preferences={onboardingAnswers}
            creatorPosts={creatorPosts}
            creators={creatorDirectory}
            followedCreators={followedCreators}
            savedPostIds={savedPostIds}
            toggleCreatorFollow={toggleCreatorFollow}
            togglePostSave={togglePostSave}
            openCreator={openCreator}
            openPost={openPost}
            shopPost={(postId) => navigate('shop-fit', { postId })}
            discoverCreators={() => navigate('creators')}
          />
        )}
        {route === 'search' && <SearchStyles openOutfit={openOutfit} onDiscoverCreators={() => navigate('creators')} />}
        {route === 'saved' && (
          <SavedOutfits
            savedOutfits={savedOutfits}
            openOutfit={openOutfit}
            toggleSave={toggleSave}
            savedPosts={creatorPosts.filter((post) => savedPostIds.includes(post.id))}
            openPost={openPost}
          />
        )}
        {route === 'detail' && (
          <OutfitDetail
            outfit={selectedOutfit}
            isSaved={savedIds.includes(selectedOutfit.id)}
            toggleSave={toggleSave}
            addOutfitToBag={addOutfitToBag}
            onViewItems={() => navigate('items', { outfitId: selectedOutfitId })}
          />
        )}
        {route === 'items' && (
          <ItemsInOutfit
            outfit={selectedOutfit}
            addOutfitToBag={addOutfitToBag}
            toggleSave={toggleSave}
            isSaved={savedIds.includes(selectedOutfit.id)}
          />
        )}
        {route === 'bag' && (
          <BagPage
            items={bagItems}
            subtotal={bagSubtotal}
            shipping={bagShipping}
            tax={bagTax}
            service={bagService}
            total={bagTotal}
            updateBagItem={updateBagItem}
            removeBagItem={removeBagItem}
            onFindOutfits={() => navigate('home')}
            onCheckout={() => navigate('checkout')}
          />
        )}
        {route === 'checkout' && (
          <CheckoutPage
            items={bagItems}
            subtotal={bagSubtotal}
            shipping={bagShipping}
            tax={bagTax}
            service={bagService}
            total={bagTotal}
            orderPlaced={orderPlaced}
            onPlaceOrder={() => setOrderPlaced(true)}
            onContinue={() => {
              setOrderPlaced(false);
              setBagItems([]);
              navigate('home');
            }}
          />
        )}
        {route === 'creators' && (
          <CreatorDiscovery
            creators={creatorDirectory}
            posts={creatorPosts}
            followed={followedCreators}
            onToggleFollow={toggleCreatorFollow}
            onOpenCreator={openCreator}
            onOpenPost={openPost}
          />
        )}
        {route === 'creator' && (
          <CreatorProfile
            creator={selectedCreator}
            posts={getCreatorPosts(selectedCreator.username, creatorPosts)}
            followed={followedCreators.includes(selectedCreator.username)}
            onToggleFollow={toggleCreatorFollow}
            onOpenPost={openPost}
            onOpenCloset={(username) => navigate('closet', { username })}
            onShop={(postId) => navigate('shop-fit', { postId })}
          />
        )}
        {route === 'fit-check' && (
          <FitCheckDetail
            post={selectedPost}
            creator={selectedPostCreator}
            isSaved={savedPostIds.includes(selectedPost.id)}
            isFollowed={followedCreators.includes(selectedPostCreator.username)}
            onToggleSave={togglePostSave}
            onToggleFollow={toggleCreatorFollow}
            onOpenCreator={openCreator}
            onShop={(postId) => navigate('shop-fit', { postId })}
            onRecreate={(postId) => navigate('recreate-fit', { postId })}
          />
        )}
        {route === 'shop-fit' && (
          <ShopThisFit
            post={selectedPost}
            creator={selectedPostCreator}
            isSaved={savedPostIds.includes(selectedPost.id)}
            onToggleSave={togglePostSave}
            onAddAll={addProductsToBag}
            onRecreate={(postId) => navigate('recreate-fit', { postId })}
          />
        )}
        {route === 'recreate-fit' && (
          <RecreateThisFit post={selectedPost} creator={selectedPostCreator} onAddAll={addProductsToBag} />
        )}
        {route === 'closet' && (
          <CreatorCloset
            creator={selectedCreator}
            posts={creatorPosts}
            onShopItem={addClosetItemToBag}
          />
        )}
        {route === 'upload' && (
          <CreatorUpload
            creator={accountCreator}
            accountType={accountType}
            isPublishing={isPublishing}
            onUpgrade={handleUpgradeAccount}
            onPublish={handlePublishPost}
            onCancel={() => navigate('profile')}
          />
        )}
        {route === 'profile' && (
          <AccountProfile
            accountType={accountType}
            creator={accountCreator}
            followedCount={followedCreators.length}
            onUpgrade={handleUpgradeAccount}
            onOpenCreator={openCreator}
            onUpload={() => navigate('upload')}
            onDiscover={() => navigate('creators')}
            onSignOut={session ? handleSignOut : null}
          />
        )}
      </main>
      <BottomNav route={route} navigate={navigate} bagCount={bagItems.length} />
    </div>
  );
}

function SplashScreen({ onStart, onLogin }) {
  const splashImages = ['/assets/old-money-collage.png', ...outfits.slice(1, 5).map((outfit) => outfit.image)];

  return (
    <main className="auth-shell splash-screen">
      <StatusBar dark />
      <section className="hero-panel">
        <LogoMark compact />
        <div className="hero-copyblock">
          <h1>Find your vibe. Shop the look.</h1>
          <p className="hero-copy">
            AI-powered outfit inspiration tailored to you.
          </p>
        </div>
        <div className="hero-collage" aria-hidden="true">
          {splashImages.map((image) => (
            <img src={image} alt="" key={image} />
          ))}
        </div>
        <div className="hero-overlay">
          <div className="hero-actions">
            <button className="primary-button inverse" onClick={onStart}>
              Get Started <ChevronRight size={18} />
            </button>
            <button className="text-button light" onClick={onLogin}>
              Already have an account? <span>Log in</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthScreen({ mode, setMode, accountType, setAccountType, feedback, onContinue, onGuest, onBack }) {
  const isSignUp = mode === 'sign-up';
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit(event) {
    event.preventDefault();
    onContinue({ name, username, email, password });
  }

  return (
    <main className="auth-shell auth-screen">
      <StatusBar />
      <button className="icon-button floating-back" onClick={onBack} aria-label="Back to welcome">
        <ArrowLeft size={19} />
      </button>
      <section className="auth-card">
        <LogoWordmark />
        <div>
          <p className="eyebrow">Welcome to Dressi</p>
          <h1>{isSignUp ? 'Create your style profile.' : 'Log back in.'}</h1>
        </div>
        <div className="segmented" role="tablist" aria-label="Authentication mode">
          <button
            className={isSignUp ? 'active' : ''}
            onClick={() => setMode('sign-up')}
            type="button"
          >
            Sign up
          </button>
          <button
            className={!isSignUp ? 'active' : ''}
            onClick={() => setMode('log-in')}
            type="button"
          >
            Log in
          </button>
        </div>
        <form className="form-stack" onSubmit={submit}>
          {isSignUp && (
            <div>
              <span className="field-label">Account type</span>
              <div className="segmented account-type-control">
                <button className={accountType === 'shopper' ? 'active' : ''} onClick={() => setAccountType('shopper')} type="button">
                  <UserRound size={15} /> Shopper
                </button>
                <button className={accountType === 'creator' ? 'active' : ''} onClick={() => setAccountType('creator')} type="button">
                  <Sparkles size={15} /> Creator
                </button>
              </div>
            </div>
          )}
          {isSignUp && (
            <label>
              Name
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required />
            </label>
          )}
          {isSignUp && accountType === 'creator' && (
            <label>
              Creator username
              <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="alexstyles" pattern="[A-Za-z0-9_]{3,24}" required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@dressi.app" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength="8" required />
          </label>
          <div className="auth-note">
            <ShieldCheck size={16} />
            Secure profile setup. Payment details are only collected at checkout.
          </div>
          {feedback.error && <div className="inline-notice error">{feedback.error}</div>}
          {feedback.message && <div className="inline-notice">{feedback.message}</div>}
          <button className="primary-button full" type="submit" disabled={feedback.loading}>
            {feedback.loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Log in'}
          </button>
          <button className="text-button" onClick={onGuest} type="button">
            Continue as guest
          </button>
          {!isSignUp && (
            <button className="text-button muted" type="button">
              Forgot password?
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

function Onboarding({ answers, setAnswers, onComplete }) {
  function toggleList(key, value) {
    setAnswers((current) => {
      const next = current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value];
      return { ...current, [key]: next };
    });
  }

  return (
    <main className="auth-shell onboarding-screen">
      <StatusBar />
      <section className="onboarding-card">
        <div className="onboarding-nav">
          <button className="nav-icon-button" type="button" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="step-dashes" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <section className="style-vibe-copy">
          <h1>What's your style vibe?</h1>
          <p>Choose all that inspire you</p>
        </section>
        <section className="style-choice-grid">
          {styleCards.slice(0, 6).map((style) => (
            <button
              className={answers.styles.includes(style.title) ? 'style-choice selected' : 'style-choice'}
              key={style.id}
              onClick={() => toggleList('styles', style.title)}
              type="button"
            >
              <img src={style.image} alt={style.title} />
              <span>{style.title}</span>
              {answers.styles.includes(style.title) && <CheckCircle2 size={20} />}
            </button>
          ))}
        </section>
        <button className="primary-button full onboarding-continue" onClick={onComplete}>
          Continue
        </button>
      </section>
    </main>
  );
}

function AppHeader({ route, onBack, onOpenBag, bagCount }) {
  const detailRoutes = ['detail', 'items', 'bag', 'checkout', 'creator', 'fit-check', 'shop-fit', 'recreate-fit', 'closet', 'upload', 'creators'];
  const titles = {
    home: '',
    search: 'Search',
    saved: 'Saved',
    detail: 'Outfit Details',
    items: 'Items in Outfit',
    bag: `Your Bag${bagCount ? ` (${bagCount})` : ''}`,
    checkout: 'Secure Checkout',
    creators: 'Creators',
    creator: 'Creator Profile',
    'fit-check': 'Fit Check',
    'shop-fit': 'Shop This Fit',
    'recreate-fit': 'Recreate This Fit',
    closet: 'Creator Closet',
    upload: 'Create',
    profile: 'Profile',
  };

  return (
    <header className="app-header">
      <StatusBar />
      <div className="app-nav-row">
        {detailRoutes.includes(route) ? (
          <button className="nav-icon-button" onClick={onBack} aria-label="Back to home">
            <ArrowLeft size={19} />
          </button>
        ) : (
          <LogoMark compact />
        )}
        {route === 'home' ? <span /> : <h1>{titles[route]}</h1>}
        <button className="nav-icon-button" onClick={onOpenBag} aria-label={`${bagCount} bag items`} type="button">
          {route === 'home' ? <Bell size={18} /> : <ShoppingBag size={18} />}
          {bagCount > 0 && <i>{bagCount}</i>}
        </button>
      </div>
    </header>
  );
}

function HomeFeed({
  savedIds,
  toggleSave,
  openOutfit,
  addOutfitToBag,
  preferences,
  creatorPosts,
  creators,
  followedCreators,
  savedPostIds,
  toggleCreatorFollow,
  togglePostSave,
  openCreator,
  openPost,
  shopPost,
  discoverCreators,
}) {
  const [activeTab, setActiveTab] = useState('For You');
  const feedTabs = ['For You', 'Following', 'Trending'];
  const featured = outfits.find((outfit) => outfit.tags.some((tag) => preferences.styles.includes(tag))) ?? outfits[0];
  const visibleCreatorPosts = [...creatorPosts]
    .filter((post) => activeTab !== 'Following' || followedCreators.includes(post.creatorUsername))
    .sort((a, b) => activeTab === 'Trending' ? b.likes - a.likes : 0);

  return (
    <section className="page-stack">
      <label className="search-bar home-search">
        <Search size={17} />
        <input placeholder="Search styles, brands, items..." />
      </label>
      <div className="tabs horizontal-scroll">
        {feedTabs.map((tab) => (
          <button
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Following' && !visibleCreatorPosts.length && (
        <EmptyState title="Your following feed is quiet." copy="Follow creators to fill this feed with their newest fit checks." action="Discover creators" onAction={discoverCreators} />
      )}
      {visibleCreatorPosts.slice(0, activeTab === 'For You' ? 2 : undefined).map((post) => (
        <CreatorFeedCard
          post={post}
          creator={creators.find((creator) => creator.username === post.creatorUsername) ?? getCreator(post.creatorUsername)}
          key={post.id}
          isFollowed={followedCreators.includes(post.creatorUsername)}
          isSaved={savedPostIds.includes(post.id)}
          onToggleFollow={toggleCreatorFollow}
          onToggleSave={togglePostSave}
          onOpenCreator={openCreator}
          onOpenPost={openPost}
          onShop={shopPost}
        />
      ))}
      {activeTab === 'For You' && (
        <>
          <div className="feed-divider"><span>Styled by Dressi AI</span></div>
          <OutfitCard
            outfit={featured}
            isSaved={savedIds.includes(featured.id)}
            toggleSave={toggleSave}
            openOutfit={openOutfit}
            addOutfitToBag={addOutfitToBag}
            featured
          />
          {outfits.filter((outfit) => outfit.id !== featured.id).slice(0, 2).map((outfit) => (
            <OutfitCard
              outfit={outfit}
              key={outfit.id}
              isSaved={savedIds.includes(outfit.id)}
              toggleSave={toggleSave}
              openOutfit={openOutfit}
              addOutfitToBag={addOutfitToBag}
            />
          ))}
        </>
      )}
    </section>
  );
}

function OutfitCard({ outfit, isSaved, toggleSave, openOutfit, addOutfitToBag, featured = false }) {
  return (
    <article className={featured ? 'outfit-card featured' : 'outfit-card'}>
      <button className="image-button outfit-image-wrap" onClick={() => openOutfit(outfit.id)} type="button">
        <img src={outfit.image} alt={`${outfit.title} outfit inspiration`} />
        <div className="action-rail" aria-hidden="true">
          <span>
            <Heart size={18} fill="currentColor" />
            {outfit.likes}
          </span>
          <span>
            <Bookmark size={18} fill="currentColor" />
            {outfit.saves}
          </span>
          <span>
            <ShoppingBag size={18} />
          </span>
        </div>
        <div className="feed-overlay">
          <span className="ai-chip">
            <LogoMark compact /> {outfit.creator}
          </span>
          <h3>{outfit.title}</h3>
          <div className="tag-row">
            {outfit.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </button>
      <div className="outfit-card-body">
        <div className="outfit-card-title">
          <div>
            <p>{outfit.items.length} items ready to shop</p>
            <h3>{formatPrice(outfit.priceEstimate)}</h3>
          </div>
          <button
            className={isSaved ? 'icon-button saved' : 'icon-button'}
            onClick={() => toggleSave(outfit.id)}
            aria-label={isSaved ? 'Remove saved outfit' : 'Save outfit'}
          >
            <Heart size={19} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="product-strip">
          {outfit.items.slice(0, 5).map((item) => (
            <img src={item.image} alt={item.name} key={item.id} />
          ))}
        </div>
        <div className="card-actions">
          <button className="primary-button" onClick={() => addOutfitToBag(outfit)} type="button">
            Buy Entire Look
          </button>
          <button className="secondary-button" onClick={() => openOutfit(outfit.id)} type="button">
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

function SearchStyles({ openOutfit, onDiscoverCreators }) {
  const [query, setQuery] = useState('');
  const filteredOutfits = outfits.filter((outfit) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return [outfit.title, outfit.occasion, outfit.season, ...outfit.tags]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <section className="page-stack">
      <label className="search-bar">
        <Search size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search styles, brands, items..."
        />
      </label>
      <button className="creator-search-banner" onClick={onDiscoverCreators} type="button">
        <span><Compass size={20} /></span>
        <div><p className="eyebrow">Creator discovery</p><strong>Find people who dress like you</strong><small>Browse fit checks, closets, and style communities</small></div>
        <ChevronRight size={18} />
      </button>
      <section>
        <div className="section-heading">
          <h2>Popular searches</h2>
        </div>
        <div className="chip-row horizontal-scroll">
          {popularSearches.map((search) => (
            <button className="chip" key={search} onClick={() => setQuery(search)} type="button">
              {search}
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Style worlds</h2>
        </div>
        <div className="style-grid">
          {styleCards.map((style) => (
            <button
              className="style-card"
              key={style.id}
              onClick={() => setQuery(style.title)}
              type="button"
            >
              <img src={style.image} alt={`${style.title} style`} />
              <span>
                <strong>{style.title}</strong>
                <small>{style.count}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="results-section">
        <div className="section-heading">
          <h2>{query ? `${filteredOutfits.length} matching looks` : 'Outfit results'}</h2>
          <button className="filter-button" type="button">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
        <div className="outfit-grid">
          {filteredOutfits.map((outfit) => (
            <button className="mini-outfit" key={outfit.id} onClick={() => openOutfit(outfit.id)}>
              <img src={outfit.image} alt={outfit.title} />
              <span>{outfit.title}</span>
              <small>{formatPrice(outfit.priceEstimate)}</small>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function SavedOutfits({ savedOutfits, openOutfit, toggleSave, savedPosts, openPost }) {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Creator Fits', 'Looks', 'Purchased'];

  return (
    <section className="page-stack">
      <div className="tabs horizontal-scroll">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab ? 'active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <section className="collections-strip">
        {['Summer Fits', 'Work Looks', 'Date Night', 'Vacation', 'Wishlist'].map((collection) => (
          <button key={collection} type="button">
            {collection}
          </button>
        ))}
      </section>
      {(activeTab === 'All' || activeTab === 'Creator Fits') && savedPosts.length > 0 && (
        <section>
          <div className="section-heading"><h2>Saved creator fits</h2><span>{savedPosts.length}</span></div>
          <div className="saved-creator-grid">
            {savedPosts.map((post) => (
              <button onClick={() => openPost(post.id)} key={post.id} type="button">
                <img src={post.image} alt={post.title} />
                <span><small>@{post.creatorUsername}</small><strong>{post.title}</strong></span>
              </button>
            ))}
          </div>
        </section>
      )}
      {(activeTab === 'All' || activeTab === 'Looks') && savedOutfits.length ? (
        <div className="saved-grid">
          {savedOutfits.map((outfit) => (
            <article className="saved-card" key={outfit.id}>
              <button onClick={() => openOutfit(outfit.id)} type="button">
                <img src={outfit.image} alt={outfit.title} />
              </button>
              <div>
                <p>{outfit.creator}</p>
                <h3>{outfit.title}</h3>
                <span>{formatPrice(outfit.priceEstimate)}</span>
              </div>
              <button className="text-button remove" onClick={() => toggleSave(outfit.id)} type="button">
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : activeTab !== 'Creator Fits' && !savedPosts.length ? (
        <EmptyState
          title="You have not saved any looks yet."
          copy="Build a wardrobe board by saving outfits from your feed."
          action="Explore outfits"
          onAction={() => openOutfit(outfits[0].id, 'home')}
        />
      ) : null}
    </section>
  );
}

function OutfitDetail({ outfit, isSaved, toggleSave, addOutfitToBag, onViewItems }) {
  return (
    <article className="detail-page">
      <img className="detail-hero" src={outfit.image} alt={`${outfit.title} outfit`} />
      <section className="detail-content">
        <div className="detail-title">
          <div>
            <p className="eyebrow">{outfit.creator}</p>
            <h2>{outfit.title}</h2>
          </div>
          <button
            className={isSaved ? 'icon-button saved' : 'icon-button'}
            onClick={() => toggleSave(outfit.id)}
            aria-label={isSaved ? 'Remove saved outfit' : 'Save outfit'}
          >
            <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p className="detail-copy">{outfit.description}</p>
        <div className="tag-row">
          {outfit.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="stats-grid">
          <span>
            <strong>{formatPrice(outfit.priceEstimate)}</strong>
            Estimate
          </span>
          <span>
            <strong>{outfit.items.length}</strong>
            Items
          </span>
          <span>
            <strong>{outfit.likes}</strong>
            Likes
          </span>
        </div>
        <section className="info-list">
          <div>
            <span>Occasion</span>
            <strong>{outfit.occasion}</strong>
          </div>
          <div>
            <span>Season</span>
            <strong>{outfit.season}</strong>
          </div>
          <div>
            <span>Breakdown</span>
            <strong>{outfit.items.map((item) => item.category).join(', ')}</strong>
          </div>
        </section>
        <div className="sticky-actions">
          <button className="primary-button" onClick={() => addOutfitToBag(outfit)} type="button">
            Shop Entire Outfit
          </button>
          <button className="secondary-button" onClick={onViewItems} type="button">
            View Items
          </button>
        </div>
      </section>
    </article>
  );
}

function ItemsInOutfit({ outfit, addOutfitToBag, toggleSave, isSaved }) {
  const subtotal = outfit.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = 12;
  const tax = subtotal * 0.0825;

  return (
    <section className="page-stack">
      <section className="compact-outfit-summary">
        <img src={outfit.image} alt={outfit.title} />
        <div>
          <p className="eyebrow">Items in this outfit</p>
          <h2>{outfit.title}</h2>
          <p>{outfit.items.length} verified partner items</p>
        </div>
      </section>
      <div className="item-list">
        {outfit.items.map((item) => (
          <ProductRow item={item} key={item.id} />
        ))}
      </div>
      <PriceSummary subtotal={subtotal} shipping={shipping} tax={tax} service={0} />
      <div className="sticky-actions">
        <button className="primary-button" onClick={() => addOutfitToBag(outfit)} type="button">
          Add All to Bag
        </button>
        <button className="secondary-button" onClick={() => toggleSave(outfit.id)} type="button">
          {isSaved ? 'Saved' : 'Save Outfit'}
        </button>
      </div>
    </section>
  );
}

function ProductRow({ item }) {
  return (
    <article className="product-row">
      <img src={item.image} alt={`${item.brand} ${item.name}`} />
      <div className="product-info">
        <span>{item.category}</span>
        <h3>{item.brand}</h3>
        <p>{item.name}</p>
        <small>
          {item.color} / {item.retailer} / {item.availability}
        </small>
        <label>
          Size
          <select defaultValue={item.sizes[0]}>
            {item.sizes.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>
      <strong>{formatPrice(item.price)}</strong>
    </article>
  );
}

function BagPage({
  items,
  subtotal,
  shipping,
  tax,
  service,
  total,
  updateBagItem,
  removeBagItem,
  onFindOutfits,
  onCheckout,
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty."
        copy="Find a complete look and add every item in one tap."
        action="Find outfits"
        onAction={onFindOutfits}
      />
    );
  }

  return (
    <section className="page-stack">
      <section className="trust-banner">
        <BadgeCheck size={20} />
        <p>All items are fulfilled by verified retail partners. Dressi lets you checkout in one simple experience.</p>
      </section>
      <div className="item-list">
        {items.map((item) => (
          <article className="bag-row" key={item.id}>
            <img src={item.image} alt={`${item.brand} ${item.name}`} />
            <div>
              <h3>{item.name}</h3>
              <p>
                {item.brand} / {item.retailer}
              </p>
              <div className="bag-controls">
                <select
                  value={item.selectedSize}
                  onChange={(event) => updateBagItem(item.id, { selectedSize: event.target.value })}
                  aria-label={`Size for ${item.name}`}
                >
                  {item.sizes.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
                <div className="stepper">
                  <button
                    onClick={() =>
                      updateBagItem(item.id, { quantity: Math.max(1, item.quantity - 1) })
                    }
                    aria-label={`Decrease ${item.name} quantity`}
                    type="button"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateBagItem(item.id, { quantity: item.quantity + 1 })}
                    aria-label={`Increase ${item.name} quantity`}
                    type="button"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="bag-price">
              <strong>{formatPrice(item.price * item.quantity)}</strong>
              <button onClick={() => removeBagItem(item.id)} aria-label={`Remove ${item.name}`} type="button">
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <label className="promo-field">
        Promo code
        <input placeholder="DRESSI10" />
      </label>
      <PriceSummary subtotal={subtotal} shipping={shipping} tax={tax} service={service} total={total} />
      <section className="delivery-note">
        <Truck size={19} />
        <span>Items may ship from multiple verified retail partners. Track everything in one place.</span>
      </section>
      <button className="primary-button full sticky-cta" onClick={onCheckout}>
        Checkout Securely
      </button>
    </section>
  );
}

function CheckoutPage({
  items,
  subtotal,
  shipping,
  tax,
  service,
  total,
  orderPlaced,
  onPlaceOrder,
  onContinue,
}) {
  if (orderPlaced) {
    return (
      <section className="confirmation">
        <CheckCircle2 size={58} />
        <p className="eyebrow">Order DRS-1048</p>
        <h2>Order Confirmed</h2>
        <p>
          Dressi handles the rest. Your items are being routed through verified retail partners.
        </p>
        <div className="thumbnail-row">
          {items.slice(0, 5).map((item) => (
            <img src={item.image} alt={item.name} key={item.id} />
          ))}
        </div>
        <button className="primary-button full" onClick={onContinue}>
          Continue shopping
        </button>
      </section>
    );
  }

  return (
    <section className="page-stack checkout-page">
      <section className="checkout-trust">
        {[
          ['Secure payments', LockKeyhole],
          ['Verified partners', BadgeCheck],
          ['Easy returns', ShieldCheck],
        ].map(([label, Icon]) => (
          <span key={label}>
            <Icon size={16} />
            {label}
          </span>
        ))}
      </section>
      <form className="checkout-form" onSubmit={(event) => event.preventDefault()}>
        <CheckoutSection title="Shipping address">
          <label>
            Full name
            <input placeholder="Alex Morgan" />
          </label>
          <label>
            Address
            <input placeholder="123 Style Ave" />
          </label>
          <div className="two-col">
            <label>
              City
              <input placeholder="Chicago" />
            </label>
            <label>
              ZIP
              <input placeholder="60601" />
            </label>
          </div>
        </CheckoutSection>
        <CheckoutSection title="Contact information">
          <label>
            Email
            <input type="email" placeholder="alex@dressi.app" />
          </label>
          <label>
            Phone
            <input placeholder="(312) 555-0180" />
          </label>
        </CheckoutSection>
        <CheckoutSection title="Delivery method">
          <label className="radio-card">
            <input type="radio" name="delivery" defaultChecked />
            <span>
              Standard delivery
              <small>Estimated 4-7 business days</small>
            </span>
            <strong>{formatPrice(shipping)}</strong>
          </label>
        </CheckoutSection>
        <CheckoutSection title="Payment method">
          <label>
            Card number
            <input placeholder="4242 4242 4242 4242" />
          </label>
          <div className="two-col">
            <label>
              Exp
              <input placeholder="08/29" />
            </label>
            <label>
              CVC
              <input placeholder="123" />
            </label>
          </div>
          <div className="auth-note">
            <CreditCard size={16} />
            Stripe-ready placeholder. No real payment is processed in this MVP.
          </div>
        </CheckoutSection>
      </form>
      <section className="order-summary">
        <h2>Order summary</h2>
        {items.map((item) => (
          <div className="summary-item" key={item.id}>
            <span>
              {item.name} <small>x{item.quantity}</small>
            </span>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
        <PriceSummary subtotal={subtotal} shipping={shipping} tax={tax} service={service} total={total} />
      </section>
      <button className="primary-button full sticky-cta" onClick={onPlaceOrder}>
        Place Order
      </button>
    </section>
  );
}

function CheckoutSection({ title, children }) {
  return (
    <section className="checkout-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function PriceSummary({ subtotal, shipping, tax, service = 0, total }) {
  const finalTotal = total ?? subtotal + shipping + tax + service;

  return (
    <section className="price-summary">
      <div>
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      <div>
        <span>Estimated shipping</span>
        <strong>{formatPrice(shipping)}</strong>
      </div>
      <div>
        <span>Estimated tax</span>
        <strong>{formatPrice(tax)}</strong>
      </div>
      {service > 0 && (
        <div>
          <span>Dressi service fee</span>
          <strong>{formatPrice(service)}</strong>
        </div>
      )}
      <div className="summary-total">
        <span>Total</span>
        <strong>{formatPrice(finalTotal)}</strong>
      </div>
    </section>
  );
}

function EmptyState({ title, copy, action, onAction }) {
  return (
    <section className="empty-state">
      <LogoMark compact />
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="primary-button" onClick={onAction}>
        {action}
      </button>
    </section>
  );
}

function BottomNav({ route, navigate }) {
  const navItems = [
    ['home', 'Home', Home],
    ['search', 'Search', Search],
    ['upload', 'Create', Sparkles],
    ['saved', 'Saved', Heart],
    ['profile', 'Profile', UserRound],
  ];
  const activeRoute = route === 'creators' ? 'search'
    : ['creator', 'fit-check', 'shop-fit', 'recreate-fit', 'closet'].includes(route) ? 'home'
      : route;

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map(([id, label, Icon]) => (
        <button
          className={activeRoute === id ? 'active' : ''}
          key={id}
          onClick={() => navigate(id)}
          type="button"
        >
          <span className="nav-icon-wrap">
            <Icon size={20} fill={id === 'saved' && activeRoute === id ? 'currentColor' : 'none'} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}

export default App;

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  CreditCard,
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
import {
  onboardingQuestions,
  outfits,
  popularSearches,
  styleCards,
  styleOptions,
} from './data/dressiData.js';

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
  const [stage, setStage] = useState('splash');
  const [authMode, setAuthMode] = useState('sign-up');
  const [route, setRoute] = useState('home');
  const [selectedOutfitId, setSelectedOutfitId] = useState(outfits[0].id);
  const [savedIds, setSavedIds] = useState([outfits[0].id, outfits[2].id]);
  const [bagItems, setBagItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
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

  const bagSubtotal = getItemsTotal(bagItems);
  const bagShipping = bagItems.length ? 12 : 0;
  const bagTax = bagSubtotal * 0.0825;
  const bagService = bagItems.length ? 4.95 : 0;
  const bagTotal = bagSubtotal + bagShipping + bagTax + bagService;

  function openOutfit(outfitId, nextRoute = 'detail') {
    setSelectedOutfitId(outfitId);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSave(outfitId) {
    setSavedIds((current) =>
      current.includes(outfitId)
        ? current.filter((id) => id !== outfitId)
        : [...current, outfitId],
    );
  }

  function addOutfitToBag(outfit = selectedOutfit) {
    setBagItems(
      outfit.items.map((item) => ({
        ...item,
        outfitId: outfit.id,
        quantity: 1,
        selectedSize: item.sizes[0],
      })),
    );
    setOrderPlaced(false);
    setRoute('bag');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        onContinue={() => setStage('onboarding')}
        onBack={() => setStage('splash')}
      />
    );
  }

  if (stage === 'onboarding') {
    return (
      <Onboarding
        answers={onboardingAnswers}
        setAnswers={setOnboardingAnswers}
        onComplete={() => setStage('app')}
      />
    );
  }

  return (
    <div className="app-shell">
      <AppHeader route={route} onBack={() => setRoute('home')} bagCount={bagItems.length} />
      <main className="screen">
        {route === 'home' && (
          <HomeFeed
            savedIds={savedIds}
            toggleSave={toggleSave}
            openOutfit={openOutfit}
            addOutfitToBag={addOutfitToBag}
            preferences={onboardingAnswers}
          />
        )}
        {route === 'search' && <SearchStyles openOutfit={openOutfit} />}
        {route === 'saved' && (
          <SavedOutfits
            savedOutfits={savedOutfits}
            openOutfit={openOutfit}
            toggleSave={toggleSave}
          />
        )}
        {route === 'detail' && (
          <OutfitDetail
            outfit={selectedOutfit}
            isSaved={savedIds.includes(selectedOutfit.id)}
            toggleSave={toggleSave}
            addOutfitToBag={addOutfitToBag}
            onViewItems={() => setRoute('items')}
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
            onFindOutfits={() => setRoute('home')}
            onCheckout={() => setRoute('checkout')}
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
              setRoute('home');
            }}
          />
        )}
      </main>
      <BottomNav route={route} setRoute={setRoute} bagCount={bagItems.length} />
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

function AuthScreen({ mode, setMode, onContinue, onBack }) {
  const isSignUp = mode === 'sign-up';

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
        <form className="form-stack" onSubmit={(event) => event.preventDefault()}>
          {isSignUp && (
            <label>
              Name
              <input type="text" placeholder="Alex Morgan" />
            </label>
          )}
          <label>
            Email
            <input type="email" placeholder="alex@dressi.app" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" />
          </label>
          <div className="auth-note">
            <ShieldCheck size={16} />
            Secure profile setup. Payment details are only collected at checkout.
          </div>
          <button className="primary-button full" onClick={onContinue} type="button">
            {isSignUp ? 'Create account' : 'Log in'}
          </button>
          <button className="text-button" onClick={onContinue} type="button">
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

function AppHeader({ route, onBack, bagCount }) {
  const detailRoutes = ['detail', 'items', 'bag', 'checkout'];
  const titles = {
    home: '',
    search: 'Search',
    saved: 'Saved',
    detail: 'Outfit Details',
    items: 'Items in Outfit',
    bag: `Your Bag${bagCount ? ` (${bagCount})` : ''}`,
    checkout: 'Secure Checkout',
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
        <button className="nav-icon-button" aria-label={`${bagCount} bag items`}>
          {route === 'home' ? <Bell size={18} /> : <ShoppingBag size={18} />}
          {bagCount > 0 && <i>{bagCount}</i>}
        </button>
      </div>
    </header>
  );
}

function HomeFeed({ savedIds, toggleSave, openOutfit, addOutfitToBag, preferences }) {
  const [activeTab, setActiveTab] = useState('For You');
  const feedTabs = ['For You', 'Trending', 'New', 'AI Picks'];
  const featured = outfits.find((outfit) => outfit.tags.some((tag) => preferences.styles.includes(tag))) ?? outfits[0];

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
      <OutfitCard
        outfit={featured}
        isSaved={savedIds.includes(featured.id)}
        toggleSave={toggleSave}
        openOutfit={openOutfit}
        addOutfitToBag={addOutfitToBag}
        featured
      />
      {outfits
        .filter((outfit) => outfit.id !== featured.id)
        .map((outfit) => (
          <OutfitCard
            outfit={outfit}
            key={outfit.id}
            isSaved={savedIds.includes(outfit.id)}
            toggleSave={toggleSave}
            openOutfit={openOutfit}
            addOutfitToBag={addOutfitToBag}
          />
        ))}
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

function SearchStyles({ openOutfit }) {
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

function SavedOutfits({ savedOutfits, openOutfit, toggleSave }) {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Favorites', 'Looks', 'Purchased'];

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
      {savedOutfits.length ? (
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
      ) : (
        <EmptyState
          title="You have not saved any looks yet."
          copy="Build a wardrobe board by saving outfits from your feed."
          action="Explore outfits"
          onAction={() => openOutfit(outfits[0].id, 'home')}
        />
      )}
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

function BottomNav({ route, setRoute, bagCount }) {
  const navItems = [
    ['home', 'Home', Home, 'home'],
    ['search', 'Search', Search, 'search'],
    ['create', 'Create', Sparkles, 'home'],
    ['saved', 'Saved', Heart, 'saved'],
    ['profile', 'Profile', UserRound, 'saved'],
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map(([id, label, Icon, targetRoute]) => (
        <button
          className={route === id ? 'active' : ''}
          key={id}
          onClick={() => setRoute(targetRoute)}
          type="button"
        >
          <span className="nav-icon-wrap">
            <Icon size={20} fill={id === 'saved' && route === id ? 'currentColor' : 'none'} />
            {id === 'profile' && bagCount > 0 && <i>{bagCount}</i>}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}

export default App;

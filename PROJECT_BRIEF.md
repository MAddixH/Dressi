Build a high-end mobile-first web app called **Dressi: Outfit Inspo & Shop AI App**.

Dressi is an AI-powered fashion inspiration, creator, and shopping platform where users discover complete outfits, save them, edit them, follow creators, view fit checks, and buy every item in an outfit through one simple in-app checkout experience.

The app should feel like a mix of Pinterest, TikTok, LTK, and an AI personal stylist, but with a premium black-and-white luxury fashion brand identity.

Important: The app should be built as a polished MVP, but the UI should look like a real funded startup product.

APP STYLE / BRANDING

Brand name: Dressi
Tagline: Outfit Inspo & Shop AI App
Core feel: elegant, clean, minimal, premium, editorial, fashion-forward.

Visual style:

* Mostly black, white, soft cream, light gray.
* Avoid bright rainbow colors in the base UI.
* Use color only inside outfit photos/videos, product images, and style previews.
* UI should feel like luxury fashion: refined spacing, large images, clean cards, soft shadows, rounded corners.
* Use elegant serif typography for major headers and logo-inspired titles.
* Use clean modern sans-serif typography for body text, labels, buttons, navigation, and product details.
* Buttons should be mostly black with white text.
* Secondary buttons should be white with black border or light gray background.
* Use lots of whitespace.
* Corners should be rounded, around 16px to 28px depending on card size.
* Cards should have subtle shadows, not harsh.
* The product should feel premium but still usable for all styles: old money, streetwear, minimalist, Y2K, casual, sporty, grunge, business casual, clean girl, preppy, boho, vintage, techwear, vacation, date night, and more.

Use the provided Dressi logo assets:

* Large black “D” icon with suit/tie negative-space interior.
* Full Dressi wordmark.
* Use the “D” icon for app icon, splash screen, nav branding, and creator verification badges where appropriate.
* Use the full Dressi logo on landing/onboarding screens.

CORE APP STRUCTURE

Create these main sections:

1. Home / Outfit Feed
2. Search / Explore Styles
3. Create / AI Stylist
4. Saved Outfits
5. Creators
6. Profile
7. Creator Mode / Creator Dashboard
8. Outfit Detail
9. Items in Outfit
10. Unified Bag
11. Secure Checkout
12. Order Tracking
13. Edit Outfit
14. Recreate This Fit

BOTTOM NAVIGATION

The main user bottom navigation should include:

* Home
* Search
* Create
* Saved
* Profile

Creator users should also be able to access:

* Creator Dashboard
* Upload Fit Check
* Earnings
* Analytics
* My Closet

USER TYPES

There should be two account types:

1. Shopper/User
   A normal user who discovers outfits, saves looks, follows creators, customizes outfits, and shops items.

2. Creator/Influencer
   A creator who uploads fit checks, tags clothing items, builds a creator closet, earns commissions, views analytics, and grows an audience.

Users should be able to switch to Creator Mode from Profile if they want to become a creator.

AUTHENTICATION

Build authentication screens:

* Splash screen with Dressi logo
* Welcome screen
* Sign up
* Log in
* Forgot password
* Choose account type: Shopper or Creator
* Optional continue as guest

Onboarding should ask users:

* Gender/style preference: Men, Women, Unisex, Teens, All
* Preferred styles: Old Money, Streetwear, Minimalist, Y2K, Casual, Sporty, Business Casual, Preppy, Dark Academia, Boho, Grunge, Vintage, Clean Girl, Techwear, Vacation, Date Night, Formal
* Budget range: Affordable, Mid-range, Premium, Luxury, Mixed
* Preferred fit: Slim, Relaxed, Oversized, Tailored, Athletic, No preference
* Colors they like: neutrals, dark tones, earth tones, bold colors, pastels, monochrome
* Brands they like, optional
* Sizes, optional
* Height/body type, optional
* Occasion preferences: Everyday, Work, Date, Vacation, Event, School, Gym, Going Out

HOME / OUTFIT FEED

Create a highly visual swipe/scroll feed.

Each feed card should show:

* Large outfit image or creator fit-check video
* Outfit title
* Creator name or “By Dressi AI”
* Style tags
* Like/save button
* Share button
* Quick “Shop Look” button
* Quick “Edit Outfit” button
* Price estimate
* Number of items

Feed tabs:

* For You
* Trending
* Following
* New
* AI Picks

Feed should personalize based on onboarding preferences.

Users can:

* Swipe or scroll through outfits
* Like outfits
* Save outfits
* Follow creators
* Tap an outfit to open Outfit Detail
* Tap “Shop Look” to open Items in Outfit
* Tap “Edit Outfit” to customize items

SEARCH / EXPLORE STYLES

Create a search page where users can search styles, brands, creators, items, and occasions.

Search bar placeholder:
“Search styles, brands, creators, items…”

Popular searches:

* Old Money
* Streetwear
* Summer Looks
* Date Night
* Minimalist
* Y2K
* Casual
* Business Casual
* Vacation
* Under $200

Style grid cards:
Each card should have image background, title, number of outfits, and save/follow option.

Examples:

* Old Money — 2.2K outfits
* Streetwear — 3.1K outfits
* Minimalist — 1.7K outfits
* Y2K — 1.9K outfits
* Sporty — 2.6K outfits
* Business Casual — 1.4K outfits
* Dark Academia — 1.2K outfits
* Preppy — 1.6K outfits
* Casual — 4.3K outfits
* Vintage — 1.8K outfits

When a user taps a style, show a results page with:

* Outfit grid
* Filter
* Sort
* Budget range
* Gender/style preference
* Occasion
* Color palette
* Brand filter
* “Generate similar outfits” button

OUTFIT DETAIL PAGE

This is one of the most important pages.

Show:

* Large outfit image/video
* Outfit name
* Creator / Dressi AI attribution
* Style tags
* Description
* Occasion
* Season
* Price estimate
* Outfit breakdown
* Save button
* Follow creator button
* Shop Entire Outfit button
* Edit Outfit button
* Recreate This Fit button

Example outfit:
Title: Spring City Fit
By: @oldmoneyjake
Description: Clean layers, neutral tones, and timeless pieces. A refined everyday look for brunch, date night, work, or travel.

Outfit tags:
Old Money, Business Casual, Neutral, Spring, Minimal

Outfit breakdown:

* Top
* Pants
* Shoes
* Watch
* Sunglasses
* Belt
* Fragrance/accessory optional

ITEMS IN THIS OUTFIT PAGE

Create a dedicated page titled:
“Items in this Outfit”

This page should show every item included in the outfit.

Each item row/card should include:

* Product image
* Brand name
* Product name
* Color
* Size selector
* Price
* Retailer/source
* Availability
* Swap button
* Remove button
* View details button

Example:
Ralph Lauren
Pima Cotton Sweater
Navy
$128

Massimo Dutti
Pleated Pants
Ecru
$89.95

Tod’s
Suede Loafers
Brown
$695

Cartier
Tank Must Watch
Leather Strap
$3,550

Persol
Sunglasses
PO0714
$320

Tom Ford
Leather Belt
Brown
$490

At bottom:

* Subtotal
* Estimated shipping
* Estimated tax
* Total
* “Add All to Bag” black button
* “Buy Entire Outfit” black button
* “Save Outfit” secondary button

UNIFIED BAG

This is a key differentiator.

The user should not feel like they are being sent to every supplier separately.

Create a unified bag page called:
“Your Bag”

This page should make it feel like all items can be bought together inside Dressi.

Bag page includes:

* All selected outfit items
* Quantity controls
* Size controls
* Color controls
* Remove item
* Swap item
* Delivery estimate
* Retailer verification notice
* Price summary
* Promo code field
* Checkout securely button

Important disclaimer text:
“All items are fulfilled by verified retail partners. Dressi lets you checkout in one simple experience.”

Checkout button:
“Checkout Securely”

SECURE CHECKOUT

Build a secure checkout flow:

Checkout sections:

1. Shipping address
2. Contact information
3. Delivery method
4. Payment method
5. Order summary
6. Place order

Order summary includes:

* Items
* Shipping
* Tax
* Dressi service fee, optional
* Total

Trust badges:

* Secure payments
* Verified retail partners
* Real-time order tracking
* Easy returns

Button:
“Place Order”

ORDER CONFIRMATION

After checkout show:

* Large checkmark
* “Order Confirmed”
* Order number
* Estimated delivery
* Item thumbnails
* Track order button
* Continue shopping button

ORDER TRACKING

Show timeline:

* Confirmed
* Processing
* Shipped
* Delivered

Show item thumbnails and tracking status.

EDIT OUTFIT FEATURE

Create an “Edit Outfit” page where users can customize an outfit.

At top:

* Current outfit preview
* Item category tabs:

  * Top
  * Pants
  * Shoes
  * Outerwear
  * Accessories
  * Watch
  * Sunglasses
  * Bag
  * Jewelry

For selected category, show replacement options:

* Similar
* More affordable
* Premium
* Different color
* Different brand
* Trending
* AI recommended

Each replacement item should show:

* Image
* Brand
* Product name
* Price
* Why it matches
* Replace button

Bottom:

* Updated total
* Save changes
* Add all to bag

RECREATE THIS FIT FEATURE

Create a page called:
“Recreate This Fit”

Purpose:
When a user sees a creator outfit, Dressi helps recreate the look using exact or similar items.

Tabs:

* Exact Items
* More Affordable
* Premium Version
* Similar Vibe

Show:

* Original creator outfit image
* Total price
* Item list
* Alternatives for each item
* Add all to bag
* Save recreation

This page should be very polished and feel like AI styling.

AI STYLIST / CREATE PAGE

Create a page called “Create”

Main headline:
“Let AI style the perfect outfit for you.”

Inputs:

* Style vibe
* Occasion
* Season
* Budget
* Gender/style preference
* Color palette
* Brands to include
* Brands to avoid
* Items you already own, optional

Occasion options:

* Everyday
* Work
* Date
* Vacation
* Event
* School
* Gym
* Going Out
* Wedding Guest

Season options:

* All
* Spring
* Summer
* Fall
* Winter

Budget:

* Under $100
* Under $200
* Under $500
* Premium
* Luxury
* Custom

Button:
“Generate Outfits”

Generated results:
Show 3–8 complete outfits with:

* Image
* Title
* Tags
* Price estimate
* Save
* Shop
* Edit

SAVED OUTFITS

Saved page should have tabs:

* All
* Favorites
* Looks
* Creators
* Purchased

Show grid of saved outfit cards:

* Image
* Title
* Creator
* Price
* Tags
* Heart count
* Quick shop button

Allow users to create collections:

* Summer Fits
* Work Looks
* Date Night
* Vacation
* Streetwear
* Old Money
* Wishlist

CREATOR / INFLUENCER FEATURE

Build a full creator ecosystem.

Creators should be able to create an account and post photos/videos of their outfits.

CREATOR PROFILE PAGE

Creator profile should include:

* Profile photo
* Username
* Verification badge optional
* Bio
* Location optional
* Style categories
* Follower count
* Likes
* Outfit count
* Following count
* Follow button
* Message button
* Shop Creator Closet button

Example:
@oldmoneyjake
Helping guys dress better.
Old Money | Business Casual | Luxury
New York, NY

Stats:
85 Outfits
12K Followers
24K Likes
152 Following

Profile tabs:

* Outfits
* Reels
* Closet
* Collections
* Tagged
* Q&A

Creator profile outfit grid:
Each post card should show:

* Photo/video thumbnail
* Likes
* Saves
* “Shop Look” icon

FIT CHECK FEED

Create a TikTok-style vertical feed for creator videos.

Page title:
“Fit Check Feed”

Tabs:

* For You
* Following
* Recent

Video card includes:

* Video/photo content
* Creator avatar
* Username
* Follow button
* Caption
* Style tags
* Like button
* Save button
* Comment button
* Share button
* Shop look button

When tapped, show:

* Tagged clothing items overlay
* Shop Look drawer
* Add all to bag

CREATOR POST DETAIL

Post detail should include:

* Large photo/video
* Caption
* Creator attribution
* Tags
* Outfit item carousel
* Shop Entire Outfit button
* Recreate This Fit button
* Comment section
* Similar outfits

CREATOR UPLOAD FLOW

Creators should be able to upload:

* Photo
* Video
* Carousel post
* Reel
* Fit check

Upload fields:

* Caption
* Style tags
* Occasion
* Season
* Gender/style category
* Add clothing items
* Add affiliate links
* Choose exact item or similar item
* Mark item category: top, pants, shoes, accessories, outerwear, watch, etc.
* Add price
* Add brand
* Add retailer/source
* Publish

Creator should be able to tag clothing visually on the image/video, similar to Instagram shopping tags.

CREATOR CLOSET

Each creator has a closet page.

Closet categories:

* Outerwear
* Tops
* Pants
* Shoes
* Accessories
* Watches
* Sunglasses
* Bags
* Jewelry
* Fragrance
* Most Worn
* Favorites

Each closet item:

* Product image
* Brand
* Product name
* Price
* Number of outfits used in
* Shop item button

CREATOR DASHBOARD

Build a creator dashboard with analytics.

Dashboard sections:

* Profile views
* Outfit views
* Saves
* Product clicks
* Purchases
* Estimated earnings
* Conversion rate
* Best performing outfits
* Best performing items

This month card:

* Profile Views: 125,430
* Outfit Views: 320,876
* Saves: 48,302
* Purchases: 3,842
* Earnings: $2,843.21

Add chart UI for earnings and views.

CREATOR EARNINGS PAGE

Show:

* Total earnings
* This month earnings
* Pending payout
* Recent payout
* Earnings by outfit
* Earnings by item
* Product clicks
* Purchases
* Commission estimate

Add payout history button.

INVITE & EARN PAGE

Creators can invite other creators.

Show:

* Invite link
* Copy button
* Creators joined
* Earnings from invites
* Invite a creator button

Example:
Invite other creators to join Dressi and earn 10% of their earnings for life.

ADMIN PANEL

Create an admin panel for Dressi team.

Admin should manage:

* Users
* Creators
* Outfits
* Products
* Brands
* Affiliate links
* Orders
* Reports
* Style categories
* Featured outfits
* Commission rates
* Payouts

Admin should be able to approve creator posts before they go live if moderation is enabled.

DATA MODELS / DATABASE

Create database tables or collections for:

Users:

* id
* name
* email
* password hash
* role: shopper, creator, admin
* profile image
* gender/style preference
* sizes
* style preferences
* budget preference
* created_at

Creators:

* id
* user_id
* username
* bio
* location
* profile_image
* verified
* follower_count
* like_count
* outfit_count
* total_earnings
* payout_status

Outfits:

* id
* creator_id nullable
* title
* description
* image_url
* video_url
* style_tags
* occasion
* season
* gender_category
* total_price
* source: creator, Dressi AI, admin
* likes_count
* saves_count
* views_count
* created_at

OutfitItems:

* id
* outfit_id
* product_id
* category
* required boolean
* sort_order

Products:

* id
* brand
* product_name
* description
* category
* color
* price
* sale_price
* image_url
* retailer
* affiliate_url
* inventory_status
* sizes_available
* commission_rate
* created_at

SavedOutfits:

* id
* user_id
* outfit_id
* collection_id
* created_at

Follows:

* id
* follower_user_id
* creator_id
* created_at

Likes:

* id
* user_id
* outfit_id
* post_id
* created_at

CreatorPosts:

* id
* creator_id
* caption
* media_type: photo, video, carousel
* media_url
* style_tags
* outfit_id
* created_at

Orders:

* id
* user_id
* order_number
* items
* subtotal
* shipping
* tax
* service_fee
* total
* status
* shipping_address
* payment_status
* created_at

OrderItems:

* id
* order_id
* product_id
* quantity
* size
* color
* price
* retailer
* fulfillment_status

CreatorEarnings:

* id
* creator_id
* order_id
* product_id
* amount
* commission_rate
* status
* created_at

Collections:

* id
* user_id
* name
* created_at

AI GENERATED CONTENT

Create AI features in the app, even if initially they are simulated with mock logic.

AI features:

* Generate outfits based on style and budget
* Recommend similar outfits
* Recreate creator outfit with cheaper alternatives
* Suggest replacement items
* Personalize feed based on user saves and likes
* Auto-tag outfits by style
* Auto-generate outfit titles and descriptions

PRODUCT / AFFILIATE SYSTEM

The MVP should support affiliate links and future direct checkout.

Each product should have:

* Product name
* Brand
* Retailer
* Price
* Image
* Affiliate URL
* Category
* Commission rate
* In-stock status

For MVP checkout:
Build the UI as unified checkout.
It can simulate checkout or store the order internally.
Make the experience feel like the user buys everything through Dressi.

Add clear text:
“Items are fulfilled by verified retail partners.”

Do not redirect users separately for each item in the main user experience.

PURCHASING FLOW

Main shopping flow:

User sees outfit
→ taps “Shop Entire Outfit”
→ sees Items in Outfit
→ taps “Add All to Bag”
→ sees Unified Bag
→ taps “Checkout Securely”
→ enters shipping/payment
→ taps “Place Order”
→ sees Order Confirmed
→ can Track Order

CREATOR SHOPPING FLOW

User sees creator fit check video
→ taps “Shop Look”
→ clothing item drawer opens
→ user taps “Recreate This Fit” or “Buy Entire Outfit”
→ user can choose exact items or affordable alternatives
→ Add All to Bag
→ Checkout

UI MICROCOPY

Use premium, clean language.

Examples:

* Find your vibe. Shop the look.
* Your style, your way.
* Discover complete outfits made for you.
* Swipe, save, shop.
* Recreate this fit.
* Shop the entire look.
* Styled by Dressi AI.
* Inspired by creators. Powered by AI.
* One checkout. Every item.
* All styles, one app.

SAMPLE OUTFIT DATA

Seed the app with example outfits across different styles:

1. Old Money Classic
   Tags: Old Money, Elegant, Neutral, Classic
   Items:

* Ralph Lauren Pima Cotton Sweater
* Massimo Dutti Pleated Pants
* Tod’s Suede Loafers
* Cartier Tank Watch
* Persol Sunglasses

2. Streetwear Vibes
   Tags: Streetwear, Casual, Bold, Urban
   Items:

* Nike Hoodie
* Carhartt Cargo Pants
* Nike Dunk Sneakers
* New Era Cap
* Silver Chain

3. Minimalist Everyday
   Tags: Minimalist, Clean, Neutral
   Items:

* COS Oversized Tee
* Uniqlo Relaxed Trousers
* Common Projects Sneakers
* Leather Tote

4. Business Casual
   Tags: Work, Smart Casual, Clean
   Items:

* Banana Republic Blazer
* White Oxford Shirt
* Slim Chinos
* Loafers
* Watch

5. Y2K Weekend
   Tags: Y2K, Fun, Trendy
   Items:

* Cropped Jacket
* Wide Leg Jeans
* Platform Sneakers
* Color Sunglasses
* Shoulder Bag

6. Sporty Casual
   Tags: Sporty, Everyday, Comfortable
   Items:

* Nike Quarter Zip
* Lululemon Joggers
* Adidas Sneakers
* Athletic Cap

7. Dark Academia
   Tags: Dark Academia, Fall, Layered
   Items:

* Wool Coat
* Turtleneck
* Pleated Trousers
* Leather Shoes
* Vintage Watch

8. Vacation Resort
   Tags: Vacation, Summer, Resort
   Items:

* Linen Shirt
* Drawstring Linen Pants
* Sandals
* Sunglasses
* Woven Bag

RESPONSIVE DESIGN

Build mobile-first.
The app should look best on iPhone-sized screens.
Desktop can show centered mobile-style cards or responsive web layout.

Use:

* Sticky bottom nav
* Smooth transitions
* Skeleton loaders
* Empty states
* Error states
* Loading states

EMPTY STATES

Saved:
“You haven’t saved any looks yet.”
Button: “Explore outfits”

Creators:
“Follow creators to personalize your feed.”

Bag:
“Your bag is empty.”
Button: “Find outfits”

Creator dashboard:
“Post your first fit check to start earning.”

SECURITY / TRUST

Include:

* Secure checkout UI
* Account authentication
* Protected creator dashboard
* Protected admin panel
* Input validation
* Image upload validation
* Order confirmation
* Payment placeholder integration ready for Stripe

TECHNICAL PREFERENCES

Build using:

* React or React Native-style frontend
* Supabase or Firebase backend
* Clean component structure
* Reusable UI components
* Authentication
* Database-connected outfits/products/users
* Storage for images/videos
* Admin-ready architecture

Recommended components:

* OutfitCard
* ProductCard
* CreatorCard
* CreatorProfileHeader
* BottomNav
* SearchBar
* StyleTag
* PriceSummary
* CheckoutForm
* OrderTimeline
* EarningsChart
* UploadPostModal
* EditOutfitPanel
* RecreateFitPanel

MVP PRIORITY

Build these first:

1. Authentication
2. Onboarding quiz
3. Home outfit feed
4. Search styles
5. Outfit detail
6. Items in outfit
7. Add all to bag
8. Unified checkout UI
9. Saved outfits
10. Creator profiles
11. Creator fit check posts
12. Creator upload flow
13. Creator dashboard
14. Basic admin panel

Do not overcomplicate the first version with real full retailer API integrations unless necessary. Build the structure so integrations can be added later.

FINAL PRODUCT GOAL

The final MVP should feel like a polished fashion-tech app where:

* Users discover complete outfits.
* Users search any style aesthetic.
* Users save outfits.
* Users edit outfits.
* Users shop every item in a look.
* Users checkout in one simple Dressi flow.
* Creators upload fit checks.
* Creators tag every clothing item they wear.
* Users follow creators and shop their outfits.
* Creators earn commission from purchases.
* Dressi feels premium, modern, elegant, and scalable.

The app should not feel like a basic clothing store.
It should feel like a visual outfit inspiration platform with shopping built directly into the experience.

CRITICAL COMMERCE FEATURE: ONE-CHECKOUT MULTI-RETAILER PURCHASING

Dressi must allow users to purchase an entire outfit through one simple Dressi checkout, even if the items come from multiple different brands or retailers.

Example:
An outfit may include:

* Nike shoes from Nike
* Zara pants from Zara
* Ralph Lauren sweater from Ralph Lauren
* Sunglasses from Amazon
* Watch from another retailer

The user should not have to manually visit each website separately.

Required user flow:
User taps “Buy Entire Outfit”
→ Dressi shows all items included
→ user selects size/color for each item
→ user taps “Add All to Bag”
→ user checks out once inside Dressi
→ Dressi automatically handles purchasing/fulfillment through multiple verified retail partners behind the scenes.

Important UI language:

* “One checkout. Every item.”
* “Dressi handles the rest.”
* “Items may ship from multiple verified retail partners.”
* “Track everything in one place.”

Build the app architecture so this can eventually support:

* Retailer API checkout integrations
* Affiliate checkout links
* Dropship/partner fulfillment
* Manual order routing
* Automated purchasing workflows
* Multi-retailer order splitting
* Centralized order tracking

For MVP, if real retailer checkout APIs are not available yet, simulate this process with:

* Unified Dressi bag
* Unified checkout page
* Internal order record
* Retailer/source field per item
* Order status per item
* Message that items are fulfilled by verified retail partners

The backend should structure each order as one parent Dressi order with multiple child order items, each connected to a different retailer.

Example database structure:
Order:

* id
* user_id
* Dressi order number
* subtotal
* shipping
* tax
* service fee
* total
* overall status

OrderItems:

* order_id
* product_id
* retailer
* brand
* affiliate_url or retailer_api_endpoint
* size
* color
* quantity
* price
* fulfillment_status
* tracking_number
* retailer_order_reference

The goal is that the customer experiences one simple Dressi checkout, while Dressi manages the complexity of buying from multiple suppliers/retailers in the background.

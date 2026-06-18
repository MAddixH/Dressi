Build Phase 2 of Dressi.

Goal:
Add creator/influencer accounts where creators can post fit checks, tag clothing items, and let users shop their outfits.

Build:
- Creator profile pages
- Follow/unfollow creators
- Creator outfit/photo/video feed
- Fit check post detail page
- Creator upload flow
- Ability to tag clothing items in a post
- “Shop This Fit” button
- “Recreate This Fit” button
- Creator closet page
- Creator analytics preview

Do not build payouts yet.
Do not build full admin panel yet.
Use mock creator earnings and mock product data for now.
Prioritize clean creator profiles, fit-check feed, tagged clothing, and shopping flow.

Complete info:
# DRESSI PHASE 2 — CREATOR PLATFORM

Objective:
Transform Dressi from a fashion shopping app into a creator-driven fashion ecosystem.

Creators should be able to upload fit checks, build an audience, tag clothing items, and allow users to shop their outfits directly.

Do NOT build payouts or advanced monetization yet.

---

FEATURE 1: CREATOR ACCOUNT TYPE

Add Creator accounts.

Users can:

* Upgrade existing account to Creator
* Create account directly as Creator

Creator profile fields:

* Username
* Profile photo
* Bio
* Location (optional)
* Style categories
* Social links (optional)

Creator stats:

* Followers
* Following
* Outfit posts
* Likes
* Saves

---

FEATURE 2: CREATOR PROFILE PAGE

Route:
/creator/[username]

Profile includes:

* Large profile image
* Username
* Bio
* Style tags
* Follow button
* Message button (placeholder)
* Shop Closet button

Tabs:

* Outfits
* Videos
* Closet
* Collections

Grid layout should resemble a premium mix of TikTok + Instagram.

---

FEATURE 3: FIT CHECK POSTS

Creators can upload:

* Photo
* Video
* Carousel

Each post includes:

* Caption
* Style tags
* Occasion
* Season
* Gender category

Examples:
Old Money
Streetwear
Minimalist
Business Casual
Vacation
Date Night

Post card displays:

* Media preview
* Likes
* Saves
* Shop Look button

---

FEATURE 4: SHOP THIS FIT

Most important Phase 2 feature.

Creators must be able to tag products in posts.

Each tagged item includes:

* Product image
* Brand
* Product name
* Price
* Retailer
* Category

When user taps:

Shop This Fit

Open drawer/page showing:

Top
Pants
Shoes
Accessories

Allow:

* Add all to bag
* View individual items
* Save outfit

---

FEATURE 5: RECREATE THIS FIT

Each creator post should have:

Recreate This Fit

Button.

System generates:

* Exact outfit
* Similar outfit
* Affordable version

Show:

* Outfit preview
* Price comparison
* Add all to bag

Use mock logic initially.

---

FEATURE 6: CREATOR CLOSET

Each creator gets:

My Closet

Sections:

* Tops
* Pants
* Shoes
* Accessories
* Watches
* Outerwear

Users can browse everything a creator wears.

Each item:

* Product image
* Brand
* Name
* Price
* Shop button

---

FEATURE 7: FOLLOW SYSTEM

Users can:

* Follow creators
* Unfollow creators

Add:

Following Feed

Home Feed Tabs:

* For You
* Following
* Trending

Following should prioritize followed creators.

---

FEATURE 8: CREATOR UPLOAD FLOW

Create upload modal/page.

Fields:

Media Upload
Caption
Style Tags
Season
Occasion

Tagged Products

Allow creator to:

Add Product
Select Category
Brand
Price
Retailer
Link

Publish Post

---

FEATURE 9: CREATOR DISCOVERY

Add Creators page.

Users can browse:

Trending Creators
New Creators
Most Saved Creators
Most Purchased Creators

Search creators by:

* Username
* Style
* Category

---

DESIGN REQUIREMENTS

Keep same Dressi branding:

* Premium black/white theme
* Luxury fashion feel
* Large imagery
* Rounded cards
* Soft shadows
* Editorial spacing

Creator content should feel like:
Pinterest + TikTok + Instagram

while remaining consistent with Dressi.

---

SUCCESS CRITERIA

A user should be able to:

1. Discover creator
2. Follow creator
3. Watch fit check
4. Shop outfit
5. Save outfit
6. Add outfit to bag

without leaving Dressi.

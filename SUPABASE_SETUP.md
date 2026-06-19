# Dressi Supabase Setup

Dressi uses Supabase for authentication, creator data, follows, saves, tagged products, closets, and creator media.

## 1. Create the project

Create a hosted project at [supabase.com/dashboard](https://supabase.com/dashboard). Keep the database password in a password manager; the frontend never needs it.

## 2. Apply the schema

Open the project's SQL Editor and run these files in order:

`supabase/migrations/202606180001_phase_2_creator_platform.sql`

`supabase/migrations/202606180002_seed_creator_catalog.sql`

The first migration creates the Phase 2 tables, row-level security policies, signup trigger, and public `creator-media` storage bucket. The second stores Dressi's curated creator catalog in Supabase so follows and saves use persistent IDs.

## 3. Configure the app

Copy `.env.example` to `.env.local` and replace both values with the project's API settings:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Use only the publishable/anonymous key. Never put the service-role key in this app.

## 4. Configure authentication URLs

In Supabase Authentication URL settings, add:

- Site URL: the deployed Dressi URL
- Redirect URL for local development: `http://127.0.0.1:5173/**`
- Redirect URL for production: `https://your-dressi-domain.com/**`

## 5. Restart Dressi

```powershell
npm run dev
```

With valid environment values, Dressi automatically switches from demo fallback data to Supabase persistence.

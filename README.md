# IELTS Atlas — Next.js Academic Mock Tracker

A personal IELTS Academic tracker with verified Supabase Auth, Postgres row-level security, progress charts, practice breakdowns, and 21×4×4 Cambridge checklist.

## Requirements
- Node.js 22+
- A free Supabase account: https://supabase.com
- A free Vercel account: https://vercel.com

## 1. Database setup
1. Create a new Supabase project.
2. Open **SQL Editor**, paste the entire `supabase/schema.sql` file, and run it **once**.
3. In **Authentication → Providers → Email**, enable email confirmations. (Recommended; default email configuration is rate-limited.)
4. To enable Google sign-in, enable **Authentication → Providers → Google** and enter the OAuth client ID and secret from Google Cloud Console. Add Supabase’s callback URL shown in the provider settings to the Google OAuth client’s authorized redirect URIs.
5. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` during development and add `http://localhost:3000/auth/callback` to the allowed redirect URLs. Also allow your deployed `/auth/callback` URL in production.
6. Copy your **Project URL** and **Publishable key** from Supabase project settings. Never put a service-role or secret key into `NEXT_PUBLIC_*` variables.

## 2. Local development
```bash
npm install
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your Supabase project URL
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your Supabase publishable key
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run dev
```
Visit http://localhost:3000 and sign in with an existing provisioned account or Google. Account creation is disabled in the app UI.

## 3. Free deployment
1. Push the project to a **private GitHub repository**. `.env.local` is ignored.
2. Import it into Vercel using **New Project → Import Git Repository**.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` in Vercel. Set the last value to your deployed site origin, such as `https://YOUR-PROJECT.vercel.app` (no trailing slash).
4. Deploy. Your URL will be `https://YOUR-PROJECT.vercel.app`.
5. In Supabase **Auth → URL Configuration**, set the **Site URL** to your deployed URL and add `https://YOUR-PROJECT.vercel.app/auth/callback` to the redirect allowlist. For local development, allow `http://localhost:3000/auth/callback` too.
6. Sign in with your provisioned email account or Google.

Vercel Hobby is for personal, non-commercial use and subject to quotas. Supabase Free projects can pause if inactive. Back up your data periodically.

## Supported features
- Per-user Supabase email/password and Google OAuth authentication with server-side session cookies.
- Email password recovery and signed-in password changes from Account Settings.
- Postgres RLS that restricts all practice and breakdown data to the current user.
- Cambridge IELTS 1–21, four tests/book, four skills/test (336 checkboxes inferred from sessions).
- Multiple attempts per test; completion stays checked if at least one attempt exists.
- Listening and Academic Reading raw scores /40 with **approximate** practice band estimates.
- Writing/Speaking manually assessed bands.
- Passage 1–3, Listening section 1–4, and question-type breakdowns (optional).
- Charts, skill averages, low-accuracy question types, and recent activity.
- Delete a mistaken practice attempt.

## Important limitations / improvements
- Reading and Listening bands use general practice conversion tables, not official per-book answer-key mappings.
- The completion tracker includes Books 1–21 by user request; older books and their editions can vary in format. The app tracks tests rather than reproducing copyrighted questions.
- Charts use up to the 1,000 most recent sessions. Pagination is needed for much larger histories.
- Single request inserts a practice session then its breakdown; on failure it attempts rollback. For strict atomicity, replace this with a Postgres RPC transaction.
- For high-traffic public production use, add rate limiting, audit logging, and automated tests. Supabase Auth handles credential hashing, email confirmation and sessions, but strong security also requires correct Auth settings and regular dependency updates.

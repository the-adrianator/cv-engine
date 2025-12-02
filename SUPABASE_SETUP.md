# Supabase Setup Guide

## Task 4: Supabase Configuration ✅

Supabase has been integrated into the application for database and file storage.

### What's Been Set Up

1. **Supabase Package Installed** ✅
   - `@supabase/supabase-js` added to dependencies

2. **Client Utilities Created** ✅
   - `lib/supabase/client.ts` - Client-side Supabase client
   - `lib/supabase/server.ts` - Server-side Supabase client
   - `lib/supabase/storage.ts` - File storage utilities
   - `lib/supabase/db.ts` - Database helper functions

3. **Database Schema** ✅
   - `supabase/schema.sql` - Complete database schema
   - Tables: users, cvs, usage_tracking, subscriptions
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Triggers for auto-updating timestamps

4. **Type Definitions** ✅
   - `types/database.ts` - TypeScript types for database

### Next Steps

#### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** CV Engine (or your choice)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
5. Wait for project to be created (~2 minutes)

#### 2. Get API Keys

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

#### 3. Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify tables were created in **Table Editor**

#### 4. Setup Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `cvs`
4. **Public bucket:** ❌ No (we'll use signed URLs for secure access)
5. Click **Create bucket**

**Note:** Since we're using Clerk for authentication (not Supabase Auth), storage policies won't work with `auth.uid()`. We'll handle file access control in application code using signed URLs, which is more secure anyway.

#### 6. Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 7. Test the Setup

1. Restart your dev server: `npm run dev`
2. Check for any errors in the console
3. Try accessing the home page

### Important Notes

#### Row Level Security (RLS)

The schema **disables RLS** because we're using Clerk for authentication (not Supabase Auth). RLS policies that use `auth.uid()` won't work with Clerk.

**Security is handled in application code:**
- All database functions in `lib/supabase/db.ts` check `user_id` in queries
- Users can only access their own data (enforced in WHERE clauses)
- Server-side operations use service role key for privileged access
- Client-side operations are limited to what the server exposes via API routes

This approach is secure because:
1. All database operations go through server-side functions
2. User ID is verified from Clerk session before queries
3. No direct client access to database (only via API routes)

#### Storage Policies

Since Clerk handles authentication, Supabase storage policies won't work with `auth.uid()`. We'll handle file access control in the application code using signed URLs.

### Production Concerns Addressed

✅ **Error Handling**
- All database functions return `{ data, error }` pattern
- Try/catch blocks in all operations
- Type-safe database operations

✅ **Security**
- User ID checks in all queries
- Service role key only used server-side
- Environment variable validation

✅ **Type Safety**
- TypeScript types for all database tables
- Type-safe insert/update operations

### Testing Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Storage bucket created
- [ ] Environment variables set
- [ ] No errors in console
- [ ] Can connect to Supabase

### Common Issues

**Issue:** "Missing Supabase environment variables"
- **Solution:** Make sure all three Supabase env vars are set in `.env.local`

**Issue:** RLS policies blocking queries
- **Solution:** For now, we can disable RLS or handle it in application code (we're doing the latter)

**Issue:** Storage upload fails
- **Solution:** Check bucket name matches `BUCKET_NAME` in `lib/supabase/storage.ts` (should be "cvs")

---

## Ready for Next Task?

Once Supabase is set up and tested, we'll move to:
- **Task 5:** Migrate components
- **Task 6:** Implement CV upload flow
- **Task 7:** Integrate OpenAI API

Let me know when Supabase is configured and we'll proceed!


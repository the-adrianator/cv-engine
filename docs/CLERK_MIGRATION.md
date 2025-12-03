# Migration Guide: Puter.js → Clerk Authentication

**Replacing:** Puter.js authentication  
**With:** Clerk authentication  
**For:** Next.js App Router

---

## Table of Contents

1. [Overview](#overview)
2. [What Clerk Replaces](#what-clerk-replaces)
3. [What Still Needs Puter.js](#what-still-needs-puterjs)
4. [Clerk Setup](#clerk-setup)
5. [Migration Steps](#migration-steps)
6. [Code Examples](#code-examples)
7. [Alternative Services](#alternative-services)
8. [Payment Integration](#payment-integration)

---

## Overview

### Current Architecture

Your app currently uses **Puter.js** for:
- ✅ **Authentication** → Replace with **Clerk**
- ⚠️ **File Storage** (fs) → Need alternative
- ⚠️ **AI Services** (ai) → Need alternative
- ⚠️ **Key-Value Store** (kv) → Need alternative

### Clerk vs Stripe

**Important:** Clerk and Stripe serve different purposes:
- **Clerk** = Authentication & User Management
- **Stripe** = Payment Processing & Subscriptions

**You can use both:**
- Clerk for authentication
- Stripe (or another service) for payments

---

## What Clerk Replaces

### Puter.js Auth → Clerk

| Puter.js | Clerk |
|----------|-------|
| `puter.auth.signIn()` | `clerk.signIn()` or `<SignInButton />` |
| `puter.auth.signOut()` | `clerk.signOut()` or `<SignOutButton />` |
| `puter.auth.getUser()` | `useUser()` hook |
| `puter.auth.isSignedIn()` | `useAuth()` hook |
| `PuterUser` (uuid, username) | `User` (id, email, firstName, lastName) |

### Benefits of Clerk

1. **Better User Management**
   - Email/password, OAuth (Google, GitHub, etc.)
   - Phone number authentication
   - Multi-factor authentication
   - User profiles and metadata

2. **Better Integration**
   - Built for React/Next.js
   - Server-side and client-side support
   - Middleware for route protection
   - Webhooks for user events

3. **Better Developer Experience**
   - TypeScript support
   - Pre-built UI components
   - Comprehensive documentation

---

## What Still Needs Puter.js

### Services to Replace

After replacing auth with Clerk, you still need alternatives for:

1. **File Storage** (`puter.fs`)
   - Currently: Uploads CVs and images to Puter storage
   - **Alternatives:** AWS S3, Cloudinary, Uploadthing, Supabase Storage

2. **AI Services** (`puter.ai`)
   - Currently: Uses Puter's AI for CV analysis
   - **Alternatives:** OpenAI API, Anthropic API, Google Gemini

3. **Key-Value Store** (`puter.kv`)
   - Currently: Stores CV metadata and feedback
   - **Alternatives:** Database (PostgreSQL, MongoDB), Redis, Supabase

---

## Clerk Setup

### Step 1: Install Clerk

```bash
cd cv-engine
npm install @clerk/nextjs
```

### Step 2: Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Clerk webhook secret
CLERK_WEBHOOK_SECRET=whsec_...

# Other services (to be configured)
# File storage
# AI service
# Database
```

### Step 3: Setup Clerk Provider

Update `app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Step 4: Setup Middleware

Create `middleware.ts` in root:

```tsx
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/upload(.*)',
  '/cv(.*)',
  '/wipe(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## Migration Steps

### Step 1: Create Clerk Auth Store

Replace `lib/stores/puter.ts` auth section with Clerk:

```tsx
// lib/stores/auth.ts
'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { create } from 'zustand';

interface AuthStore {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthStore = create<AuthStore>((set) => {
  // This will be updated by components using Clerk hooks
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };
});

// Hook to sync Clerk state with Zustand
export function useSyncAuth() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  
  React.useEffect(() => {
    if (isLoaded) {
      useAuthStore.setState({
        user: user ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || 'User',
          imageUrl: user.imageUrl,
        } : null,
        isAuthenticated: isSignedIn || false,
        isLoading: false,
      });
    }
  }, [user, isSignedIn, isLoaded]);
  
  return { user, isSignedIn, isLoaded };
}
```

### Step 2: Create Auth Hook

```tsx
// lib/hooks/useAuth.ts
'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useSyncAuth } from '@/lib/stores/auth';

export function useAppAuth() {
  const clerkUser = useUser();
  const clerkAuth = useAuth();
  useSyncAuth(); // Sync with Zustand store
  
  return {
    user: clerkUser.user ? {
      id: clerkUser.user.id,
      email: clerkUser.user.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.user.fullName || clerkUser.user.firstName || 'User',
      imageUrl: clerkUser.user.imageUrl,
    } : null,
    isAuthenticated: clerkAuth.isSignedIn || false,
    isLoading: !clerkUser.isLoaded || !clerkAuth.isLoaded,
    signOut: () => clerkAuth.signOut(),
  };
}
```

### Step 3: Update Auth Page

```tsx
// app/(auth)/auth/page.tsx
'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const next = searchParams.get('next') || '/';

  if (isSignedIn) {
    router.push(next);
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-primary rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome to CV Engine</h1>
            <h2>Log in to continue your employment journey</h2>
          </div>
          <div>
            <SignIn 
              routing="path"
              path="/auth"
              signUpUrl="/auth/sign-up"
              afterSignInUrl={next}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
```

### Step 4: Update Protected Routes

```tsx
// app/(main)/page.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth?next=/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  // Rest of your home page component
  return (
    <main>
      {/* Your content */}
    </main>
  );
}
```

### Step 5: Update Components Using Auth

**Before (Puter.js):**
```tsx
const { auth, kv } = usePuterStore();
if (!auth.isAuthenticated) navigate('/auth');
```

**After (Clerk):**
```tsx
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const { isSignedIn, userId } = useAuth();
const router = useRouter();

if (!isSignedIn) router.push('/auth');
```

---

## Code Examples

### Example 1: Navbar with Auth

```tsx
// components/layout/Navbar.tsx
'use client';

import { SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar">
      <Link href="/">
        <p className="text-2xl font-bold text-gradient">CV Engine</p>
      </Link>
      
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link href="/upload" className="primary-button w-fit">
              Upload CV
            </Link>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <SignInButton mode="modal">
            <button className="primary-button w-fit">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
```

### Example 2: Server Component with Auth

```tsx
// app/(main)/page.tsx (Server Component)
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/auth?next=/');
  }

  const user = await currentUser();
  
  return (
    <main>
      <h1>Welcome, {user?.firstName}!</h1>
      {/* Rest of page */}
    </main>
  );
}
```

### Example 3: API Route with Auth

```tsx
// app/api/cv/route.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  
  // Your logic here
  return NextResponse.json({ 
    message: `Hello ${user?.firstName}` 
  });
}
```

---

## Alternative Services

### File Storage Options

#### Option 1: Uploadthing (Recommended for Next.js)
```bash
npm install uploadthing @uploadthing/react
```

**Pros:**
- Built for Next.js
- Easy integration
- Free tier available
- TypeScript support

**Cons:**
- Newer service
- Limited storage on free tier

#### Option 2: AWS S3
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Pros:**
- Industry standard
- Scalable
- Reliable

**Cons:**
- More complex setup
- Requires AWS account
- Cost can add up

#### Option 3: Cloudinary
```bash
npm install cloudinary
```

**Pros:**
- Image optimization built-in
- Easy to use
- Good free tier

**Cons:**
- Primarily for images
- Can be expensive at scale

#### Option 4: Supabase Storage
```bash
npm install @supabase/supabase-js
```

**Pros:**
- Includes database
- Good free tier
- Easy integration

**Cons:**
- Vendor lock-in
- Less flexible than S3

### AI Service Options

#### Option 1: OpenAI API
```bash
npm install openai
```

**Pros:**
- Most popular
- Good documentation
- Multiple models

**Cons:**
- Can be expensive
- Rate limits

#### Option 2: Anthropic (Claude)
```bash
npm install @anthropic-ai/sdk
```

**Pros:**
- High quality responses
- Good for analysis

**Cons:**
- More expensive
- Fewer models

#### Option 3: Google Gemini
```bash
npm install @google/generative-ai
```

**Pros:**
- Competitive pricing
- Good performance

**Cons:**
- Less mature
- Smaller community

### Database Options

#### Option 1: Supabase (PostgreSQL)
```bash
npm install @supabase/supabase-js
```

**Pros:**
- Includes auth (but you're using Clerk)
- Real-time features
- Good free tier
- File storage included

**Cons:**
- Vendor lock-in
- Less control

#### Option 2: Vercel Postgres
```bash
npm install @vercel/postgres
```

**Pros:**
- Easy with Vercel deployment
- Serverless
- Good performance

**Cons:**
- Vercel-specific
- Less flexible

#### Option 3: MongoDB Atlas
```bash
npm install mongodb
```

**Pros:**
- Flexible schema
- Good free tier
- Easy to use

**Cons:**
- NoSQL (if you prefer SQL)
- Can be complex

#### Option 4: Turso (SQLite)
```bash
npm install @libsql/client
```

**Pros:**
- Edge-compatible
- Fast
- Good free tier

**Cons:**
- SQLite limitations
- Newer service

---

## Payment Integration

### Option 1: Keep Stripe (Recommended)

**Why:** Clerk handles auth, Stripe handles payments - they work well together.

**Setup:**
1. Keep Stripe for subscriptions
2. Link Stripe customer to Clerk user ID
3. Store subscription status in database
4. Use Clerk webhooks to sync user data

**Example:**
```tsx
// When user subscribes
const { userId } = await auth(); // Clerk user ID
await stripe.customers.create({
  email: user.emailAddresses[0].emailAddress,
  metadata: {
    clerkUserId: userId, // Link to Clerk
  },
});
```

### Option 2: Clerk Billing (If Available)

Clerk has some billing features, but Stripe is more comprehensive for subscriptions.

### Option 3: Remove Payments (Free Tier Only)

If you want to remove payments entirely:
- Remove Stripe integration
- Remove subscription checks
- Make all features free
- Track usage in database (optional)

---

## Migration Checklist

### Phase 1: Clerk Setup
- [ ] Install Clerk package
- [ ] Setup Clerk account
- [ ] Add environment variables
- [ ] Setup ClerkProvider in layout
- [ ] Create middleware for route protection

### Phase 2: Replace Auth
- [ ] Create new auth store/hooks
- [ ] Update auth page
- [ ] Update protected routes
- [ ] Update components using auth
- [ ] Remove Puter.js auth code

### Phase 3: Replace Other Services
- [ ] Choose file storage solution
- [ ] Choose AI service
- [ ] Choose database
- [ ] Migrate file upload logic
- [ ] Migrate AI analysis logic
- [ ] Migrate data storage logic

### Phase 4: Payment Integration
- [ ] Decide on payment solution
- [ ] Link Clerk users to payment system
- [ ] Update subscription checks
- [ ] Test payment flow

### Phase 5: Testing
- [ ] Test authentication flow
- [ ] Test protected routes
- [ ] Test file upload
- [ ] Test CV analysis
- [ ] Test payment flow (if applicable)

---

## Recommended Stack

Based on your needs, here's a recommended stack:

```
Authentication: Clerk
File Storage: Uploadthing or Supabase Storage
AI Service: OpenAI API or Anthropic
Database: Supabase (PostgreSQL) or Vercel Postgres
Payments: Stripe (keep it)
```

**Why this stack:**
- Clerk: Best auth for Next.js
- Uploadthing: Easiest file upload for Next.js
- Supabase: Includes database + storage, good free tier
- OpenAI: Most popular, good for CV analysis
- Stripe: Industry standard for payments

---

## Next Steps

1. **Setup Clerk** - Follow the setup steps above
2. **Choose alternatives** - Decide on file storage, AI, and database
3. **Migrate incrementally** - Start with auth, then other services
4. **Test thoroughly** - Ensure all flows work

---

## Questions?

Common questions:

**Q: Can I use Clerk and Stripe together?**  
A: Yes! Clerk for auth, Stripe for payments. They work great together.

**Q: Do I need to replace all Puter.js services?**  
A: Only if you want to. You could keep Puter.js for file/AI/KV and just replace auth.

**Q: What's the easiest migration path?**  
A: Replace auth with Clerk first, then migrate other services one by one.

**Q: Can I use Clerk's user management with Puter.js storage?**  
A: Technically yes, but not recommended. Better to migrate everything.

---

*Ready to start? Let me know which services you want to use and I'll help you implement them!*


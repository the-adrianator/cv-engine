# Migration Guide: React Router → Next.js

**From:** `ai-cv-analyser` (React Router v7 SPA)  
**To:** `cv-engine` (Next.js 16 App Router)

---

## Table of Contents

1. [Key Differences](#key-differences)
2. [Migration Strategy](#migration-strategy)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Component Migration](#component-migration)
5. [Route Migration](#route-migration)
6. [State Management](#state-management)
7. [API Routes](#api-routes)
8. [Styling Migration](#styling-migration)
9. [Environment Variables](#environment-variables)
10. [Common Pitfalls](#common-pitfalls)

---

## Key Differences

### React Router vs Next.js

| Feature | React Router v7 | Next.js 16 |
|---------|----------------|------------|
| **Routing** | File-based (`routes/`) | App Router (`app/`) |
| **Data Loading** | `loader` functions | `async` Server Components, `fetch` |
| **Forms/Actions** | `action` functions | Server Actions |
| **SSR** | Optional (disabled in your app) | Default (Server Components) |
| **API Routes** | `routes/api/*.ts` | `app/api/*/route.ts` |
| **Layouts** | `root.tsx` Layout component | `layout.tsx` files |
| **Metadata** | `meta` export function | `metadata` export object |
| **Client Components** | All components by default | Mark with `'use client'` |
| **Navigation** | `useNavigate`, `Link` from react-router | `useRouter`, `Link` from next/navigation |

---

## Migration Strategy

### Phase 1: Setup & Dependencies
1. Install required dependencies
2. Setup folder structure
3. Configure Next.js
4. Migrate utilities and types

### Phase 2: Core Infrastructure
1. Migrate state management (Zustand stores)
2. Setup theme system
3. Migrate utility functions
4. Setup API routes

### Phase 3: Components & Pages
1. Migrate shared components
2. Convert routes to pages
3. Migrate layouts
4. Update navigation

### Phase 4: Features & Polish
1. Migrate file upload
2. Migrate CV analysis flow
3. Setup Stripe integration
4. Add error handling

---

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
cd cv-engine
npm install zustand @stripe/stripe-js stripe pdfjs-dist react-dropzone lucide-react clsx tailwind-merge
npm install -D @types/node
```

**Required packages:**
- `zustand` - State management
- `@stripe/stripe-js` - Stripe client
- `stripe` - Stripe server
- `pdfjs-dist` - PDF processing
- `react-dropzone` - File upload
- `lucide-react` - Icons
- `clsx`, `tailwind-merge` - Utility functions

### Step 2: Setup Folder Structure

```
cv-engine/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Home
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   └── cv/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts
│   │   └── create-checkout/
│   │       └── route.ts
│   ├── layout.tsx           # Root layout
│   └── globals.css
├── components/
│   ├── ui/                   # Shared UI components
│   ├── cv/                   # CV-related components
│   └── layout/               # Layout components
├── lib/
│   ├── stores/               # Zustand stores
│   ├── utils/                # Utility functions
│   └── services/             # External services
├── types/
│   └── index.d.ts
└── constants/
    └── index.ts
```

### Step 3: Migrate Types

Copy type definitions from `ai-cv-analyser/app/types/` to `cv-engine/types/`

### Step 4: Migrate Utilities

Copy utility functions from `ai-cv-analyser/app/lib/` to `cv-engine/lib/utils/`

### Step 5: Setup Zustand Stores

Migrate stores to `cv-engine/lib/stores/`:
- `puter.ts` → `stores/puter.ts`
- `theme.ts` → `stores/theme.ts`

**Important:** Add `'use client'` directive to all store files.

### Step 6: Migrate Components

1. Copy components to `cv-engine/components/`
2. Add `'use client'` to components that use:
   - Hooks (useState, useEffect, etc.)
   - Browser APIs
   - Event handlers
   - Zustand stores

### Step 7: Convert Routes to Pages

See [Route Migration](#route-migration) section below.

---

## Component Migration

### Client Components

Any component using hooks, browser APIs, or state must be marked with `'use client'`:

```tsx
// Before (React Router)
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState();
  // ...
}

// After (Next.js)
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Server Components

Components that don't need client-side JavaScript can remain Server Components (default):

```tsx
// No 'use client' needed
export default function ServerComponent() {
  return <div>Static content</div>;
}
```

### Component Categories

**Client Components (need 'use client'):**
- `Navbar.tsx` - Uses navigation, theme toggle
- `CVCard.tsx` - Uses hooks, file reading
- `FileUploader.tsx` - Uses dropzone, file handling
- `ThemeToggle.tsx` - Uses state, browser APIs
- All components using Zustand stores

**Server Components (no 'use client'):**
- Static content components
- Components that only render data

---

## Route Migration

### Home Page

**Before (React Router):**
```tsx
// routes/home.tsx
export default function Home() {
  const { auth, kv } = usePuterStore();
  // ...
}
```

**After (Next.js):**
```tsx
// app/(main)/page.tsx
'use client';

import { usePuterStore } from '@/lib/stores/puter';

export default function HomePage() {
  const { auth, kv } = usePuterStore();
  // ...
}
```

### Dynamic Routes

**Before (React Router):**
```tsx
// routes/cv.tsx
const CV = () => {
  const { id } = useParams();
  // ...
}
```

**After (Next.js):**
```tsx
// app/(main)/cv/[id]/page.tsx
'use client';

export default function CVPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // ...
}
```

### Route Structure Mapping

| React Router | Next.js |
|-------------|---------|
| `routes/home.tsx` | `app/(main)/page.tsx` |
| `routes/auth.tsx` | `app/(auth)/auth/page.tsx` |
| `routes/upload.tsx` | `app/(main)/upload/page.tsx` |
| `routes/cv.tsx` (with `:id`) | `app/(main)/cv/[id]/page.tsx` |
| `routes/pricing.tsx` | `app/pricing/page.tsx` |
| `routes/wipe.tsx` | `app/(main)/wipe/page.tsx` |

### Route Groups

Use route groups `(auth)` and `(main)` to organize layouts:
- `(main)` - Main app with navbar
- `(auth)` - Auth pages without navbar

---

## State Management

### Zustand Stores

Zustand works the same in Next.js, but stores must be client components:

```tsx
// lib/stores/puter.ts
'use client';

import { create } from 'zustand';
// ... rest of store
```

### Server State

For server-side data, use Next.js Server Components:

```tsx
// app/(main)/page.tsx (Server Component)
export default async function HomePage() {
  // Fetch data directly (no hooks needed)
  const data = await fetchData();
  
  return <ClientComponent data={data} />;
}
```

---

## API Routes

### Before (React Router)

```tsx
// routes/api.webhooks.stripe.ts
export async function action({ request }: ActionFunctionArgs) {
  // ...
}
```

### After (Next.js)

```tsx
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  // ...
  
  return NextResponse.json({ received: true });
}
```

### API Route Methods

- `GET` → `export async function GET()`
- `POST` → `export async function POST()`
- `PUT` → `export async function PUT()`
- `DELETE` → `export async function DELETE()`

---

## Styling Migration

### Tailwind CSS

Next.js already has Tailwind CSS v4 configured. You can:

1. **Copy styles directly:**
   - Copy `app.css` content to `app/globals.css`
   - Update CSS variables if needed

2. **Update class names:**
   - Most Tailwind classes work the same
   - Check for any React Router specific classes

### CSS Modules

You can also use CSS Modules in Next.js:

```tsx
// Component.module.css
.container {
  /* styles */
}

// Component.tsx
import styles from './Component.module.css';
<div className={styles.container} />
```

---

## Environment Variables

### Next.js Environment Variables

**Client-side:**
- Prefix with `NEXT_PUBLIC_`
- Access via `process.env.NEXT_PUBLIC_*`

**Server-side:**
- No prefix needed
- Access via `process.env.*`

### Migration

**Before (React Router):**
```tsx
import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
process.env.STRIPE_SECRET_KEY
```

**After (Next.js):**
```tsx
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  // Client
process.env.STRIPE_SECRET_KEY                   // Server
```

### .env.local Example

```env
# Client-side (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side (private)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
```

---

## Common Pitfalls

### 1. Missing 'use client' Directive

**Error:** "useState can only be used in Client Components"

**Fix:** Add `'use client'` at the top of component files using hooks.

### 2. Using useParams Incorrectly

**Before:**
```tsx
const { id } = useParams();
```

**After:**
```tsx
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
}
```

### 3. Navigation

**Before:**
```tsx
import { useNavigate } from 'react-router';
const navigate = useNavigate();
navigate('/path');
```

**After:**
```tsx
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/path');
```

### 4. Links

**Before:**
```tsx
import { Link } from 'react-router';
<Link to="/path">Link</Link>
```

**After:**
```tsx
import Link from 'next/link';
<Link href="/path">Link</Link>
```

### 5. Metadata

**Before:**
```tsx
export function meta() {
  return [{ title: "Page Title" }];
}
```

**After:**
```tsx
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

### 6. Server Actions vs API Routes

**Server Actions** (for forms):
```tsx
'use server';

export async function createCV(formData: FormData) {
  // Server-side logic
}
```

**API Routes** (for external APIs):
```tsx
// app/api/cv/route.ts
export async function POST(request: Request) {
  // Handle request
}
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Install all dependencies
- [ ] Setup folder structure
- [ ] Configure Next.js
- [ ] Setup environment variables

### Phase 2: Core
- [ ] Migrate types
- [ ] Migrate utilities
- [ ] Migrate Zustand stores
- [ ] Setup theme system

### Phase 3: Components
- [ ] Migrate UI components
- [ ] Add 'use client' where needed
- [ ] Test component rendering

### Phase 4: Pages
- [ ] Migrate home page
- [ ] Migrate auth page
- [ ] Migrate upload page
- [ ] Migrate CV detail page
- [ ] Migrate pricing page

### Phase 5: API Routes
- [ ] Migrate Stripe webhook
- [ ] Migrate checkout route
- [ ] Test API endpoints

### Phase 6: Features
- [ ] Test file upload
- [ ] Test CV analysis
- [ ] Test authentication
- [ ] Test Stripe integration

### Phase 7: Polish
- [ ] Fix errors and warnings
- [ ] Optimize performance
- [ ] Add error boundaries
- [ ] Test all flows

---

## Next Steps

1. **Review this guide** and identify what you want to change
2. **Share your specific requirements** - What changes do you want to make?
3. **Start with Phase 1** - Setup dependencies and structure
4. **Migrate incrementally** - One feature at a time

---

## Questions to Consider

Before starting migration, think about:

1. **What changes do you want to make?**
   - Architecture improvements?
   - Feature additions?
   - Performance optimizations?
   - Security enhancements?

2. **Do you want to keep Puter.js integration?**
   - Or migrate to a different backend?

3. **Do you want to improve the subscription system?**
   - Add proper database?
   - Better usage tracking?

4. **Do you want to add new features?**
   - User profiles?
   - CV templates?
   - Export functionality?

---

*Ready to start migration? Share your specific requirements and we'll create a detailed implementation plan!*


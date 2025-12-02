# CV Engine Architecture

**Status:** Migration in Progress  
**Target:** Production-Ready CV Analysis Platform

---

## Technology Stack

### Core Framework
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### Authentication & User Management
- **Clerk** - Authentication, user sessions, user profiles

### Database & Storage
- **Supabase (PostgreSQL)** - Primary database for:
  - User metadata
  - CV records and analysis results
  - Usage tracking
  - Subscription status (future)
- **Supabase Storage** - File storage for:
  - CV PDFs
  - CV preview images

### AI Services
- **OpenAI API** - CV analysis and feedback generation
  - Model: GPT-4 or GPT-4 Turbo (for analysis)
  - Vision API: For CV image analysis (if needed)

### Payments (Future)
- **Stripe** - Subscription management
  - Free tier: 5 scans/month
  - Premium tier: Unlimited scans

### Deployment
- **Vercel** - Hosting and deployment
- **Environment Variables** - Managed via Vercel dashboard

---

## Data Model

### Database Schema (Supabase)

#### `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Clerk user ID
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `cvs` table
```sql
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  job_title TEXT,
  job_description TEXT,
  pdf_path TEXT NOT NULL, -- Supabase Storage path
  image_path TEXT NOT NULL, -- Supabase Storage path
  feedback JSONB, -- Analysis results
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_created_at ON cvs(created_at DESC);
```

#### `usage_tracking` table
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scans_this_month INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_usage_user_id ON usage_tracking(user_id);
```

#### `subscriptions` table (Future - for Stripe integration)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'past_due'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## Folder Structure

```
cv-engine/
├── app/
│   ├── (auth)/
│   │   ├── auth/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   └── sign-up/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── layout.tsx          # Main layout with Navbar
│   │   ├── page.tsx            # Home page
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── cv/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── cvs/
│   │   │   ├── route.ts        # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET, DELETE
│   │   ├── analyze/
│   │   │   └── route.ts        # POST - Analyze CV
│   │   ├── usage/
│   │   │   └── route.ts        # GET - Usage stats
│   │   └── webhooks/
│   │       ├── clerk/
│   │       │   └── route.ts    # Clerk webhooks
│   │       └── stripe/
│   │           └── route.ts    # Stripe webhooks (future)
│   ├── layout.tsx              # Root layout with ClerkProvider
│   └── globals.css
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── cv/                      # CV-specific components
│   │   ├── CVCard.tsx
│   │   ├── FileUploader.tsx
│   │   ├── Summary.tsx
│   │   ├── ATS.tsx
│   │   └── Details.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── ThemeToggle.tsx
├── lib/
│   ├── clerk/                   # Clerk utilities
│   │   └── auth.ts
│   ├── supabase/                # Supabase client
│   │   ├── client.ts            # Client-side
│   │   ├── server.ts             # Server-side
│   │   └── storage.ts            # Storage utilities
│   ├── openai/                  # OpenAI integration
│   │   └── analyze.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.ts
│   │   └── theme.ts
│   ├── utils/                    # Utility functions
│   │   ├── pdf2img.ts
│   │   └── cn.ts
│   └── constants/
│       └── limits.ts            # Usage limits
├── types/
│   └── index.d.ts               # TypeScript types
├── middleware.ts                 # Clerk middleware
└── .env.local.example
```

---

## Key Features & Flows

### 1. Authentication Flow
1. User visits protected route
2. Middleware checks authentication
3. If not authenticated → redirect to `/auth/sign-in`
4. After sign-in → redirect to original route
5. Clerk manages session

### 2. CV Upload & Analysis Flow
1. User uploads PDF on `/upload`
2. PDF uploaded to Supabase Storage
3. PDF converted to image (client-side with PDF.js)
4. Image uploaded to Supabase Storage
5. CV record created in database
6. Analysis request sent to OpenAI API
7. Results stored in database
8. User redirected to `/cv/[id]`

### 3. Usage Tracking Flow
1. On each CV analysis, increment `scans_this_month`
2. Check monthly limit (5 for free tier)
3. Reset counter on first scan of new month
4. Display usage stats to user

### 4. CV Viewing Flow
1. User navigates to `/cv/[id]`
2. Server fetches CV data from database
3. PDF and image URLs generated from Supabase Storage
4. Feedback displayed with components

---

## API Routes

### `/api/cvs`
- `GET` - List user's CVs
- `POST` - Create new CV record

### `/api/cvs/[id]`
- `GET` - Get CV details
- `DELETE` - Delete CV

### `/api/analyze`
- `POST` - Analyze CV with OpenAI
  - Body: `{ cvId: string, jobTitle: string, jobDescription: string }`
  - Returns: Analysis results

### `/api/usage`
- `GET` - Get user's usage stats

---

## Security Considerations

### Authentication
- ✅ Clerk middleware protects routes
- ✅ Server-side auth checks in API routes
- ✅ User can only access their own CVs

### File Storage
- ✅ Supabase Storage with RLS (Row Level Security)
- ✅ Signed URLs for file access
- ✅ File size limits (20MB)
- ✅ File type validation (PDF only)

### API Security
- ✅ Rate limiting (to be implemented)
- ✅ Input validation
- ✅ Error handling without exposing internals
- ✅ CORS configuration

### Database
- ✅ RLS policies on Supabase tables
- ✅ User can only access their own data
- ✅ Prepared statements (via Supabase client)

---

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-only)

# OpenAI
OPENAI_API_KEY=sk-...

# Storage
NEXT_PUBLIC_MAX_FILE_SIZE=20971520 # 20MB in bytes

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Production Readiness Checklist

### Authentication ✅
- [x] Clerk integration
- [ ] Error boundaries
- [ ] Loading states
- [ ] Session management

### Database ✅
- [ ] Supabase setup
- [ ] Schema migration
- [ ] RLS policies
- [ ] Indexes
- [ ] Backup strategy

### File Storage ✅
- [ ] Supabase Storage setup
- [ ] Upload validation
- [ ] Error handling
- [ ] Cleanup on delete

### AI Integration ✅
- [ ] OpenAI API setup
- [ ] Error handling
- [ ] Rate limiting
- [ ] Cost monitoring

### Usage Tracking ✅
- [ ] Usage limits enforcement
- [ ] Monthly reset logic
- [ ] Usage display

### Error Handling ✅
- [ ] Try/catch in all async operations
- [ ] User-friendly error messages
- [ ] Error logging
- [ ] Error boundaries

### Security ✅
- [ ] Input validation
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Environment variable validation

### Performance ✅
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Database query optimization
- [ ] Loading states

### Testing ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Monitoring ✅
- [ ] Error tracking (Sentry)
- [ ] Analytics
- [ ] Performance monitoring

---

## Migration Phases

### Phase 1: Foundation ✅ (Current)
- [x] Architecture planning
- [ ] Clerk authentication setup
- [ ] Supabase database setup
- [ ] Basic folder structure

### Phase 2: Core Features
- [ ] CV upload functionality
- [ ] OpenAI integration
- [ ] CV viewing
- [ ] Usage tracking

### Phase 3: Production Hardening
- [ ] Error handling
- [ ] Input validation
- [ ] Rate limiting
- [ ] Security improvements

### Phase 4: Monetization (Future)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage limits enforcement
- [ ] Payment flows

### Phase 5: Enhancements
- [ ] Additional features
- [ ] Performance optimization
- [ ] User experience improvements

---

## Future Enhancements (Post-Migration)

### Potential Features
1. **CV Templates** - Pre-designed CV templates
2. **Export Options** - PDF, Word, JSON export
3. **Comparison Tool** - Compare multiple CVs
4. **Job Matching** - Match CVs to job postings
5. **Resume Builder** - Interactive CV builder
6. **Cover Letter Generator** - AI-powered cover letters
7. **Interview Prep** - Practice questions based on CV
8. **Analytics Dashboard** - Track CV performance
9. **Multi-language Support** - Analyze CVs in multiple languages
10. **Team/Enterprise Features** - For recruiters/HR teams

---

*Last Updated: 2025-01-27*


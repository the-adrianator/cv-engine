# Migration Guide: From unstable_after to Inngest

This guide shows exactly how to migrate from the current `unstable_after` implementation to Inngest.

## Step-by-Step Migration

### Step 1: Install Inngest

```bash
cd cv-engine
npm install inngest
```

### Step 2: Create Inngest Client

Create `lib/inngest/client.ts`:

```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({ 
  id: "cv-engine",
});
```

### Step 3: Create Inngest Route Handler

Create `app/api/inngest/route.ts` (see `app/api/inngest/route.ts.example` for full code).

This file:
- Receives events from Inngest
- Processes CV analysis in steps (each step is retryable)
- Updates database with results

### Step 4: Update Upload Route

In `app/api/cvs/upload/route.ts`, replace the entire `unstable_after` section (lines 195-324) with:

```typescript
// Enqueue CV analysis job using Inngest
try {
  await inngest.send({
    name: "cv/analyze",
    data: {
      cvId: cv.id,
      userId,
      imagePaths: imagePaths, // Already an array
      jobTitle,
      jobDescription,
    },
  });
  
  console.log("CV analysis job enqueued:", cv.id);
} catch (error) {
  console.error("Failed to enqueue analysis job:", error);
  // Update status to failed if we can't even queue the job
  await updateCV(cv.id, userId, {
    analysis_status: "failed",
    analysis_error: "Failed to queue analysis job",
  });
}
```

**Don't forget to add the import at the top:**
```typescript
import { inngest } from "@/lib/inngest/client";
```

### Step 5: Remove Old Code

Delete the `runAnalysis` function and the `unstable_after`/IIFE fallback code (lines 199-324).

### Step 6: Development Setup

1. Install Inngest CLI globally:
```bash
npm install -g inngest-cli
```

2. In a separate terminal, start Inngest Dev Server:
```bash
inngest dev
```

3. Start your Next.js app:
```bash
npm run dev
```

The Inngest Dev Server will:
- Show all your functions
- Display job execution logs
- Allow you to trigger test events
- Provide a dashboard at http://localhost:8288

### Step 7: Test Locally

1. Upload a CV through your app
2. Check the Inngest Dev Server dashboard to see the job
3. Watch the job execute step-by-step
4. Verify the CV is updated in your database

### Step 8: Production Setup

1. Create account at [inngest.com](https://www.inngest.com)
2. Create a new app
3. In your Inngest dashboard:
   - Go to "Apps" → Your App → "Sync"
   - Copy the "Event Key" and "Signing Key"
4. Add to Vercel environment variables:
   - `INNGEST_EVENT_KEY` (optional, for sending events)
   - `INNGEST_SIGNING_KEY` (required, for webhook verification)
5. Deploy your app
6. In Inngest dashboard, add your app URL: `https://your-app.vercel.app/api/inngest`

### Step 9: Verify Production

1. Upload a CV in production
2. Check Inngest dashboard → "Runs" to see job execution
3. Verify CV is analyzed and feedback is saved

## What Changes

### Before (Current)
```typescript
// Best-effort, may not complete
unstable_after(runAnalysis);
```

### After (Inngest)
```typescript
// Guaranteed execution with retries
await inngest.send({
  name: "cv/analyze",
  data: { cvId, userId, ... }
});
```

## Benefits

1. **Reliability**: Jobs always execute (at-least-once delivery)
2. **Retries**: Automatic retries on failure (configurable)
3. **Visibility**: See all jobs in Inngest dashboard
4. **Durability**: Jobs survive serverless function termination
5. **Observability**: Built-in logging and error tracking

## Rollback Plan

If you need to rollback:
1. Revert the upload route changes
2. Restore the `unstable_after` code
3. Remove Inngest files
4. Uninstall: `npm uninstall inngest`

## Next Steps After Migration

1. Monitor job execution in Inngest dashboard
2. Set up alerts for failed jobs
3. Consider adding more job types (e.g., cleanup, notifications)
4. Optimize retry configuration based on real-world usage


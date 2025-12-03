# Durable Job Queue Implementation Guide

## Overview

This guide provides a step-by-step plan to replace the current best-effort background task implementation with a reliable, durable job queue system for CV analysis.

## Current State

**Problem:** The current implementation uses `unstable_after` (experimental) and IIFE fallback, which are:
- ❌ Not guaranteed to complete in serverless environments
- ❌ Can be terminated when the function shuts down
- ❌ No retry mechanism
- ❌ No visibility into job status
- ❌ No durability guarantees

**Solution:** Implement a durable job queue that:
- ✅ Guarantees job execution (at-least-once delivery)
- ✅ Automatic retries on failure
- ✅ Job status visibility
- ✅ Survives serverless function termination
- ✅ Scales independently

---

## Recommended Solution: Inngest

**Why Inngest?**
- ✅ Built specifically for serverless (perfect for Vercel)
- ✅ Zero infrastructure to manage
- ✅ Built-in retries, observability, and error handling
- ✅ Free tier: 25,000 function invocations/month
- ✅ TypeScript-first with excellent DX
- ✅ Works seamlessly with Next.js App Router

**Alternatives:**
- **Trigger.dev** - Similar to Inngest, also serverless-first
- **Upstash QStash** - Simpler but less features
- **BullMQ + Upstash Redis** - More control but requires Redis setup

---

## Implementation Plan

### Phase 1: Setup Inngest (Recommended)

#### Step 1: Install Dependencies

```bash
npm install inngest
```

#### Step 2: Create Inngest Client

Create `lib/inngest/client.ts`:

```typescript
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "cv-engine",
  // In development, this will use the Inngest Dev Server
  // In production, this will use your Inngest account
});
```

#### Step 3: Create Inngest Functions

Create `app/api/inngest/route.ts`:

```typescript
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { analyzeCV, prepareInstructions, sanitizeJobInputs } from "@/lib/openai/analyze";
import { updateCV } from "@/lib/supabase/db";
import { getSignedUrl } from "@/lib/supabase/storage";
import type { Json } from "@/types/database";

// Define the function that will process CV analysis
export const analyzeCVFunction = inngest.createFunction(
  { id: "analyze-cv" },
  { event: "cv/analyze" },
  async ({ event, step }) => {
    const { cvId, userId, imagePaths, jobTitle, jobDescription } = event.data;

    // Step 1: Generate signed URL (with retry)
    const imageUrl = await step.run("generate-signed-url", async () => {
      const firstImagePath = Array.isArray(imagePaths) ? imagePaths[0] : imagePaths;
      const { url, error } = await getSignedUrl(firstImagePath, 3600);
      
      if (error || !url) {
        throw new Error(error?.message || "Failed to generate signed URL");
      }
      
      return url;
    });

    // Step 2: Sanitize inputs (with retry)
    const sanitized = await step.run("sanitize-inputs", async () => {
      return sanitizeJobInputs({ jobTitle, jobDescription });
    });

    // Step 3: Prepare instructions (with retry)
    const instructions = await step.run("prepare-instructions", async () => {
      return prepareInstructions({
        jobTitle: sanitized.jobTitle,
        jobDescription: sanitized.jobDescription,
      });
    });

    // Step 4: Analyze CV (with retry and longer timeout)
    const analysis = await step.run(
      "analyze-cv",
      async () => {
        const { feedback, error } = await analyzeCV(imageUrl, instructions);
        
        if (error || !feedback) {
          throw new Error(error?.message || "Analysis failed");
        }
        
        return feedback;
      },
      {
        // Retry configuration
        retries: 3,
        timeout: "5m", // 5 minutes for OpenAI API
      }
    );

    // Step 5: Update database (with retry)
    await step.run("save-feedback", async () => {
      const feedbackJson = JSON.parse(JSON.stringify(analysis)) as Json;
      const { error: updateError } = await updateCV(cvId, userId, {
        feedback: feedbackJson,
        analysis_status: "succeeded",
        analysis_error: null,
      });

      if (updateError) {
        throw new Error(updateError.message || "Failed to save feedback");
      }
    });

    return { success: true, cvId };
  }
);

// Export the serve handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeCVFunction],
});
```

#### Step 4: Update Upload Route

Update `app/api/cvs/upload/route.ts`:

```typescript
// ... existing imports ...
import { inngest } from "@/lib/inngest/client";

// ... existing code until after CV creation ...

// Replace the unstable_after/IIFE section with:
// Enqueue CV analysis job using Inngest
try {
  await inngest.send({
    name: "cv/analyze",
    data: {
      cvId: cv.id,
      userId,
      imagePaths: imagePaths, // Array of image paths
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

// Return success response immediately
return NextResponse.json(
  {
    success: true,
    cv: {
      id: cv.id,
      companyName: cv.company_name,
      jobTitle: cv.job_title,
    },
  },
  { status: 201 }
);
```

#### Step 5: Add Error Handling Function

Add to `app/api/inngest/route.ts`:

```typescript
// Function to handle analysis failures
export const handleAnalysisFailure = inngest.createFunction(
  { id: "handle-analysis-failure" },
  { event: "cv/analyze.failed" },
  async ({ event, step }) => {
    const { cvId, userId, error } = event.data;

    await step.run("update-failed-status", async () => {
      const { updateCV } = await import("@/lib/supabase/db");
      await updateCV(cvId, userId, {
        analysis_status: "failed",
        analysis_error: error?.message || "Analysis failed",
      });
    });
  }
);

// Update the serve export to include both functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeCVFunction, handleAnalysisFailure],
});
```

#### Step 6: Environment Variables

Add to `.env.local`:

```bash
# Inngest
INNGEST_EVENT_KEY=your-event-key  # Get from Inngest dashboard
INNGEST_SIGNING_KEY=your-signing-key  # Get from Inngest dashboard
```

#### Step 7: Development Setup

1. Install Inngest CLI:
```bash
npm install -g inngest-cli
```

2. Run Inngest Dev Server (in a separate terminal):
```bash
inngest dev
```

3. Start your Next.js app:
```bash
npm run dev
```

#### Step 8: Production Setup

1. Create account at [inngest.com](https://www.inngest.com)
2. Create a new app
3. Get your Event Key and Signing Key from the dashboard
4. Add environment variables to Vercel:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
5. Deploy your app

---

## Alternative: Trigger.dev

If you prefer Trigger.dev, here's the setup:

### Step 1: Install

```bash
npm install @trigger.dev/sdk @trigger.dev/nextjs
```

### Step 2: Create Trigger Client

`lib/trigger/client.ts`:

```typescript
import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "cv-engine",
  apiKey: process.env.TRIGGER_API_KEY!,
});
```

### Step 3: Create Job

`app/api/trigger/route.ts`:

```typescript
import { z } from "zod";
import { TriggerClient } from "@trigger.dev/sdk";
import { client } from "@/lib/trigger/client";

client.defineJob({
  id: "analyze-cv",
  name: "Analyze CV",
  version: "1.0.0",
  trigger: client.defineEventTrigger({
    name: "cv.analyze",
    schema: z.object({
      cvId: z.string(),
      userId: z.string(),
      imagePaths: z.array(z.string()),
      jobTitle: z.string(),
      jobDescription: z.string(),
    }),
  }),
  run: async (payload, io) => {
    // Similar implementation to Inngest
    // Use io.logger for logging
    // Use io.runTask for retryable steps
  },
});

export const { POST } = client.createNextJsRoute();
```

---

## Alternative: Upstash QStash (Simpler)

### Step 1: Install

```bash
npm install @upstash/qstash
```

### Step 2: Create Queue Handler

`app/api/jobs/analyze/route.ts`:

```typescript
import { Client } from "@upstash/qstash";
import { analyzeCV, prepareInstructions, sanitizeJobInputs } from "@/lib/openai/analyze";
import { updateCV } from "@/lib/supabase/db";
import { getSignedUrl } from "@/lib/supabase/storage";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { cvId, userId, imagePaths, jobTitle, jobDescription } = body;

  try {
    // ... analysis logic ...
    
    await updateCV(cvId, userId, {
      feedback: feedbackJson,
      analysis_status: "succeeded",
    });
  } catch (error) {
    await updateCV(cvId, userId, {
      analysis_status: "failed",
      analysis_error: error.message,
    });
    throw error;
  }
}
```

### Step 3: Update Upload Route

```typescript
import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

// After CV creation:
await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/analyze`,
  body: {
    cvId: cv.id,
    userId,
    imagePaths,
    jobTitle,
    jobDescription,
  },
  retries: 3,
});
```

---

## Migration Checklist

- [ ] Choose job queue solution (recommend Inngest)
- [ ] Install dependencies
- [ ] Set up development environment
- [ ] Create job handler function
- [ ] Update upload route to enqueue jobs
- [ ] Add error handling and status updates
- [ ] Test in development
- [ ] Set up production account
- [ ] Add environment variables
- [ ] Deploy and test
- [ ] Monitor job execution
- [ ] Remove old `unstable_after` code

---

## Benefits After Migration

1. **Reliability**: Jobs guaranteed to execute (at-least-once)
2. **Retries**: Automatic retries on failure
3. **Visibility**: See job status, logs, and errors in dashboard
4. **Scalability**: Jobs process independently of API routes
5. **Durability**: Jobs survive serverless function termination
6. **Observability**: Built-in monitoring and alerting

---

## Cost Considerations

### Inngest
- Free tier: 25,000 function invocations/month
- Paid: $20/month for 100k invocations
- Good for: Most use cases

### Trigger.dev
- Free tier: 10,000 task runs/month
- Paid: $20/month for 50k runs
- Good for: Similar to Inngest

### Upstash QStash
- Free tier: 10,000 requests/month
- Paid: $0.20 per 1,000 requests
- Good for: Simple use cases

---

## Next Steps

1. **Start with Inngest** (recommended for Vercel)
2. **Test locally** with Inngest Dev Server
3. **Deploy to staging** and verify
4. **Monitor** job execution and errors
5. **Iterate** based on real-world usage

---

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Next.js Guide](https://www.inngest.com/docs/quick-start/nextjs)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Upstash QStash Docs](https://docs.upstash.com/qstash)


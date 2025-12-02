import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/upload(.*)",
  "/cv(.*)",
  "/settings(.*)",
  "/api/cvs(.*)",
  "/api/analyze(.*)",
  "/api/usage(.*)",
]);

// Define public routes that should NOT be protected (auth routes)
const isPublicRoute = createRouteMatcher([
  "/auth(.*)", // All auth routes are public
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip protection for public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect routes that match the pattern
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};


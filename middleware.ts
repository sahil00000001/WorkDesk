/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CLERK MIDDLEWARE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Runs on every incoming request before the page renders.
 *  Clerk's middleware protects all dashboard routes — any request to a
 *  protected path without a valid Clerk session is redirected to /login.
 *
 *  Public routes  :  /login  (and any static assets handled by the matcher)
 *  Protected routes:  /dashboard, /attendance, /leaves, /employees,
 *                     /policies, /announcements, /reports, /profile
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/attendance(.*)',
  '/leaves(.*)',
  '/employees(.*)',
  '/policies(.*)',
  '/announcements(.*)',
  '/reports(.*)',
  '/profile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

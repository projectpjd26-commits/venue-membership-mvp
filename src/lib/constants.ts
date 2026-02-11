/** Cookie key for the currently selected venue (slug). */
export const CURRENT_VENUE_COOKIE = "current_venue_slug";

/**
 * Permanent app admins (co-founders). These emails always have full admin access
 * regardless of INTERNAL_DEMO_USER_IDS. Match is case-insensitive on email.
 * Replace with your and your co-founder's real emails and names.
 */
export const PERMANENT_ADMINS: { email: string; name: string }[] = [
  { email: "you@example.com", name: "Your Name" },
  { email: "cofounder@example.com", name: "Co-founder Name" },
];

/** Cookie used to remember where to redirect after magic-link sign-in. */
export const AUTH_NEXT_COOKIE = "coteri_auth_next";

/** Cookie set at login: "admin" | "venue_owner" | "member" so the app can show who is logged in. */
export const USER_ROLE_COOKIE = "coteri_user_role";

/** Pilot venue slugs; use for validation and fallback lists. */
export const PILOT_VENUE_SLUGS = ["the-function-sf", "the-starry-plough"] as const;

/**
 * When true: demo reset, demo grant, and /internal/demo are enabled; fallback list includes mock venues.
 * When false or unset: production — demo routes disabled, fallback = pilots only.
 * Set IS_DEMO_MODE=true in env for local/demo deployments.
 */
export function isDemoMode(): boolean {
  return process.env.IS_DEMO_MODE === "true";
}

/** Fallback venue list when DB is unavailable. Demo mode: pilots + mock venues; production: pilots only. */
const FALLBACK_VENUES_DEMO: { name: string; slug: string }[] = [
  { name: "The Function SF", slug: "the-function-sf" },
  { name: "The Starry Plough", slug: "the-starry-plough" },
  { name: "La Rueda", slug: "la-rueda" },
  { name: "Strike Zone", slug: "strike-zone" },
  { name: "Pacific Greens", slug: "pacific-greens" },
];

const FALLBACK_VENUES_PROD: { name: string; slug: string }[] = [
  { name: "The Function SF", slug: "the-function-sf" },
  { name: "The Starry Plough", slug: "the-starry-plough" },
];

export function getFallbackVenues(): { name: string; slug: string }[] {
  return isDemoMode() ? FALLBACK_VENUES_DEMO : FALLBACK_VENUES_PROD;
}

/** @deprecated Use getFallbackVenues() so production excludes mock venues. */
export const FALLBACK_VENUES: { name: string; slug: string }[] = FALLBACK_VENUES_DEMO;

/** Valid venue slug pattern (safe for cookie and URLs). */
export const VENUE_SLUG_REGEX = /^[a-z0-9-]+$/;
export const VENUE_SLUG_MAX_LENGTH = 120;

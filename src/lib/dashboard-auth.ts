/**
 * Dashboard role and venue access:
 * - Admins: PERMANENT_ADMINS (by email) or INTERNAL_DEMO_USER_IDS (by user id); see all venues.
 * - Venue owners/staff (not admin): see only venues where they are in venue_staff.
 * - Regular members: see only venues where they have a membership.
 */

import { PERMANENT_ADMINS } from "./constants";

export type VenueOption = { id: string; slug: string; name: string };

const PERMANENT_ADMIN_EMAILS_LOWER = new Set(
  PERMANENT_ADMINS.map((a) => a.email.trim().toLowerCase()).filter(Boolean)
);

/** Role identified at login: admin (co-founder), venue_owner (staff at a venue), or member. */
export type UserRole = "admin" | "venue_owner" | "member";

/**
 * Returns the user's role for display and cookie. Call after login or when you have user + staff info.
 * - admin: PERMANENT_ADMINS (email) or INTERNAL_DEMO_USER_IDS (id)
 * - venue_owner: has at least one venue_staff row and not admin
 * - member: everyone else
 */
export function getRoleForUser(
  user: { id: string; email?: string | null },
  hasStaffRows: boolean
): UserRole {
  if (isDashboardAdmin(user)) return "admin";
  if (hasStaffRows) return "venue_owner";
  return "member";
}

/**
 * Returns whether the user is an admin with access to all venues.
 * Admin = linked to sign-in via: PERMANENT_ADMINS (email) or INTERNAL_DEMO_USER_IDS / ADMIN_USER_IDS (user id, comma-separated).
 */
export function isDashboardAdmin(user: { id: string; email?: string | null }): boolean {
  const email = user.email?.trim().toLowerCase();
  if (email && PERMANENT_ADMIN_EMAILS_LOWER.has(email)) return true;
  const idsEnv = process.env.ADMIN_USER_IDS ?? process.env.INTERNAL_DEMO_USER_IDS ?? "";
  const ids = idsEnv.split(",").map((s) => s.trim()).filter(Boolean);
  return ids.includes(user.id);
}

/**
 * Filter venues to only those the user is allowed to access.
 * - Admin: allowedVenues = all (memberships + staff).
 * - Non-admin with staff: allowedVenues = only staff venues.
 * - Non-admin without staff: allowedVenues = only membership venues.
 */
export function allowedVenuesForUser(params: {
  isAdmin: boolean;
  fromMemberships: VenueOption[];
  fromStaff: VenueOption[];
}): VenueOption[] {
  const { isAdmin, fromMemberships, fromStaff } = params;
  if (isAdmin) {
    const byId = new Map<string, VenueOption>();
    fromMemberships.forEach((v) => byId.set(v.id, v));
    fromStaff.forEach((v) => byId.set(v.id, v));
    return Array.from(byId.values());
  }
  if (fromStaff.length > 0) {
    return fromStaff;
  }
  return fromMemberships;
}

/**
 * Returns true if the user is venue staff (owner/manager/staff) for at least one venue.
 * Used to show the "Members at this venue" list on the dashboard.
 */
export function isVenueStaffForVenue(params: {
  staffVenueIds: string[];
  venueId: string | null;
}): boolean {
  if (!params.venueId) return false;
  return params.staffVenueIds.includes(params.venueId);
}

/**
 * Returns the set of venue slugs the user is allowed to set (for set-venue API).
 * Uses same logic as dashboard layout: admin = all they have; non-admin staff = only staff venues; else only membership venues.
 * Includes all allowed venues (not just pilot) so the API accepts any venue the user can see in the switcher.
 */
export function allowedVenueSlugs(params: {
  isAdmin: boolean;
  fromMemberships: VenueOption[];
  fromStaff: VenueOption[];
}): Set<string> {
  const allowed = allowedVenuesForUser(params);
  return new Set(allowed.map((v) => v.slug));
}


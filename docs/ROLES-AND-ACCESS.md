# Roles and access

## Summary

- **Admin**: Special access; identities linked to sign-in. No separate "demo mode" required for admin actions.
- **Owners**: Venue owners (in `venue_staff`). Sign-in → they are owners or become owners when they open/claim a venue.
- **Staff/servers**: After the owner has signed in and opened the venue, staff can use the app (same sign-in; `venue_staff` table).

## Admin (linked to sign-in)

- **By email**: `PERMANENT_ADMINS` in `src/lib/constants.ts`. Replace with real co-founder emails.
- **By user id**: Env `ADMIN_USER_IDS` or `INTERNAL_DEMO_USER_IDS` (comma-separated Supabase user IDs).
- Role is set at sign-in in `app/auth/callback/route.ts` and stored in `USER_ROLE_COOKIE`.
- Admin can: see all venues, grant themselves membership at any venue (Join page), access Admin page. Grant-membership does **not** require `IS_DEMO_MODE`.

## Owners and staff

- **Venue owner**: User has at least one row in `venue_staff` for a venue. They see that venue (or those venues) in the launcher and dashboard.
- **Staff/servers**: Same: in `venue_staff`. After the owner has "opened" the venue (signed in, set up the venue), staff can sign in and use the space (verification, dashboard, etc.).

## No separate demo concept

- Placeholder venues (e.g. La Rueda, Strike Zone) are shown in the launcher and join flow; mock-ups/placeholders are used where data is missing. As real data comes in, it replaces placeholders.
- `IS_DEMO_MODE` is only used for: demo reset RPC, and redirect from `/demo` to `/internal/demo`. Admin grant-membership and venue list do **not** depend on it.

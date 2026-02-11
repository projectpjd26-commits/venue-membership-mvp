import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Session, User } from "@supabase/supabase-js";
import { isDashboardAdmin } from "@/lib/dashboard-auth";
import { createServerSupabase } from "@/lib/supabase-server";
import { isDemoMode } from "@/lib/constants";

export interface AuthResult {
  data?: { user: User; session: Session };
  error?: NextResponse;
}

/**
 * Require authentication for an API route.
 * Returns user and session if authenticated, or 401 error response if not.
 * Use in route handlers: if (authResult.error) return authResult.error;
 */
export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore, true);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { data: { user: session.user, session } };
}

/**
 * Require authentication and admin (PERMANENT_ADMINS by email or INTERNAL_DEMO_USER_IDS by id).
 * When IS_DEMO_MODE is not true, returns 404 so demo-only routes are disabled in production.
 * Returns 401 if not signed in, 403 if not admin, 404 if demo mode is off.
 */
export async function requireDemoAdmin(): Promise<AuthResult> {
  if (!isDemoMode()) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  const result = await requireAuth();
  if (result.error) return result;

  if (!isDashboardAdmin(result.data!.user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return result;
}

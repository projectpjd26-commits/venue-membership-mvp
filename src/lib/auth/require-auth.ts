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
 * Require authentication and admin. Admin = PERMANENT_ADMINS (email) or INTERNAL_DEMO_USER_IDS (user id), linked at sign-in.
 * Use for admin-only actions (e.g. grant self membership, manage access). No demo-mode gate.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;

  if (!isDashboardAdmin(result.data!.user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return result;
}

/**
 * Require authentication and admin, and that IS_DEMO_MODE is true. Use only for demo-specific actions (e.g. demo reset).
 * Returns 404 when demo mode is off so those routes are disabled in production.
 */
export async function requireDemoAdmin(): Promise<AuthResult> {
  if (!isDemoMode()) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return requireAdmin();
}

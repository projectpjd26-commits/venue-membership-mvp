/**
 * Deterministic membership state for UI. Do not drive labels or badges from raw DB fields.
 *
 * States:
 * - ACTIVE: in good standing, can verify
 * - GRACE: past expiry but within grace window (e.g. retry period)
 * - EXPIRED: past expiry (and no grace) or status = expired
 * - REVOKED: explicitly revoked
 * - PENDING: not yet provisioned (e.g. checkout not completed)
 */

export type MembershipDisplayState =
  | "ACTIVE"
  | "GRACE"
  | "EXPIRED"
  | "REVOKED"
  | "PENDING";

export type MembershipDisplayResult = {
  state: MembershipDisplayState;
  label: string;
  badgeColor: "green" | "orange" | "red" | "gray" | "yellow";
  canVerify: boolean;
  showRenewal: boolean;
};

/** Minimal membership shape from DB (status, tier, expires_at). */
export type MembershipForDisplay = {
  status: string;
  tier?: string | null;
  expires_at?: string | null;
  stripe_subscription_id?: string | null;
};

/** Grace period in days: still show as GRACE (can renew) after expiry. */
const GRACE_DAYS = 7;

/**
 * Returns the single UI-facing state for a membership. Use this for all labels, badges, and gating.
 */
export function getMembershipDisplayState(
  membership: MembershipForDisplay
): MembershipDisplayResult {
  const status = (membership.status ?? "").toLowerCase();
  const expiresAt = membership.expires_at
    ? new Date(membership.expires_at).getTime()
    : null;
  const now = Date.now();

  // REVOKED: explicit revoke
  if (status === "revoked") {
    return {
      state: "REVOKED",
      label: "Revoked",
      badgeColor: "red",
      canVerify: false,
      showRenewal: false,
    };
  }

  // EXPIRED: DB status or past end date (and outside grace)
  if (status === "expired") {
    return {
      state: "EXPIRED",
      label: "Expired",
      badgeColor: "red",
      canVerify: false,
      showRenewal: true,
    };
  }

  if (expiresAt !== null && expiresAt <= now) {
    const graceEnd = expiresAt + GRACE_DAYS * 24 * 60 * 60 * 1000;
    if (now <= graceEnd) {
      return {
        state: "GRACE",
        label: "Grace period",
        badgeColor: "orange",
        canVerify: true, // allow entry during grace
        showRenewal: true,
      };
    }
    return {
      state: "EXPIRED",
      label: "Expired",
      badgeColor: "red",
      canVerify: false,
      showRenewal: true,
    };
  }

  // PENDING: created but not yet confirmed (e.g. no Stripe confirmation yet)
  if (status === "pending" || status === "provisioning") {
    return {
      state: "PENDING",
      label: "Pending",
      badgeColor: "yellow",
      canVerify: false,
      showRenewal: false,
    };
  }

  // ACTIVE: default for status active with valid or null expiry
  if (status === "active") {
    return {
      state: "ACTIVE",
      label: "Active",
      badgeColor: "green",
      canVerify: true,
      showRenewal: !!expiresAt,
    };
  }

  // Unknown status: treat as pending/gray
  return {
    state: "PENDING",
    label: "Unknown",
    badgeColor: "gray",
    canVerify: false,
    showRenewal: false,
  };
}

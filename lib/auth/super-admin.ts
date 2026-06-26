/**
 * Single source of truth for which email addresses may hold the platform
 * super-admin role. Super admins bypass agency scoping and can read every
 * lead, listing, and profile, so this must stay tightly controlled.
 *
 * Enforced in three layers that all reference this list:
 *  1. Database trigger (migration 021) blocks writing super_admin to any other
 *     email and demotes existing offenders.
 *  2. handle_new_user() only auto-grants super_admin to these emails.
 *  3. loadPortalUserAccess() clamps the role at read time, so even a rogue DB
 *     row cannot grant super_admin to a non-allowlisted account.
 *
 * To add a Proppd staff admin, add their email here AND in migration 021's
 * allowlist (keep the two in sync).
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = ['info@proppd.com'];

export function isAllowedSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Platform admin configuration.
 * Only this email has admin access.
 */
export const ADMIN_EMAIL = "riskiakbarp123@gmail.com";

/**
 * Check if a user email is the platform admin.
 */
export function isAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase().trim() === ADMIN_EMAIL;
}
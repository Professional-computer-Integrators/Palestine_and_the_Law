export const ADMIN_AUTH_COOKIE = "patl_admin_auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_AUTH_TOKEN = process.env.ADMIN_AUTH_TOKEN;

export function isAdminAuthConfigured(): boolean {
  return Boolean(ADMIN_PASSWORD && ADMIN_AUTH_TOKEN);
}

export function isValidAdminPassword(input: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  return input === ADMIN_PASSWORD;
}

export function getAdminAuthCookieValue(): string {
  return ADMIN_AUTH_TOKEN ?? "";
}

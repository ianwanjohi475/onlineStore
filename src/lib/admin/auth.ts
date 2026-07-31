export const ADMIN_COOKIE = "oraimo_admin";
// Demo session token. For a real deployment, sign this and set ADMIN_PASSWORD.
export const ADMIN_TOKEN = "oraimo-admin-session";

export function checkPassword(pw: string) {
  return pw === (process.env.ADMIN_PASSWORD || "admin123");
}

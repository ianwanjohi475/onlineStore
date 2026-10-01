import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * "Continue with Google" — verifies the ID token Google Identity Services gives
 * the browser. The signature is checked against Google's published keys, and
 * the token must be for OUR client ID, issued by Google, unexpired, with a
 * verified email. Nothing from the browser is trusted without this check.
 */
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile | null> {
  if (!GOOGLE_CLIENT_ID || !credential || credential.length > 4096) return null;
  try {
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: GOOGLE_CLIENT_ID,
      algorithms: ["RS256"],
    });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!email || payload.email_verified !== true || typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      email,
      name: (typeof payload.name === "string" && payload.name.trim()) || email.split("@")[0],
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
}

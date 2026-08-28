import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "jh_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 kun

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET aniqlanmagan yoki juda qisqa (kamida 32 belgi). `npm run gen:secret` buyrug'i bilan yarating.",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { sub: string };

export async function signSession(username: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? { sub: payload.sub } : null;
  } catch {
    return null;
  }
}

"use client";

const ACCESS_KEY = "fe_access";
const REFRESH_KEY = "fe_refresh";
const NAME_KEY = "fe_name";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string, name?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  if (name) localStorage.setItem(NAME_KEY, name);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getStoredName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload["exp"] as number;
    if (!exp) return false;
    // Treat as expired slightly early so we refresh before the API rejects it
    return Date.now() / 1000 > exp - skewSeconds;
  } catch {
    return true;
  }
}

/** True if the user has a usable session (valid access token, or a refresh token to renew it). */
export function isAuthenticated(): boolean {
  const token = getToken();
  const refresh = getRefreshToken();

  if (token && !isTokenExpired(token)) return true;

  // Access expired/missing — keep session if we can still refresh
  if (refresh) return true;

  if (token) clearTokens();
  return false;

  // return true;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export function getHouseholdId(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return (payload["household_id"] as string) ?? null;
}

export function getFullName(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return (payload["name"] as string) || null;
}

export function getFirstName(): string | null {
  const name = getFullName();
  if (!name) return null;
  return name.split(" ")[0] || null;
}

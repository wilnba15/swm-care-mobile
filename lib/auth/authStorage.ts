export interface SwmUser {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  status: string;
  created_at: string;
}

export interface SwmSession { accessToken: string; tokenType: string; user: SwmUser; }

const TOKEN_KEY = "swm_access_token";
const USER_KEY = "swm_current_user";
const TOKEN_TYPE_KEY = "swm_token_type";
export const AUTH_UPDATED_EVENT = "swm:auth-updated";

function isBrowser(): boolean { return typeof window !== "undefined"; }

export function saveSession(session: SwmSession): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType || "bearer");
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT, { detail: session }));
}

export function getAccessToken(): string {
  if (!isBrowser()) return "";
  try { return localStorage.getItem(TOKEN_KEY) ?? ""; } catch { return ""; }
}

export function getCurrentUser(): SwmUser | null {
  if (!isBrowser()) return null;
  try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as SwmUser : null; } catch { return null; }
}

export function hasSession(): boolean { return Boolean(getAccessToken()); }

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT, { detail: null }));
}

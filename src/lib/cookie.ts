export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isBrowser = () => typeof document !== 'undefined';

const buildCookieString = (
  name: string,
  value: string,
  {
    days = 7,
    path = '/',
    domain,
    secure = isBrowser() && window.location.protocol === 'https:',
    sameSite = secure ? 'None' : 'Lax',
  }: CookieOptions = {},
) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 86_400_000);

  let str = `${name}=${encodeURIComponent(
    value,
  )};expires=${expires.toUTCString()};path=${path}`;

  if (domain) str += `;domain=${domain}`;
  if (secure) str += ';Secure';
  str += `;SameSite=${sameSite}`;
  return str;
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const setCookie = (
  name: string,
  value: string,
  options?: CookieOptions,
) => {
  if (!isBrowser()) return;
  document.cookie = buildCookieString(name, value, options);
};

export const deleteCookie = (name: string, path = '/', domain?: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}${
    domain ? `;domain=${domain}` : ''
  }`;
};

export const getCookie = (name: string): string | null => {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const hasCookie = (name: string) => getCookie(name) !== null;

export const getAllCookies = () =>
  document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
    const [key, value] = c.trim().split('=');
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const setAccessToken = (token: string) =>
  setCookie(COOKIE_NAMES.ACCESS_TOKEN, token, { days: 1 / 24 }); // 1 hour

export const setRefreshToken = (token: string) =>
  setCookie(COOKIE_NAMES.REFRESH_TOKEN, token, { days: 30 });

export const getAccessToken = () => getCookie(COOKIE_NAMES.ACCESS_TOKEN);

export const getRefreshToken = () => getCookie(COOKIE_NAMES.REFRESH_TOKEN);

export const setAuthData = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

export const clearAuthData = () => {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
};

export const isAuthenticated = () =>
  hasCookie(COOKIE_NAMES.ACCESS_TOKEN) || hasCookie(COOKIE_NAMES.REFRESH_TOKEN);

import { Guest } from '../types';

const CACHE_KEY = 'wedding_guests_cache';
const CACHE_TIMESTAMP_KEY = 'wedding_guests_cache_timestamp';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function saveGuestListToCache(guests: Guest[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch (error) {
    console.warn('Failed to save guests to cache:', error);
  }
}

export function getGuestListFromCache(): Guest[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) return null;

    const cacheAge = Date.now() - Number(timestamp);
    if (cacheAge > CACHE_EXPIRY_MS) {
      clearGuestCache();
      return null;
    }

    return JSON.parse(cached) as Guest[];
  } catch (error) {
    console.warn('Failed to read guests from cache:', error);
    return null;
  }
}

export function clearGuestCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

export function isCacheExpired(): boolean {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return true;
    const cacheAge = Date.now() - Number(timestamp);
    return cacheAge > CACHE_EXPIRY_MS;
  } catch {
    return true;
  }
}

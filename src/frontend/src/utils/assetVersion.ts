import { BUILD_ID } from '../config/branding';

/**
 * Appends a cache-busting version query string to asset URLs
 * @param url - The asset URL to append the version to
 * @returns The URL with ?v=<buildId> appended
 */
export function withAssetVersion(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${BUILD_ID}`;
}

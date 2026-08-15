/**
 * Domain & Subdomain Routing Utilities for GM Digital Studio
 * 
 * - Main Marketing Site: https://gmdigitalstudio.app
 * - Client & Admin Portal: https://portal.gmdigitalstudio.app
 */

export const MAIN_DOMAIN = 'gmdigitalstudio.app';
export const PORTAL_DOMAIN = 'portal.gmdigitalstudio.app';

export const MAIN_URL = 'https://gmdigitalstudio.app';
export const PORTAL_URL = 'https://portal.gmdigitalstudio.app';

/**
 * Checks if the current browser window is running on the portal subdomain
 * (e.g. portal.gmdigitalstudio.app, or portal.localhost for local dev)
 */
export const isPortalHostname = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname.startsWith('portal.') || hostname === PORTAL_DOMAIN;
};

/**
 * Checks if running in a local development environment
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * Gets a fully qualified or relative URL to the Client Portal
 * In production: points to https://portal.gmdigitalstudio.app
 * In localhost: uses relative path so local dev doesn't break
 */
export const getPortalUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isLocalhost()) {
    return cleanPath;
  }
  return `${PORTAL_URL}${cleanPath}`;
};

/**
 * Gets a fully qualified or relative URL to the Main Marketing Website
 * In production: points to https://gmdigitalstudio.app
 * In localhost: uses relative path
 */
export const getMainUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isLocalhost()) {
    return cleanPath;
  }
  return `${MAIN_URL}${cleanPath}`;
};

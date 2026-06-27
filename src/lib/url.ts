/**
 * URL Utilities for InnovaSci Open Academy
 * Provides dynamic base URL resolution for multi-domain support
 */

/**
 * Get the base URL for the application
 * Priority: NEXT_PUBLIC_BASE_URL env var > request origin (for SSR) > fallback
 */
export function getBaseUrl(): string {
  // Client-side: use public env variable
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 
           process.env.NEXT_PUBLIC_APP_URL || 
           window.location.origin
  }
  
  // Server-side: check env first, then request origin
  return process.env.NEXT_PUBLIC_BASE_URL || 
         process.env.NEXT_PUBLIC_APP_URL || 
         'https://innovasci.com'
}

/**
 * Get the verification URL for a certificate
 */
export function getVerificationUrl(certificateCode: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/verify/${certificateCode}`
}

/**
 * Get the callback URL for payments
 */
export function getCallbackUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = getBaseUrl()
  const url = new URL(path, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return url.toString()
}

/**
 * Normalize a URL to prevent redirect loops
 * Strips trailing slashes and normalizes protocol
 */
export function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/^\/+/, '/')
}

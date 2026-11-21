import type { IncomingMessage, ServerResponse } from 'node:http'

export class BodyTooLarge extends Error {}

export async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  const declared = Number(req.headers['content-length'] ?? '0')
  if (declared > limit) throw new BodyTooLarge('Body too large.')
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
    total += buffer.length
    if (total > limit) throw new BodyTooLarge('Body too large.')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

/** Parses `application/x-www-form-urlencoded`. Repeated keys become arrays. */
export function parseForm(body: Buffer): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  for (const [key, value] of new URLSearchParams(body.toString('utf8'))) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    const existing = out[key]
    if (existing === undefined) out[key] = value
    else out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
  }
  return out
}

export function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index <= 0) continue
    const name = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (name && !(name in out)) {
      try {
        out[name] = decodeURIComponent(value)
      } catch {
        // ignore malformed cookie values
      }
    }
  }
  return out
}

export interface CookieOptions {
  maxAgeSeconds?: number
  secure: boolean
  httpOnly?: boolean
}

export function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Strict']
  if (options.httpOnly !== false) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.maxAgeSeconds !== undefined) parts.push(`Max-Age=${options.maxAgeSeconds}`)
  return parts.join('; ')
}

export const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join('; ')

export function securityHeaders(res: ServerResponse, secure: boolean): void {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  // same-origin, not no-referrer: with no-referrer browsers send `Origin: null` on same-origin form
  // posts, which the Origin check must refuse. No referrer ever reaches another origin either way.
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  if (secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
}

export function sendHtml(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function redirect(res: ServerResponse, location: string, status = 303): void {
  res.statusCode = status
  res.setHeader('Location', location)
  res.setHeader('Cache-Control', 'no-store')
  res.end()
}

/** A post-login or post-action target must be a same-site path, never `//host` or a URL. */
export function safeLocalPath(value: string | undefined, fallback: string): string {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\') || value.length > 300) return fallback
  if (/[\r\n\0]/.test(value)) return fallback
  return value
}

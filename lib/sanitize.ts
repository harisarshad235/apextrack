/**
 * Input sanitization and XSS mitigation utilities for Kynov.
 * Protects against stored XSS, reflected XSS, and payload injection.
 */

const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(?:script|iframe|object|embed|form|input|button|textarea|select|link|style|meta|base|applet|frameset|frame|svg|math)[^>]*>/gi;
const DANGEROUS_ATTRIBUTES_REGEX = /\s*(?:on\w+|formaction|xlink:href|action)\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi;
const DANGEROUS_PROTOCOLS_REGEX = /(?:javascript|vbscript|data(?:\/text)?):/gi;

/**
 * Escapes HTML characters for strict plain-text fields
 * (titles, names, project keys, emails, departments, labels).
 */
export function sanitizePlainText(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes rich Markdown content (issue descriptions, document content, comments).
 * Permits standard markdown syntax while stripping malicious scripts, iframes,
 * object embeds, and inline JS event handlers.
 */
export function sanitizeMarkdown(input: unknown): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(DANGEROUS_ATTRIBUTES_REGEX, '')
    .replace(DANGEROUS_PROTOCOLS_REGEX, '')
    .trim();
}

/**
 * Validates and sanitizes hyperlinks to ensure only safe http/https or relative paths are permitted.
 * Disallows javascript:, data:, and other active URI schemes.
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Allow relative URLs
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow safe http and https protocols
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {}

  return '';
}

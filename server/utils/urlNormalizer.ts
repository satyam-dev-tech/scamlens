import { URL } from 'url';

export interface NormalizedUrlResult {
  isValid: boolean;
  normalizedUrl: string | null;
  error?: string;
}

export function normalizeAndValidateUrl(inputUrl: string): NormalizedUrlResult {
  try {
    let urlToParse = inputUrl.trim();
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = 'https://' + urlToParse;
    }

    const parsedUrl = new URL(urlToParse);

    // Require HTTP or HTTPS
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { isValid: false, normalizedUrl: null, error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' };
    }

    // SSRF Protections - Hostname validation
    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost and loopback
    if (
      hostname === 'localhost' ||
      hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) ||
      hostname === '[::1]'
    ) {
      return { isValid: false, normalizedUrl: null, error: 'Localhost and loopback addresses are blocked.' };
    }

    // Block common private IP ranges (basic check, can be expanded)
    // 10.0.0.0/8
    if (hostname.startsWith('10.')) {
      return { isValid: false, normalizedUrl: null, error: 'Private IP addresses are blocked.' };
    }
    // 172.16.0.0/12 (approximate)
    if (hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return { isValid: false, normalizedUrl: null, error: 'Private IP addresses are blocked.' };
    }
    // 192.168.0.0/16
    if (hostname.startsWith('192.168.')) {
      return { isValid: false, normalizedUrl: null, error: 'Private IP addresses are blocked.' };
    }
    // 169.254.0.0/16 (link-local)
    if (hostname.startsWith('169.254.')) {
      return { isValid: false, normalizedUrl: null, error: 'Link-local addresses are blocked.' };
    }
    
    // Additional SSRF protections would involve DNS resolution checks before actual fetching,
    // but for just the URL string check, this is a start.

    // Normalize URL
    // Remove fragments
    parsedUrl.hash = '';

    // The URL API naturally handles punycode (via host/hostname property)
    // and standardizes slashes and case for hostname.
    
    let normalizedUrl = parsedUrl.toString();

    // Handle trailing slashes consistently (remove if only path is '/')
    if (normalizedUrl.endsWith('/') && parsedUrl.pathname === '/' && !parsedUrl.search) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    return { isValid: true, normalizedUrl };
  } catch (err) {
    return { isValid: false, normalizedUrl: null, error: 'Malformed URL.' };
  }
}

import { URL } from 'url';

export interface HeuristicSignal {
  id: string;
  description: string;
}

export interface HeuristicResult {
  provider: 'Local Heuristics';
  checked: boolean;
  signals: HeuristicSignal[];
}

export function analyzeLocalHeuristics(urlString: string): HeuristicResult {
  const signals: HeuristicSignal[] = [];

  try {
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname;

    // 1. IP address used instead of a normal hostname
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(hostname)) {
      signals.push({ id: 'ip_hostname', description: 'URL uses an IP address instead of a domain name.' });
    }

    // 2. Unusually long hostname
    if (hostname.length > 75) {
      signals.push({ id: 'long_hostname', description: 'Hostname is unusually long.' });
    }

    // 3. Excessive subdomains (e.g. a.b.c.d.example.com has 5 dots -> 4 subdomains)
    const dotCount = (hostname.match(/\./g) || []).length;
    if (dotCount >= 4 && !ipRegex.test(hostname)) {
      signals.push({ id: 'excessive_subdomains', description: 'URL has an unusually high number of subdomains.' });
    }

    // 4. Punycode / IDN hostname
    if (hostname.includes('xn--')) {
      signals.push({ id: 'punycode_hostname', description: 'URL uses Punycode (IDN), which can be used for homograph attacks.' });
    }

    // 5. Unusual port
    if (parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443') {
      signals.push({ id: 'unusual_port', description: `URL uses a non-standard port (${parsedUrl.port}).` });
    }

    // 6. Unusually long URL
    if (urlString.length > 200) {
      signals.push({ id: 'long_url', description: 'The overall URL is unusually long.' });
    }

    // 7. Excessive query parameters
    const searchParamsCount = Array.from(parsedUrl.searchParams.keys()).length;
    if (searchParamsCount > 6) {
      signals.push({ id: 'excessive_query_params', description: 'URL contains an unusually high number of query parameters.' });
    }

    // 8. Credential-like URL structure
    if (parsedUrl.username || parsedUrl.password) {
      signals.push({ id: 'credentials_in_url', description: 'URL contains embedded credentials.' });
    }
    
    // 9. URL shortener usage
    const shorteners = ['bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly'];
    if (shorteners.includes(hostname)) {
      signals.push({ id: 'url_shortener', description: 'URL uses a known URL shortener service.' });
    }

    return {
      provider: 'Local Heuristics',
      checked: true,
      signals
    };

  } catch (error) {
    // If it can't be parsed, return unchecked/error
    return {
      provider: 'Local Heuristics',
      checked: false,
      signals: []
    };
  }
}

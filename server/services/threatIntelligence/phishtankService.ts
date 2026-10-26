export interface ProviderResult {
  provider: string;
  checked: boolean;
  isThreat: boolean;
  threatTypes: string[];
  error?: string;
}

export async function checkPhishTank(url: string): Promise<ProviderResult> {
  try {
    const encodedUrl = encodeURIComponent(url);
    const requestUrl = 'https://checkurl.phishtank.com/checkurl/';
    
    // We send a POST request with url-encoded body
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'phishtank/ScamLens'
      },
      body: `url=${encodedUrl}&format=json`
    });

    console.log(`[PhishTank] HTTP status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[PhishTank] Error response: ${errorText.substring(0, 100)}`);
      return {
        provider: 'PhishTank',
        checked: false,
        isThreat: false,
        threatTypes: [],
        error: `HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    // Some endpoints return HTML on error, try parsing JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        provider: 'PhishTank',
        checked: false,
        isThreat: false,
        threatTypes: [],
        error: 'Invalid JSON response from PhishTank',
      };
    }

    if (data && data.results && data.results.in_database && data.results.valid) {
      return {
        provider: 'PhishTank',
        checked: true,
        isThreat: true,
        threatTypes: ['PHISHING'],
      };
    }

    return {
      provider: 'PhishTank',
      checked: true,
      isThreat: false,
      threatTypes: [],
    };
  } catch (error: any) {
    return {
      provider: 'PhishTank',
      checked: false,
      isThreat: false,
      threatTypes: [],
      error: error.message || 'Network error',
    };
  }
}

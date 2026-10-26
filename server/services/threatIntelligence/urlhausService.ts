import { ProviderResult } from './phishtankService.js';

export async function checkUrlhaus(url: string): Promise<ProviderResult> {
  try {
    const requestUrl = 'https://urlhaus-api.abuse.ch/v1/url/';
    
    // Application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('url', url);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    console.log(`[URLhaus] HTTP status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[URLhaus] Error response: ${errorText.substring(0, 100)}`);
      return {
        provider: 'URLhaus',
        checked: false,
        isThreat: false,
        threatTypes: [],
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    // Check if the API returned an unauthorized error
    if (data && data.error) {
      console.log(`[URLhaus] API returned error JSON: ${data.error}`);
      return {
        provider: 'URLhaus',
        checked: false,
        isThreat: false,
        threatTypes: [],
        error: `API error: ${data.error}`,
      };
    }

    // URLhaus returns query_status "ok" if found, "no_results" if not found
    if (data && data.query_status === 'ok') {
      return {
        provider: 'URLhaus',
        checked: true,
        isThreat: true,
        threatTypes: ['MALWARE_URL'],
      };
    }

    return {
      provider: 'URLhaus',
      checked: true,
      isThreat: false,
      threatTypes: [],
    };
  } catch (error: any) {
    return {
      provider: 'URLhaus',
      checked: false,
      isThreat: false,
      threatTypes: [],
      error: error.message || 'Network error',
    };
  }
}

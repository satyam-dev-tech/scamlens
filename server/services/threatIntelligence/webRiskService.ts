import dotenv from 'dotenv';

dotenv.config();

export interface WebRiskResult {
  provider: 'google-web-risk';
  checked: boolean;
  isThreat: boolean;
  threatTypes: string[];
  error?: string;
}

export async function checkWebRisk(url: string): Promise<WebRiskResult> {
  const apiKey = process.env.GOOGLE_WEB_RISK_API_KEY;
  if (!apiKey) {
    return {
      provider: 'google-web-risk',
      checked: false,
      isThreat: false,
      threatTypes: [],
      error: 'API key not configured',
    };
  }

  try {
    const threatTypes = ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'];
    const threatTypesQuery = threatTypes.map(t => `threatTypes=${t}`).join('&');
    const encodedUrl = encodeURIComponent(url);
    
    const requestUrl = `https://webrisk.googleapis.com/v1/uris:search?${threatTypesQuery}&uri=${encodedUrl}&key=${apiKey}`;
    
    // Parse hostname for logging
    const parsedUrl = new URL(url);
    console.log(`[WebRisk] Checking ${parsedUrl.hostname}`);

    const response = await fetch(requestUrl);
    console.log(`[WebRisk] HTTP ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = response.statusText;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {}
      
      console.log(`[WebRisk] Error: ${errorMsg}`);
      return {
        provider: 'google-web-risk',
        checked: false,
        isThreat: false,
        threatTypes: [],
        error: `API error: ${response.status} ${errorMsg}`,
      };
    }

    const data = await response.json();
    
    if (data && data.threat) {
      console.log(`[WebRisk] Threat match: ${data.threat.threatTypes.join(', ')}`);
      return {
        provider: 'google-web-risk',
        checked: true,
        isThreat: true,
        threatTypes: data.threat.threatTypes || [],
      };
    }

    console.log(`[WebRisk] No threat match`);
    return {
      provider: 'google-web-risk',
      checked: true,
      isThreat: false,
      threatTypes: [],
    };
  } catch (error: any) {
    return {
      provider: 'google-web-risk',
      checked: false,
      isThreat: false,
      threatTypes: [],
      error: error.message || 'Network error',
    };
  }
}

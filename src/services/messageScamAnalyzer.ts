/**
 * ScamLens Message Scam Detection Engine
 *
 * Deterministic, evidence-based, contextual analysis for SMS, chat messages,
 * emails, and text payloads.
 *
 * Design Principles:
 * 1. Prioritize genuine attack vectors: credential harvesting, OTP extraction,
 *    institutional impersonation, lookalike domains, coercive threats, fraudulent payments.
 * 2. Eliminate false positives: recognize legitimate delivery notices, authentic OTP
 *    dispatches with warnings, routine security alerts, and normal conversational language.
 * 3. Never classify messages solely by single keywords (e.g. "friend", "delivery", "invoice").
 * 4. Deterministic and explainable: every detected signal contains exact extracted evidence.
 * 5. Honest safety posture: when no threat patterns match, explain what was checked and
 *    advise normal caution without claiming absolute sender legitimacy.
 */

import {
  DetectedSignal,
  FindingSeverity,
  RiskLabel,
  RiskLevel,
  getRiskLabel,
  getRiskLevel,
} from '../types/scam';

export interface MessageAnalysisOptions {
  type?: 'message' | 'email' | 'text';
  subject?: string;
  sender?: string;
}

export interface ExtractedUrlInfo {
  rawUrl: string;
  hostname: string;
  domain: string;
  tld: string;
  path: string;
  isIp: boolean;
  isShortener: boolean;
  isSuspiciousTld: boolean;
  isLookalike: boolean;
  isTrustedOfficial: boolean;
  lookalikeBrand?: string;
  hasSuspiciousPath: boolean;
}

export interface MessageAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  statusLabel: RiskLabel;
  summary: string;
  categories: string[];
  findings: DetectedSignal[];
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  sources: { name: string; status: string; result?: string }[];
  sourceDetails?: {
    urgencyMarkers?: number;
    urlAnalysis?: {
      extractedUrls?: string[];
      suspiciousDomains?: string[];
      shortenersDetected?: boolean;
    };
  };
}

// ─── Known Constants & Registries ──────────────────────────────────────────

const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'ow.ly',
  'buff.ly',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'soo.gd',
  's.id',
  'bl.ink',
  'v.gd',
  'qr.ae',
]);

const SUSPICIOUS_TLDS = new Set([
  'top',
  'xyz',
  'cc',
  'buzz',
  'club',
  'work',
  'click',
  'rest',
  'icu',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'link',
  'fit',
  'date',
  'kim',
  'stream',
  'bid',
  'loan',
  'info',
  'online',
  'live',
  'shop',
  'vip',
  'monster',
  'quest',
]);

const TRUSTED_DOMAINS = new Set([
  'google.com',
  'apple.com',
  'microsoft.com',
  'amazon.com',
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'citi.com',
  'citigroup.com',
  'capitalone.com',
  'usps.com',
  'ups.com',
  'fedex.com',
  'dhl.com',
  'paypal.com',
  'stripe.com',
  'github.com',
  'netflix.com',
  'meta.com',
  'instagram.com',
  'whatsapp.com',
]);

const TARGETED_BRANDS = [
  { name: 'Chase', pattern: /\bchase\b/i, officialDomain: 'chase.com' },
  { name: 'Bank of America', pattern: /\b(?:bank\s+of\s+america|bofa)\b/i, officialDomain: 'bankofamerica.com' },
  { name: 'Wells Fargo', pattern: /\bwells\s+fargo\b/i, officialDomain: 'wellsfargo.com' },
  { name: 'Citibank', pattern: /\b(?:citibank|citi)\b/i, officialDomain: 'citi.com' },
  { name: 'PayPal', pattern: /\bpaypal\b/i, officialDomain: 'paypal.com' },
  { name: 'Apple', pattern: /\bapple(?:\s+support|\s+id)?\b/i, officialDomain: 'apple.com' },
  { name: 'Microsoft', pattern: /\b(?:microsoft|office\s*365|office365)\b/i, officialDomain: 'microsoft.com' },
  { name: 'Amazon', pattern: /\bamazon(?:\s+security|\s+orders?)?\b/i, officialDomain: 'amazon.com' },
  { name: 'Netflix', pattern: /\bnetflix\b/i, officialDomain: 'netflix.com' },
  { name: 'USPS', pattern: /\b(?:usps|united\s+states\s+postal\s+service)\b/i, officialDomain: 'usps.com' },
  { name: 'FedEx', pattern: /\bfedex\b/i, officialDomain: 'fedex.com' },
  { name: 'UPS', pattern: /\bups\b/i, officialDomain: 'ups.com' },
  { name: 'DHL', pattern: /\bdhl\b/i, officialDomain: 'dhl.com' },
  { name: 'IRS', pattern: /\b(?:irs|internal\s+revenue\s+service)\b/i, officialDomain: 'irs.gov' },
  { name: 'Geek Squad', pattern: /\bgeek\s+squad\b/i, officialDomain: 'bestbuy.com' },
];

// Helper to extract the sentence or clause containing a match for natural evidence
function extractContextSentence(fullText: string, matchedSubstring: string): string {
  if (!matchedSubstring) return '';
  const idx = fullText.indexOf(matchedSubstring);
  if (idx === -1) return matchedSubstring;

  // Find start of sentence/line
  let start = idx;
  while (start > 0 && !/[.!?\n]/.test(fullText[start - 1])) {
    start--;
  }

  // Find end of sentence/line
  let end = idx + matchedSubstring.length;
  while (end < fullText.length && !/[.!?\n]/.test(fullText[end])) {
    end++;
  }

  const snippet = fullText.slice(start, end).trim();
  return snippet.length <= 160 ? snippet : matchedSubstring;
}

// ─── URL Parsing & Analysis Helpers ────────────────────────────────────────

export function extractUrls(text: string): ExtractedUrlInfo[] {
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s<>"'{}|\\^`]*)?/gi;
  const matches = text.match(urlRegex) || [];
  const results: ExtractedUrlInfo[] = [];
  const seenUrls = new Set<string>();

  for (const match of matches) {
    const cleanMatch = match.replace(/[.,:;!?)]+$/, '');
    if (!cleanMatch || cleanMatch.length < 4 || seenUrls.has(cleanMatch.toLowerCase())) {
      continue;
    }

    // Skip numbers like dollar values or version numbers e.g. "1.85" or "2.0"
    if (/^\d+\.\d+$/.test(cleanMatch)) {
      continue;
    }

    seenUrls.add(cleanMatch.toLowerCase());

    const hasProtocol = cleanMatch.startsWith('http://') || cleanMatch.startsWith('https://');
    const urlStringToParse = hasProtocol ? cleanMatch : 'http://' + cleanMatch;

    try {
      const parsed = new URL(urlStringToParse);
      const hostname = parsed.hostname.toLowerCase();
      const path = parsed.pathname + parsed.search;

      const hostParts = hostname.split('.');
      const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';

      const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      const isShortener = URL_SHORTENERS.has(hostname) || (hostParts.length >= 2 && URL_SHORTENERS.has(hostParts.slice(-2).join('.')));
      const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);

      let isTrustedOfficial = false;
      for (const trusted of TRUSTED_DOMAINS) {
        if (hostname === trusted || hostname.endsWith('.' + trusted)) {
          isTrustedOfficial = true;
          break;
        }
      }

      let isLookalike = false;
      let lookalikeBrand: string | undefined;

      if (!isTrustedOfficial && !isIp) {
        for (const brand of TARGETED_BRANDS) {
          const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '');
          if (hostname.includes(brandSlug) || hostname.includes(brand.name.toLowerCase())) {
            isLookalike = true;
            lookalikeBrand = brand.name;
            break;
          }
        }
      }

      const hasSuspiciousPath = /\/(?:unlock|verify|login|signin|auth|claim|secure|reset|account|update-billing|restore|account-recovery)/i.test(path);

      results.push({
        rawUrl: cleanMatch,
        hostname,
        domain: hostParts.slice(-2).join('.'),
        tld,
        path,
        isIp,
        isShortener,
        isSuspiciousTld,
        isLookalike,
        isTrustedOfficial,
        lookalikeBrand,
        hasSuspiciousPath,
      });
    } catch {
      // Ignore unparseable tokens
    }
  }

  return results;
}

// ─── Main Message Scam Detection Engine ─────────────────────────────────────

export function analyzeMessageContent(
  text: string,
  options?: MessageAnalysisOptions
): MessageAnalysisResult {
  const fullText = (text || '').trim();
  const subject = (options?.subject || '').trim();
  const combinedText = subject ? `${subject}\n${fullText}` : fullText;
  const lower = combinedText.toLowerCase();

  const findings: DetectedSignal[] = [];
  const categoriesSet = new Set<string>();
  const recommendations: string[] = [];

  let urgencyMarkers = 0;
  let basePoints = 0;

  // ── 1. URL & Domain Heuristics ──────────────────────────────────────────
  const extractedUrls = extractUrls(combinedText);
  const suspiciousDomains: string[] = [];
  let shortenersDetected = false;

  for (const urlInfo of extractedUrls) {
    if (urlInfo.isLookalike) {
      suspiciousDomains.push(urlInfo.hostname);
      findings.push({
        id: `url_lookalike_${urlInfo.hostname}`,
        title: `Deceptive Lookalike Domain (${urlInfo.lookalikeBrand || 'Brand'})`,
        description: `The URL '${urlInfo.rawUrl}' uses a domain (${urlInfo.hostname}) that mimics ${urlInfo.lookalikeBrand} but is not their official website. This is a primary phishing indicator.`,
        severity: 'critical',
        evidence: urlInfo.rawUrl,
        category: 'Phishing Infrastructure',
      });
      categoriesSet.add('Lookalike Domain');
      basePoints += 40;
    } else if (urlInfo.isSuspiciousTld) {
      suspiciousDomains.push(urlInfo.hostname);
      findings.push({
        id: `url_suspicious_tld_${urlInfo.hostname}`,
        title: `High-Risk Top-Level Domain (.${urlInfo.tld})`,
        description: `The link points to a .${urlInfo.tld} domain (${urlInfo.hostname}), a top-level domain frequently utilized for disposable scam and phishing landing pages.`,
        severity: 'high',
        evidence: urlInfo.rawUrl,
        category: 'Suspicious Domain',
      });
      categoriesSet.add('Suspicious Domain');
      basePoints += 28;
    } else if (urlInfo.isShortener) {
      shortenersDetected = true;
      findings.push({
        id: `url_shortener_${urlInfo.hostname}`,
        title: 'Obfuscated Shortened Link',
        description: `The message contains a shortened URL (${urlInfo.hostname}) that conceals the true destination address. Scammers routinely use link shorteners to bypass SMS filtering.`,
        severity: 'medium',
        evidence: urlInfo.rawUrl,
        category: 'Link Obfuscation',
      });
      categoriesSet.add('Link Obfuscation');
      basePoints += 22;
    } else if (urlInfo.isIp) {
      suspiciousDomains.push(urlInfo.hostname);
      findings.push({
        id: `url_ip_hostname_${urlInfo.hostname}`,
        title: 'Raw IP Address in Hyperlink',
        description: `The link directly references an IP address (${urlInfo.hostname}) rather than a legitimate registered domain name, common in malicious host networks.`,
        severity: 'critical',
        evidence: urlInfo.rawUrl,
        category: 'Phishing Infrastructure',
      });
      categoriesSet.add('Suspicious Domain');
      basePoints += 38;
    }

    if (urlInfo.hasSuspiciousPath && (urlInfo.isLookalike || urlInfo.isSuspiciousTld || urlInfo.isShortener || urlInfo.isIp)) {
      findings.push({
        id: `url_cred_path_${urlInfo.path}`,
        title: 'Credential Harvesting Path Structure',
        description: `The embedded link targets a path (${urlInfo.path}) designed to solicit logins, account unlocks, or personal identity verification.`,
        severity: 'high',
        evidence: urlInfo.rawUrl,
        category: 'Credential Harvesting',
      });
      basePoints += 20;
    }
  }

  // ── 2. OTP / 2FA Context Analysis (Harvesting vs. Legitimate Dispatch) ──
  // Check if message is soliciting an OTP FROM the user:
  const otpSolicitationMatch = combinedText.match(
    /(?:send|reply\s+with|forward|text\s+back|share|provide|enter)\s+(?:me\s+)?(?:the\s+)?(?:(?:6[- ]digit|\d+[- ]digit)\s+)?(?:otp\s+)?(?:one-time\s+pass(?:code|word)|verification\s+code|passcode|code|auth\s+code|security\s+code)/i
  ) || combinedText.match(
    /(?:what\s+is\s+the\s+(?:otp|verification\s+code|passcode|code\s+you\s+(?:just\s+)?received))/i
  ) || combinedText.match(
    /(?:read\s+(?:me\s+)?the\s+code|give\s+me\s+the\s+code|tell\s+me\s+the\s+code)/i
  );

  // Check if message is a legitimate OTP dispatch with safety disclaimers:
  const otpSecurityDisclaimerMatch = combinedText.match(
    /(?:do\s+not\s+share\s+this\s+code|never\s+share\s+this\s+code|don't\s+share\s+this\s+code|will\s+never\s+ask\s+(?:you\s+)?for\s+this\s+code|no\s+one\s+will\s+ask\s+for\s+this\s+code|keep\s+this\s+code\s+private)/i
  );
  const otpDispatchMatch = combinedText.match(
    /(?:your\s+(?:[\w\s]{0,20})?verification\s+code\s+is|your\s+one-time\s+pass(?:code|word)\s+is|use\s+code\s+\d{4,8}\s+to\s+verify|valid\s+for\s+\d+\s+minutes?)/i
  );

  let isLegitimateOtpNotice = false;

  if (otpSolicitationMatch) {
    findings.push({
      id: 'otp_harvesting_attempt',
      title: 'One-Time Passcode (OTP) Solicitation',
      description: 'The message explicitly prompts you to share, forward, or send back a verification code. Legitimate institutions and services NEVER ask you to share your OTP or two-factor code.',
      severity: 'critical',
      evidence: otpSolicitationMatch[0],
      category: 'Credential Theft',
    });
    categoriesSet.add('OTP Theft');
    basePoints += 48;
  } else if (otpSecurityDisclaimerMatch && otpDispatchMatch) {
    isLegitimateOtpNotice = true;
    findings.push({
      id: 'legitimate_otp_notice',
      title: 'Authentic Verification Code Dispatch Pattern',
      description: 'The message delivers a verification code accompanied by a standard security warning advising you never to share it. Legitimate providers include this disclaimer to protect your account.',
      severity: 'info',
      evidence: otpSecurityDisclaimerMatch[0],
      category: 'Security Verification',
    });
  }

  // ── 3. Credential & Sensitive Data Harvesting ───────────────────────────
  const ssnMatch = combinedText.match(
    /\b(?:ssn|social\s+security\s+number|national\s+id|aadhaar|passport\s+number)\b/i
  );
  const bankingDetailsMatch = combinedText.match(
    /\b(?:banking\s+routing\s+details?|routing\s+details?|bank\s+routing\s+number|account\s+and\s+routing|banking\s+details)\b/i
  );
  const creditCardPromptMatch = combinedText.match(
    /\b(?:credit\s+card\s+number|card\s+number\s+and\s+cvv|cvv\s+code|card\s+expiration\s+date|enter\s+card\s+details)\b/i
  );
  const passwordPromptMatch = combinedText.match(
    /(?:verify|confirm|reset|enter|submit)\s+(?:your\s+)?(?:password|credentials|login\s+details|login\s+credentials|secret\s+pin)/i
  );

  if (ssnMatch || bankingDetailsMatch || creditCardPromptMatch) {
    const matchedToken = (ssnMatch || bankingDetailsMatch || creditCardPromptMatch)![0];
    const sentenceEvidence = extractContextSentence(combinedText, matchedToken);

    findings.push({
      id: 'sensitive_identity_harvesting',
      title: 'High-Value Identity & Financial Data Solicitation',
      description: 'Requests sensitive identifiers such as Social Security Numbers, banking routing coordinates, or credit card details via unencrypted channels.',
      severity: 'critical',
      evidence: sentenceEvidence || matchedToken,
      category: 'Identity Theft',
    });
    categoriesSet.add('Identity Theft');
    basePoints += 45;
  }

  if (passwordPromptMatch) {
    findings.push({
      id: 'credential_harvesting_prompt',
      title: 'Direct Password / Credential Solicitation',
      description: 'Urges you to submit or reset confidential login credentials directly in response to this message or via an unverified link.',
      severity: 'critical',
      evidence: passwordPromptMatch[0],
      category: 'Credential Theft',
    });
    categoriesSet.add('Credential Theft');
    basePoints += 38;
  }

  // ── 4. Brand & Authority Impersonation ────────────────────────────────────
  let impersonatedBrand: string | undefined;
  let impersonationEvidence: string | undefined;

  for (const brand of TARGETED_BRANDS) {
    if (brand.pattern.test(combinedText)) {
      // Check if mentioned in an authoritative context or as the sender
      const authorityPattern = new RegExp(
        `(?:your\\s+${brand.name}|${brand.name}\\s+(?:notice|security|account|support|alert|service|fraud|care|invoice|team|verification|total)|from:\\s*${brand.name}|internal\\s+revenue\\s+service\\s*\\(irs\\)|\\(irs\\):)`,
        'i'
      );
      const match = combinedText.match(authorityPattern);
      if (match) {
        impersonatedBrand = brand.name;
        impersonationEvidence = match[0];
        break;
      } else if (subject && brand.pattern.test(subject)) {
        impersonatedBrand = brand.name;
        impersonationEvidence = subject;
        break;
      }
    }
  }

  // Family member emergency impersonation
  const familyEmergencyMatch = combinedText.match(
    /\b(?:hi|hello|hey)\s+(?:mom|dad|grandma|grandpa)\b.*?\b(?:dropped\s+my\s+phone|phone\s+in\s+water|phone\s+(?:is\s+)?broken|lost\s+my\s+phone|friend'?s\s+phone)\b/is
  );

  if (familyEmergencyMatch) {
    findings.push({
      id: 'family_emergency_impersonation',
      title: 'Family Emergency / "Broken Phone" Impersonation',
      description: 'Employs the classic "stranded family member" pretext (claiming a broken phone, unfamiliar number, and urgent trouble) to exploit emotions for rapid fund transfers.',
      severity: 'critical',
      evidence: extractContextSentence(combinedText, familyEmergencyMatch[0]),
      category: 'Social Engineering',
    });
    categoriesSet.add('Social Engineering');
    basePoints += 42;
  } else if (impersonatedBrand) {
    // Only flag impersonation if combined with threats, requests, fees, or unverified links
    const hasPhishingIndicators =
      extractedUrls.some((u) => !u.isTrustedOfficial) ||
      passwordPromptMatch ||
      otpSolicitationMatch ||
      ssnMatch ||
      bankingDetailsMatch ||
      /locked|suspended|verify|urgent|fee|debited|warrant|fraud|police|gift\s+card/i.test(lower);

    if (hasPhishingIndicators) {
      findings.push({
        id: `brand_impersonation_${impersonatedBrand.toLowerCase().replace(/\s+/g, '_')}`,
        title: `Institutional Impersonation (${impersonatedBrand})`,
        description: `The communication claims authority as ${impersonatedBrand} while directing actions outside official verified platforms or demanding urgent intervention.`,
        severity: 'high',
        evidence: impersonationEvidence || impersonatedBrand,
        category: 'Brand Impersonation',
      });
      categoriesSet.add('Brand Impersonation');
      basePoints += 30;
    }
  }

  // ── 5. Coercive Threats & Pressure Tactics ────────────────────────────────
  const accountThreatMatch = combinedText.match(
    /\b(?:account\s+(?:has\s+)?(?:been\s+)?(?:locked|suspended|restricted|compromised|frozen|closed|blocked)|permanently\s+(?:closed|suspended|deleted|terminated))\b/i
  );
  const legalThreatMatch = combinedText.match(
    /\b(?:warrant\s+(?:for\s+(?:your\s+)?)?(?:arrest|issued)|legal\s+action\s+will\s+be\s+taken|law\s+enforcement\s+(?:will\s+be|has\s+been)\s+(?:contacted|dispatched)|police\s+will\s+be\s+dispatched|arrest\s+warrant|court\s+summons)\b/i
  );
  const urgencyDeadlineMatch = combinedText.match(
    /\b(?:within\s+(?:24|48|12|1|2|3)\s*hours?|within\s+(?:30|60)\s*minutes?|immediately|immediate\s+action\s+required|final\s+notice|last\s+warning|urgent!)\b/i
  );

  if (accountThreatMatch || legalThreatMatch) {
    const evidence = legalThreatMatch ? legalThreatMatch[0] : accountThreatMatch![0];
    urgencyMarkers += 2;
    findings.push({
      id: 'coercive_threat_pressure',
      title: 'Coercive Penalty & Account Threat',
      description: 'Manufactures fear of immediate arrest, account cancellation, or severe legal penalties to intimidate recipients into acting hastily.',
      severity: 'high',
      evidence,
      category: 'Coercive Manipulation',
    });
    categoriesSet.add('Coercive Urgency');
    basePoints += 30;
  }

  if (urgencyDeadlineMatch) {
    urgencyMarkers += 1;
    findings.push({
      id: 'artificial_deadline_urgency',
      title: 'Artificial Time Pressure & Panic Deadline',
      description: 'Imposes extreme artificial deadlines to prevent victims from consulting family, bank officials, or verifying facts independently.',
      severity: 'medium',
      evidence: urgencyDeadlineMatch[0],
      category: 'Psychological Manipulation',
    });
    basePoints += 15;
  }

  // ── 6. Fraudulent Payment Pretexts & Financial Demands ───────────────────
  const giftCardMatch = combinedText.match(
    /\b(?:apple\s+gift\s+cards?|google\s+play\s+cards?|steam\s+(?:gift\s+)?cards?|walmart\s+gift\s+cards?|target\s+gift\s+cards?|gift\s+cards?\s+to\s+pay|using\s+apple\s+gift\s+cards?)\b/i
  );
  const cryptoMatch = combinedText.match(
    /\b(?:guaranteed\s+(?:\d+%\s+)?returns?|crypto\s+arbitrage|deposit\s+\d*(?:\.\d+)?\s*(?:btc|bitcoin|eth|ethereum|usdt)|activate\s+your\s+(?:trading\s+)?bot|350%\s+weekly)\b/i
  );
  const p2pTransferMatch = combinedText.match(
    /\b(?:venmo|zelle|cashapp)\s+(?:or\s+(?:venmo|zelle|cashapp)\s+)?to\s+this\s+number\b|\b(?:venmo|zelle)\s+right\s+away\b/i
  );
  const fakeDeliveryFeeMatch = combinedText.match(
    /\b(?:pay\s+\$\d+(?:\.\d{2})?\s*(?:redelivery|delivery|customs|clearance|processing)\s*(?:charge|fee)?|(?:redelivery|delivery)\s+charge\s+(?:of\s+)?\$\d+(?:\.\d{2})?)\b/i
  );
  const fakeInvoiceRefundMatch = combinedText.match(
    /\b(?:auto-debited\s+\$\d+|debited\s+\$\d+|charged\s+\$\d{2,4}(?:\.\d{2})?)\b.*?\b(?:call\s+(?:our\s+)?(?:toll-free\s+)?(?:fraud|customer|department|number)|cancel\s+within\s+24\s+hours)\b/is
  );
  const lotteryPrizeMatch = combinedText.match(
    /\b(?:congratulations!\s+you\s+won|you\s+won\s+a\s+\$\d+|claim\s+(?:your\s+)?(?:\$\d+[\d,]*\s+)?(?:gift\s+card|prize|reward|free\s+iphone))\b/i
  );
  const jobOpportunityMatch = combinedText.match(
    /\b(?:remote\s+data\s+entry|associate\s+opportunity|\$\d+\/hr\s+paid\s+weekly|flexible\s+hours|no\s+prior\s+experience|equipment\s+provided)\b/i
  );

  if (giftCardMatch) {
    findings.push({
      id: 'gift_card_payment_demand',
      title: 'Non-Refundable Gift Card Payment Demand',
      description: 'Demands payment via commercial gift cards. No authentic corporate entity, utility, or government organization ever accepts gift cards as lawful payment.',
      severity: 'critical',
      evidence: giftCardMatch[0],
      category: 'Financial Fraud',
    });
    categoriesSet.add('Payment Fraud');
    basePoints += 45;
  }

  if (cryptoMatch) {
    findings.push({
      id: 'crypto_investment_scheme',
      title: 'Deceptive Crypto Investment / Advance Deposit',
      description: 'Promises impossible "guaranteed" trading returns or demands upfront cryptocurrency deposits — signature traits of advance-fee and investment fraud.',
      severity: 'critical',
      evidence: cryptoMatch[0],
      category: 'Investment Fraud',
    });
    categoriesSet.add('Crypto Scam');
    basePoints += 45;
  }

  if (p2pTransferMatch) {
    findings.push({
      id: 'p2p_wire_transfer_demand',
      title: 'Immediate Peer-to-Peer Payment Demand',
      description: 'Instructs immediate peer-to-peer fund transfers (Zelle/Venmo/CashApp). P2P transactions operate like cash and lack buyer protections when sent to scammers.',
      severity: 'high',
      evidence: p2pTransferMatch[0],
      category: 'Financial Fraud',
    });
    categoriesSet.add('Payment Fraud');
    basePoints += 32;
  }

  if (fakeDeliveryFeeMatch) {
    findings.push({
      id: 'parcel_redelivery_fee_trap',
      title: 'Fraudulent Parcel Delivery Fee Lure',
      description: 'Demands an unexpected micro-payment ($1–$5) for redelivery or customs clearance. This is a prevalent smishing method used to harvest credit card numbers.',
      severity: 'high',
      evidence: fakeDeliveryFeeMatch[0],
      category: 'Smishing',
    });
    categoriesSet.add('Smishing');
    basePoints += 35;
  }

  if (fakeInvoiceRefundMatch) {
    findings.push({
      id: 'fake_invoice_refund_trap',
      title: 'Fake Auto-Renewal Invoice & Call-Back Lure',
      description: 'Fabricates a bogus large charge and urges you to call a fraudulent support number to dispute or cancel it (callback phishing / refund scam).',
      severity: 'high',
      evidence: fakeInvoiceRefundMatch[0].slice(0, 80) + '...',
      category: 'Phishing',
    });
    categoriesSet.add('Refund Scam');
    basePoints += 35;
  }

  if (lotteryPrizeMatch) {
    findings.push({
      id: 'lottery_prize_lure',
      title: 'Unsolicited Prize / Lottery Award Pretext',
      description: 'Claims you have won high-value rewards or contests you never entered to entice you into paying advance processing fees or divulging credentials.',
      severity: 'high',
      evidence: lotteryPrizeMatch[0],
      category: 'Advance Fee Fraud',
    });
    categoriesSet.add('Prize Scam');
    basePoints += 32;
  }

  // ── 7. Legitimate Communication Context Protections ───────────────────────
  const isDeliveryStatusNotice =
    /\b(?:your\s+package\s+(?:was|has\s+been)\s+delivered|delivered\s+to\s+(?:your\s+)?(?:front\s+door|porch|mailbox)|tracking\s+number:?\s*[a-z0-9]+|out\s+for\s+delivery)\b/i.test(
      combinedText
    ) &&
    !fakeDeliveryFeeMatch &&
    !accountThreatMatch &&
    suspiciousDomains.length === 0;

  const isLegitimateSecurityAlert =
    /\b(?:new\s+sign-in|unrecognized\s+device)\b/i.test(combinedText) &&
    /\b(?:if\s+this\s+was\s+you[,\s]+no\s+action\s+is\s+needed|no\s+action\s+is\s+required)\b/i.test(
      combinedText
    ) &&
    suspiciousDomains.length === 0 &&
    !passwordPromptMatch;

  // ── 8. Contextual Compound Synergies & Risk Scoring ───────────────────────
  let compoundBonus = 0;

  // Impersonation + Credential/OTP Theft = Targeted credential compromise
  if (impersonatedBrand && (passwordPromptMatch || otpSolicitationMatch || ssnMatch || bankingDetailsMatch)) {
    compoundBonus += 30;
  }

  // Impersonation + Suspicious Link = Active phishing portal
  if (impersonatedBrand && suspiciousDomains.length > 0) {
    compoundBonus += 25;
  }

  // Coercive Threat + Payment/Gift Card/Credential Demand = Aggressive extortion/fraud
  if ((accountThreatMatch || legalThreatMatch) && (giftCardMatch || fakeDeliveryFeeMatch || passwordPromptMatch || p2pTransferMatch)) {
    compoundBonus += 30;
  }

  // Family Emergency + P2P Transfer = Emergency fraud
  if (familyEmergencyMatch && p2pTransferMatch) {
    compoundBonus += 30;
  }

  // Delivery Pretext + Lookalike link / fee = Parcel smishing
  if (fakeDeliveryFeeMatch && (suspiciousDomains.length > 0 || extractedUrls.length > 0)) {
    compoundBonus += 25;
  }

  // Crypto / Advance Fee + High Yield Return
  if (cryptoMatch && /deposit|bot|arbitrage/i.test(combinedText)) {
    compoundBonus += 35;
  }

  // Job Scam + SSN / Banking details
  if (jobOpportunityMatch && (ssnMatch || bankingDetailsMatch)) {
    compoundBonus += 40;
  }

  // Fake Invoice + Phone Call to cancel
  if (fakeInvoiceRefundMatch && /call|toll-free|cancel/i.test(combinedText)) {
    compoundBonus += 25;
  }

  // Calculate final raw score
  let finalScore = 5 + basePoints + compoundBonus;

  // Apply contextual protections
  if (isLegitimateOtpNotice && findings.length === 1) {
    finalScore = 8;
  } else if (isDeliveryStatusNotice && findings.length === 0) {
    finalScore = 7;
    findings.push({
      id: 'routine_delivery_status',
      title: 'Routine Informational Delivery Notice',
      description: 'Standard delivery notification reporting status. Free of unexpected fee requests, coercive deadlines, or suspicious destination links.',
      severity: 'info',
      category: 'Informational',
    });
  } else if (isLegitimateSecurityAlert && findings.length === 0) {
    finalScore = 10;
    findings.push({
      id: 'benign_security_alert',
      title: 'Informational Account Sign-In Advisory',
      description: 'Standard security advisory informing you of a login event and explicitly clarifying that no action is required if the sign-in was recognized.',
      severity: 'info',
      category: 'Informational',
    });
  } else if (findings.length === 0) {
    // Normal conversational or business content
    finalScore = 6;
  }

  // Clamp final score
  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  // Derive standardized level and label
  const riskLevel = getRiskLevel(finalScore);
  const statusLabel = getRiskLabel(finalScore);

  // Confidence assessment
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (finalScore >= 40 && finalScore <= 59 && extractedUrls.length === 0) {
    confidence = 'medium';
  }

  // Formulate tailored recommendations and summary
  let summary = '';
  if (riskLevel === 'critical' || riskLevel === 'CRITICAL_RISK') {
    summary = `Critical risk detected. This communication exhibits clear indicators of fraudulent activity (${Array.from(categoriesSet).slice(0, 2).join(', ') || 'social engineering'}). Do not interact with links or submit information.`;
    recommendations.push(
      'Do not tap or click any links in this message.',
      'Never share one-time passcodes (OTPs), PINs, or credentials.',
      'Do not transfer money via Zelle, Venmo, wire, or gift cards.',
      'Navigate to the organization’s official app or bookmarked website directly.',
      'Report and block this sender on your device.'
    );
  } else if (riskLevel === 'high' || riskLevel === 'HIGH_RISK') {
    summary = `High risk detected. Strong indicators of deceptive communication (${Array.from(categoriesSet).slice(0, 2).join(', ') || 'unverified links or coercive urgency'}). Exercise extreme caution.`;
    recommendations.push(
      'Do not click embedded links or call phone numbers listed in the message.',
      'Verify account status independently through known official channels.',
      'Do not pay any unexpected delivery fees or settlement charges.',
      'Delete the message or mark as spam if the sender is unknown.'
    );
  } else if (riskLevel === 'suspicious' || riskLevel === 'SUSPICIOUS') {
    summary = `Suspicious patterns detected. The message contains elements (such as shortened links or unverified requests) that require careful verification before taking action.`;
    recommendations.push(
      'Verify the sender identity directly through a known alternative contact method.',
      'Avoid clicking unverified shortened URLs until destination is confirmed.',
      'Refrain from sharing personal or financial details.'
    );
  } else if (riskLevel === 'low') {
    summary = `Low risk. Minor informational anomalies were observed, but no active threat indicators or credential demands were found.`;
    recommendations.push(
      'Verify sender details match expected official communication patterns.',
      'Exercise standard digital caution before interacting with links.'
    );
  } else {
    // Safe / No Known Threat
    summary = `No known scam indicators, coercive threats, deceptive links, or credential requests were identified in the analyzed text.`;
    recommendations.push(
      'Continue standard digital hygiene when reviewing unexpected messages.',
      'Keep one-time verification codes strictly confidential.',
      'Verify unexpected requests through official contact channels.'
    );
  }

  const categories = categoriesSet.size > 0 ? Array.from(categoriesSet) : ['No Threat Detected'];

  return {
    riskScore: finalScore,
    riskLevel,
    statusLabel,
    summary,
    categories,
    findings,
    recommendations,
    confidence,
    sources: [
      {
        name: 'Contextual Heuristics Engine',
        status: 'checked',
        result: findings.length > 0 ? 'signals_analyzed' : 'no_signals',
      },
      {
        name: 'Domain & Link Inspector',
        status: 'checked',
        result: extractedUrls.length > 0 ? `${extractedUrls.length} urls inspected` : 'no_links',
      },
      {
        name: 'Credential & Fraud Pattern Analyzer',
        status: 'checked',
        result: basePoints > 0 ? 'risk_patterns_matched' : 'clean',
      },
    ],
    sourceDetails: {
      urgencyMarkers,
      urlAnalysis: {
        extractedUrls: extractedUrls.map((u) => u.rawUrl),
        suspiciousDomains,
        shortenersDetected,
      },
    },
  };
}

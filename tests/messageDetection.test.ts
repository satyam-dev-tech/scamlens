/**
 * ScamLens Message Scam Detection Regression Tests
 *
 * Covers:
 * 1. Fraudulent messages (credential theft, OTP harvesting, brand impersonation,
 *    delivery fee traps, emergency impersonation, job scam SSN harvesting, crypto fraud, IRS gift cards)
 * 2. Legitimate messages (OTP dispatch with warnings, normal package delivery notices,
 *    security sign-in alerts, casual friendship chats, standard business invoices)
 * 3. Ambiguous messages (unsolicited shortened links, unverified neutral alerts)
 * 4. Determinism, evidence validity, and non-fabrication checks.
 */

import { analyzeMessageContent } from '../src/services/messageScamAnalyzer.js';

interface TestCase {
  name: string;
  category: 'fraudulent' | 'legitimate' | 'ambiguous';
  input: string;
  subject?: string;
  expectedRiskLevels: string[];
  minScore?: number;
  maxScore?: number;
  expectedSignalPatterns?: string[];
  forbiddenSignalPatterns?: string[];
}

const TEST_CASES: TestCase[] = [
  // ─── 1. FRAUDULENT MESSAGES ───────────────────────────────────────────────
  {
    name: 'Chase bank impersonation with lookalike phishing link & lockout threat',
    category: 'fraudulent',
    input: 'URGENT! Your Chase account has been locked due to suspicious activity. Verify identity immediately at https://chase-secure-auth.top/unlock or your account will be permanently closed.',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 75,
    maxScore: 100,
    expectedSignalPatterns: ['Lookalike Domain', 'Coercive', 'Institutional Impersonation'],
  },
  {
    name: 'OTP Harvesting Scam soliciting 2FA passcode',
    category: 'fraudulent',
    input: 'Chase Fraud Alert: Suspicious transaction of $489.99 detected. Reply with the 6-digit OTP verification code you just received to cancel this transaction immediately.',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 75,
    maxScore: 100,
    expectedSignalPatterns: ['One-Time Passcode (OTP) Solicitation'],
  },
  {
    name: 'USPS fake redelivery fee smishing with suspicious domain',
    category: 'fraudulent',
    input: 'USPS Notice: Your package could not be delivered due to an incorrect postal address. Please pay $1.85 redelivery charge at usps-redelivery-hub.info.',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 70,
    maxScore: 100,
    expectedSignalPatterns: ['Parcel Delivery Fee Lure', 'Deceptive Lookalike Domain'],
  },
  {
    name: 'Family emergency / "broken phone" Zelle extortion scam',
    category: 'fraudulent',
    input: "Hi Dad, I dropped my phone into water and this is my friend's phone. I urgently need $350 for train ticket back home. Can you Venmo or Zelle to this number right away?",
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 75,
    maxScore: 100,
    expectedSignalPatterns: ['Family Emergency', 'Immediate Peer-to-Peer Payment Demand'],
  },
  {
    name: 'Remote job opportunity harvesting SSN and banking routing numbers',
    category: 'fraudulent',
    input: 'Remote Data Entry Associate Opportunity: Flexible hours, $45/hr paid weekly. No prior experience required. Equipment provided. To complete onboarding, submit your full name, date of birth, SSN, and banking routing details.',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 80,
    maxScore: 100,
    expectedSignalPatterns: ['High-Value Identity & Financial Data Solicitation'],
  },
  {
    name: 'AI crypto investment scam promising guaranteed returns',
    category: 'fraudulent',
    input: 'Exclusive invitation: Guaranteed 350% weekly returns on automated AI crypto arbitrage trading. Limited to 20 accredited investors today. Deposit 0.1 BTC to activate your bot.',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 75,
    maxScore: 100,
    expectedSignalPatterns: ['Crypto Investment'],
  },
  {
    name: 'IRS arrest warrant threat demanding Apple gift cards',
    category: 'fraudulent',
    input: 'Internal Revenue Service (IRS): A warrant for your arrest has been issued due to tax evasion. Immediate action required. You must pay $1,500 using Apple gift cards within 24 hours or police will be dispatched.',
    expectedRiskLevels: ['critical', 'CRITICAL_RISK'],
    minScore: 85,
    maxScore: 100,
    expectedSignalPatterns: ['Non-Refundable Gift Card Payment Demand', 'Coercive Penalty & Account Threat'],
  },
  {
    name: 'Geek Squad fake auto-renewal invoice call-back phishing',
    category: 'fraudulent',
    input: 'Thank you for your renewal. An automatic charge of $499.00 has been debited from your checking account. If you believe this is an error or did not authorize this purchase, call our toll-free fraud department immediately at +1-888-555-0193 to cancel within 24 hours.',
    subject: 'Invoice #GS-99824: Geek Squad Total Tech Care Auto-Debited $499.00',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 65,
    maxScore: 100,
    expectedSignalPatterns: ['Fake Auto-Renewal Invoice'],
  },
  {
    name: 'Phishing email with raw IP address credential reset link',
    category: 'fraudulent',
    input: 'We detected a login attempt from Moscow, Russia (IP: 185.220.101.4). If this was not you, reset your password immediately: http://185.220.101.4/account-recovery',
    subject: 'Security Alert: Unauthorized sign-in attempt on Microsoft Account',
    expectedRiskLevels: ['high', 'critical', 'HIGH_RISK', 'CRITICAL_RISK'],
    minScore: 75,
    maxScore: 100,
    expectedSignalPatterns: ['Raw IP Address', 'Direct Password / Credential Solicitation'],
  },

  // ─── 2. LEGITIMATE MESSAGES (FALSE POSITIVE REDUCTION) ────────────────────
  {
    name: 'Legitimate OTP dispatch notification with "do not share" warning',
    category: 'legitimate',
    input: 'Your Netflix verification code is 849201. It expires in 10 minutes. Do not share this code with anyone. We will never ask for this code.',
    expectedRiskLevels: ['safe', 'low', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 19,
    forbiddenSignalPatterns: ['One-Time Passcode (OTP) Solicitation', 'Credential Theft'],
    expectedSignalPatterns: ['Authentic Verification Code Dispatch Pattern'],
  },
  {
    name: 'Legitimate routine package delivery status from USPS',
    category: 'legitimate',
    input: 'USPS: Tracking number 9400100000000000000000 was delivered to your front porch at 2:15 PM on Monday. Thank you for choosing USPS.',
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 19,
    forbiddenSignalPatterns: ['Parcel Delivery Fee Lure', 'Deceptive Lookalike Domain', 'Smishing'],
  },
  {
    name: 'Legitimate Amazon package delivery notification',
    category: 'legitimate',
    input: 'Amazon: Your package has been delivered to your front door. Track or view order details at https://amazon.com.',
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 19,
    forbiddenSignalPatterns: ['Lookalike Domain', 'Parcel Delivery Fee Lure'],
  },
  {
    name: 'Legitimate security sign-in alert with "no action needed"',
    category: 'legitimate',
    input: 'Google: A new sign-in was detected on Chrome (Windows). If this was you, no action is needed. Review recent activity in your Google account settings.',
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 19,
    forbiddenSignalPatterns: ['Coercive Threat', 'Lookalike Domain'],
  },
  {
    name: 'Everyday casual chat between friends (testing "friend" keyword)',
    category: 'legitimate',
    input: 'Hey friend, are you free for lunch tomorrow? Let me know if that works for you!',
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 15,
    forbiddenSignalPatterns: ['Delivery Scam', 'Social Engineering', 'Impersonation'],
  },
  {
    name: 'Legitimate business invoice communication (testing "invoice" keyword)',
    category: 'legitimate',
    input: "Hi Sarah, please find attached our invoice for October web design consulting. Standard net-30 terms apply. Let me know if you need any adjustments.",
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 15,
    forbiddenSignalPatterns: ['Fake Auto-Renewal Invoice', 'Refund Scam'],
  },
  {
    name: 'Safe team meeting agenda and planning notes',
    category: 'legitimate',
    input: 'Quarterly planning meeting notes: Review product roadmap, finalize mobile design prototypes, and schedule team retrospective for Thursday at 2:00 PM EST.',
    expectedRiskLevels: ['safe', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 15,
    forbiddenSignalPatterns: ['Phishing', 'Coercive Urgency'],
  },

  // ─── 3. AMBIGUOUS / CONTEXTUAL MESSAGES ───────────────────────────────────
  {
    name: 'Unsolicited message containing shortened link without credentials',
    category: 'ambiguous',
    input: 'Hi, please take a look at this document when you get a chance: https://bit.ly/3xY7z9Q',
    expectedRiskLevels: ['suspicious', 'SUSPICIOUS', 'low'],
    minScore: 20,
    maxScore: 59,
    expectedSignalPatterns: ['Obfuscated Shortened Link'],
    forbiddenSignalPatterns: ['One-Time Passcode (OTP) Solicitation', 'Identity Theft'],
  },
  {
    name: 'Neutral unverified utility billing update',
    category: 'ambiguous',
    input: 'Notice: Your monthly water utility statement is ready for review. Access your account through your regular utility portal.',
    expectedRiskLevels: ['safe', 'low', 'NO_KNOWN_THREAT'],
    minScore: 0,
    maxScore: 25,
  },
];

// ─── Test Runner ────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n============================================================');
  console.log('  ScamLens Message Scam Detection Suite');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const result = analyzeMessageContent(tc.input, { subject: tc.subject });

    const failures: string[] = [];

    // Check risk level
    if (!tc.expectedRiskLevels.includes(result.riskLevel)) {
      failures.push(
        `Risk level mismatch: expected one of [${tc.expectedRiskLevels.join(', ')}], got '${result.riskLevel}' (Score: ${result.riskScore})`
      );
    }

    // Check score bounds
    if (tc.minScore !== undefined && result.riskScore < tc.minScore) {
      failures.push(`Score too low: expected >= ${tc.minScore}, got ${result.riskScore}`);
    }
    if (tc.maxScore !== undefined && result.riskScore > tc.maxScore) {
      failures.push(`Score too high: expected <= ${tc.maxScore}, got ${result.riskScore}`);
    }

    // Check expected signal patterns
    if (tc.expectedSignalPatterns) {
      for (const pattern of tc.expectedSignalPatterns) {
        const found = result.findings.some(
          (f) =>
            f.title.toLowerCase().includes(pattern.toLowerCase()) ||
            (f.category && f.category.toLowerCase().includes(pattern.toLowerCase()))
        );
        if (!found) {
          failures.push(`Missing expected signal pattern: "${pattern}"`);
        }
      }
    }

    // Check forbidden signal patterns (anti-false-positive checks)
    if (tc.forbiddenSignalPatterns) {
      for (const pattern of tc.forbiddenSignalPatterns) {
        const found = result.findings.some(
          (f) =>
            f.title.toLowerCase().includes(pattern.toLowerCase()) ||
            (f.category && f.category.toLowerCase().includes(pattern.toLowerCase()))
        );
        if (found) {
          failures.push(`False positive: triggered forbidden signal pattern "${pattern}"`);
        }
      }
    }

    // Check evidence validity: no signal should have empty evidence if evidence is set,
    // and if evidence is set, it must appear in the combined input text!
    const combinedInput = ((tc.subject || '') + ' ' + tc.input).toLowerCase();
    for (const f of result.findings) {
      if (f.evidence !== undefined) {
        if (!f.evidence.trim()) {
          failures.push(`Signal '${f.title}' has empty whitespace evidence`);
        } else {
          // Clean evidence of trailing ellipses or formatting
          const cleanEvidence = f.evidence.replace(/\.{2,}$/, '').trim().toLowerCase();
          // Check if clean evidence is contained or if it's a domain/url from input
          const words = cleanEvidence.split(/\s+/).slice(0, 3).join(' ');
          if (cleanEvidence.length > 5 && !combinedInput.includes(words) && !combinedInput.includes(cleanEvidence)) {
            failures.push(`Signal '${f.title}' evidence "${f.evidence}" does not match message text!`);
          }
        }
      }
    }

    // Determinism test: run a second time and check for identical outputs
    const repeatResult = analyzeMessageContent(tc.input, { subject: tc.subject });
    if (repeatResult.riskScore !== result.riskScore || repeatResult.riskLevel !== result.riskLevel) {
      failures.push(
        `Non-deterministic result: run 1 gave ${result.riskScore} (${result.riskLevel}), run 2 gave ${repeatResult.riskScore} (${repeatResult.riskLevel})`
      );
    }

    if (failures.length === 0) {
      passed++;
      console.log(`[PASS] [${tc.category.toUpperCase()}] ${tc.name}`);
      console.log(`       Score: ${result.riskScore}/100 (${result.statusLabel}), Signals: ${result.findings.length}`);
    } else {
      failed++;
      console.error(`[FAIL] [${tc.category.toUpperCase()}] ${tc.name}`);
      console.error(`       Score: ${result.riskScore}/100 (${result.statusLabel})`);
      failures.forEach((f) => console.error(`       -> ${f}`));
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Total: ${TEST_CASES.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

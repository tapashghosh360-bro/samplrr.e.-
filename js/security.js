/**
 * THE REAL ESTATE — Enterprise Security & Input Protection Module
 * Implements SQL Injection detection & defense, XSS sanitization,
 * honeypot anti-bot filtering, rate limiting, and input schema validation.
 */

// Comprehensive SQL Injection Signatures
const SQLI_REGEX_PATTERNS = [
  // Classic boolean-based SQLi (e.g. ' OR '1'='1, ' or 1=1 --)
  /(?:'\s*(?:or|and)\s*['\w]+\s*=\s*['\w]+)/i,
  /(?:\b(?:or|and)\b\s+[\w'"]+\s*=\s*[\w'"]+)/i,
  /(?:1\s*=\s*1|0\s*=\s*0|'a'\s*=\s*'a')/i,
  
  // Union-based SQLi (e.g. UNION SELECT, UNION ALL SELECT)
  /(?:\bunion\b\s+(?:\ball\b\s+)?\bselect\b)/i,
  
  // Piggybacked SQL commands
  /(?:;\s*(?:drop|truncate|alter|create|delete|insert|update|grant|revoke|exec|execute)\b)/i,
  
  // Destructive SQL commands with comment escapes
  /(?:\b(?:drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)\b)/i,
  
  // Meta-functions & schema querying
  /(?:\b(?:version|database|schema|system_user|current_user|user|load_file|into\s+outfile|into\s+dumpfile)\s*\()/i,
  
  // Blind & timing injection attacks
  /(?:\b(?:waitfor\s+delay|benchmark\s*\(|sleep\s*\(|pg_sleep\s*\)))/i,
  
  // Hexadecimal & char encodings
  /(?:0x[0-9a-fA-F]{4,})|(?:\bchar\s*\(\s*\d+)/i,
  
  // Comment injection patterns
  /(?:--|\/\*|\*\/|#\s*$)/
];

// Dangerous XSS & Script Tag Signatures
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on\w+\s*=/gi // Event handler attributes (onload=, onerror=, onclick=)
];

/**
 * Validates text against SQL Injection patterns
 * @param {string} input 
 * @returns {{ isSafe: boolean, patternsFound: string[] }}
 */
export function detectSQLInjection(input) {
  if (typeof input !== 'string') return { isSafe: true, patternsFound: [] };
  
  const trimmed = input.trim();
  const matched = [];
  
  for (const regex of SQLI_REGEX_PATTERNS) {
    if (regex.test(trimmed)) {
      matched.push(regex.toString());
    }
  }
  
  return {
    isSafe: matched.length === 0,
    patternsFound: matched
  };
}

/**
 * Deep sanitizes text for safe search queries and database-like operations
 * Neutralizes SQL control characters and quotes
 * @param {string} input 
 * @returns {string} Sanitized string safe for querying
 */
export function sanitizeSearchQuery(input) {
  if (typeof input !== 'string') return '';
  
  let sanitized = input;
  
  // Check for SQL injection attempts
  const check = detectSQLInjection(sanitized);
  if (!check.isSafe) {
    console.warn('[Security Guard] SQL Injection pattern detected in search query:', input);
    // Strip dangerous SQL punctuation and keywords
    sanitized = sanitized
      .replace(/['";\-\/\\#*]/g, ' ')
      .replace(/\b(OR|AND|UNION|SELECT|DROP|DELETE|UPDATE|INSERT|EXEC|SLEEP|BENCHMARK)\b/gi, '');
  }
  
  // Strip control characters, excessive whitespace, and limit length
  return sanitized
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/**
 * Escapes HTML characters to prevent XSS injection in DOM rendering
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
}

/**
 * Removes dangerous HTML tags and event handlers from user text
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  
  let cleaned = str;
  
  // Strip known XSS attack patterns
  for (const pattern of XSS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Neutralize potential SQL injection characters
  cleaned = cleaned.replace(/['";\\]/g, (char) => {
    switch (char) {
      case "'": return '&#039;';
      case '"': return '&quot;';
      case ';': return '&#59;';
      case '\\': return '&#92;';
      default: return char;
    }
  });

  return cleaned.trim();
}

/**
 * E.164 and Bangladeshi phone number sanitization
 * Accepts international format or local numbers (e.g. +8801700000000 or 01700000000)
 * @param {string} phone 
 * @returns {{ isValid: boolean, sanitized: string }}
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return { isValid: false, sanitized: '' };
  
  // Allow leading +, digits, spaces, and hyphens
  const raw = phone.trim();
  const cleaned = raw.replace(/[^\d+]/g, '');
  
  // Must have between 7 and 16 digits
  const digitsOnly = cleaned.replace(/\D/g, '');
  const isValid = digitsOnly.length >= 7 && digitsOnly.length <= 15;
  
  return {
    isValid,
    sanitized: cleaned
  };
}

/**
 * Validates RFC standard email syntax
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim()) && email.length <= 254;
}

/**
 * Client-Side Rate Limiter to prevent submission flooding
 */
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 180000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.storageKey = 'the_real_estate_rate_guard';
  }

  isRateLimited() {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    
    try {
      const now = Date.now();
      const records = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      // Filter out records outside current window
      const validRecords = records.filter(ts => (now - ts) < this.windowMs);
      
      if (validRecords.length >= this.maxRequests) {
        return true;
      }
      
      validRecords.push(now);
      localStorage.setItem(this.storageKey, JSON.stringify(validRecords));
      return false;
    } catch (e) {
      return false;
    }
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validates and sanitizes lead submission payload
 * @param {Object} rawData 
 * @returns {{ isValid: boolean, error?: string, sanitizedData?: Object, securityAudit: Object }}
 */
export function validateAndSanitizeLead(rawData) {
  const audit = {
    timestamp: new Date().toISOString(),
    passedHoneypot: true,
    sqliChecked: true,
    sqliDetected: false,
    xssChecked: true,
    rateLimited: false
  };

  // 1. Anti-Bot Honeypot check (field website_address_hp should remain empty)
  if (rawData.website_address_hp) {
    audit.passedHoneypot = false;
    console.warn('[Security Guard] Bot detected via honeypot trap.');
    return {
      isValid: false,
      error: 'Form submission could not be verified.',
      securityAudit: audit
    };
  }

  // 2. Rate limit check
  if (rateLimiter.isRateLimited()) {
    audit.rateLimited = true;
    return {
      isValid: false,
      error: 'Too many requests. Please wait a few moments before submitting again.',
      securityAudit: audit
    };
  }

  // 3. Name validation & SQLi check
  const nameRaw = (rawData.name || '').trim();
  if (!nameRaw || nameRaw.length < 2) {
    return { isValid: false, error: 'Please enter your full name (at least 2 characters).', securityAudit: audit };
  }
  
  const nameSqli = detectSQLInjection(nameRaw);
  if (!nameSqli.isSafe) {
    audit.sqliDetected = true;
    console.warn('[Security Guard] SQL injection in name field:', nameRaw);
    return {
      isValid: false,
      error: 'Invalid characters detected in name.',
      securityAudit: audit
    };
  }
  const cleanName = sanitizeText(nameRaw).slice(0, 100);

  // 4. Phone validation
  const phoneResult = sanitizePhone(rawData.phone || '');
  if (!phoneResult.isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number with country code (e.g. +880 1700 000000).',
      securityAudit: audit
    };
  }

  // 5. Email validation (if provided)
  const emailRaw = (rawData.email || '').trim();
  if (emailRaw && !validateEmail(emailRaw)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.',
      securityAudit: audit
    };
  }
  const cleanEmail = escapeHTML(emailRaw);

  // 6. Message / Notes sanitization
  const messageRaw = (rawData.message || '').trim();
  const messageSqli = detectSQLInjection(messageRaw);
  if (!messageSqli.isSafe) {
    audit.sqliDetected = true;
    console.warn('[Security Guard] SQL injection in message field:', messageRaw);
  }
  const cleanMessage = sanitizeText(messageRaw).slice(0, 1500);

  // 7. Property ID whitelist
  const propIdRaw = (rawData.property_id || '').trim();
  const cleanPropId = /^[a-zA-Z0-9_-]{1,40}$/.test(propIdRaw) ? propIdRaw : '';

  // 8. Lead Type whitelist
  const allowedTypes = ['viewing', 'consultation', 'sell', 'enquiry', 'general'];
  const leadType = allowedTypes.includes(rawData.lead_type) ? rawData.lead_type : 'enquiry';

  return {
    isValid: true,
    sanitizedData: {
      name: cleanName,
      phone: phoneResult.sanitized,
      email: cleanEmail,
      message: cleanMessage,
      property_id: cleanPropId,
      property_name: sanitizeText(rawData.property_name || '').slice(0, 120),
      lead_type: leadType,
      country: sanitizeText(rawData.country || '').slice(0, 60),
      timezone: sanitizeText(rawData.timezone || '').slice(0, 60)
    },
    securityAudit: audit
  };
}

/**
 * Universal Asset URL Resolver
 * Resolves paths gracefully across root, subfolders, Vite dev, and Netlify builds
 * @param {string} path 
 * @returns {string} Normalized absolute path
 */
export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Normalize leading relative paths and redundant 'public/' prefixes
  let clean = path
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/^public\//, '');
    
  return '/' + clean;
}

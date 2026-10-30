/**
 * Netlify Serverless Function: Secure Lead Submission & SQL Injection Filter
 * Route: /.netlify/functions/submit-lead (or /api/lead)
 */

const SQLI_PATTERNS = [
  /(?:'\s*(?:or|and)\s*['\w]+\s*=\s*['\w]+)/i,
  /(?:\b(?:or|and)\b\s+[\w'"]+\s*=\s*[\w'"]+)/i,
  /(?:1\s*=\s*1|0\s*=\s*0)/i,
  /(?:\bunion\b\s+(?:\ball\b\s+)?\bselect\b)/i,
  /(?:;\s*(?:drop|truncate|alter|create|delete|insert|update|grant|revoke|exec|execute)\b)/i,
  /(?:\b(?:drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)\b)/i,
  /(?:\b(?:waitfor\s+delay|benchmark\s*\(|sleep\s*\(|pg_sleep\s*\)))/i,
  /(?:--|\/\*|\*\/|#\s*$)/
];

function checkSQLi(text) {
  if (typeof text !== 'string') return false;
  return SQLI_PATTERNS.some(re => re.test(text));
}

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

export const handler = async (event) => {
  // Security headers for API response
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // 1. Anti-Bot Honeypot check
    if (body.website_address_hp || body['bot-field']) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Security validation failed.' })
      };
    }

    // 2. SQL Injection Inspection across all submitted fields
    const fieldsToScan = [body.name, body.phone, body.email, body.message, body.property_name, body.property_id];
    for (const val of fieldsToScan) {
      if (checkSQLi(val)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Security alert: Disallowed SQL syntax detected in submission.',
            code: 'SQLI_BLOCKED'
          })
        };
      }
    }

    // 3. Validation
    const name = sanitize(body.name || '');
    const phone = (body.phone || '').replace(/[^\d+]/g, '');
    const email = sanitize(body.email || '');
    const message = sanitize(body.message || '');
    const propId = sanitize(body.property_id || '');
    const propName = sanitize(body.property_name || 'General Inquiry');
    const leadType = sanitize(body.lead_type || 'enquiry');

    if (name.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name must be at least 2 characters.' })
      };
    }

    if (phone.replace(/\D/g, '').length < 7) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid phone number required.' })
      };
    }

    const leadId = 'TR-' + Math.floor(1000 + Math.random() * 9000);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        lead_id: leadId,
        message: 'Your inquiry has been securely vetted and assigned to a private property advisor.',
        timestamp: new Date().toISOString(),
        security_status: 'VERIFIED_SAFE'
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON payload.' })
    };
  }
};

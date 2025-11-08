const fetch = global.fetch;

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...DEFAULT_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: DEFAULT_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' }, { Allow: 'POST' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'GEMINI_API_KEY is not configured.' });
  }

  let requestPayload;
  try {
    requestPayload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON payload.' }),
    };
  }

  if (!requestPayload || typeof requestPayload !== 'object') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Request payload must be a JSON object.' }),
    };
  }

  const endpoint = new URL(GEMINI_ENDPOINT);
  endpoint.searchParams.set('key', apiKey);

  const requestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  };

  try {
    const response = await fetch(endpoint, requestInit);
    const text = await response.text();

    if (!response.ok) {
      let errorMessage = `Gemini API responded with ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.error?.message || errorMessage;
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: errorMessage, details: errorJson }),
        };
      } catch (parseError) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: errorMessage }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: text,
    };
  } catch (error) {
    console.error('Failed to proxy Gemini request:', error);
    return jsonResponse(502, { error: 'Failed to reach Gemini API.' });
  }
};

const fetch = global.fetch;

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }),
    };
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

  const requestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(requestPayload),
  };

  try {
    const response = await fetch(GEMINI_ENDPOINT, requestInit);
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
      body: text,
    };
  } catch (error) {
    console.error('Failed to proxy Gemini request:', error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to reach Gemini API.' }),
    };
  }
};

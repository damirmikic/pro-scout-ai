const GEMINI_PROXY_ENDPOINT = '/.netlify/functions/gemini-proxy';

export async function invokeGemini(payload) {
  let response;
  try {
    response = await fetch(GEMINI_PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    console.error('Network error contacting Gemini proxy:', networkError);
    const error = new Error('Network error contacting AI service.');
    error.isNetworkError = true;
    throw error;
  }

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (_) {
      // ignore parse error
    }
    const message =
      errorBody?.error ||
      errorBody?.details?.error?.message ||
      `Gemini proxy error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = errorBody;
    throw error;
  }

  try {
    return await response.json();
  } catch (parseError) {
    console.error('Failed to parse Gemini proxy response:', parseError);
    const error = new Error('Failed to parse AI response.');
    error.isParseError = true;
    throw error;
  }
}

export async function callGeminiApi(parts, useGrounding = false) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      topK: 10
    }
  };

  if (useGrounding) {
    payload.tools = [{ google_search: {} }];
  }

  let attempt = 0;
  const maxAttempts = 5;
  const baseDelay = 1000;
  let lastError = null;

  while (attempt < maxAttempts) {
    try {
      const result = await invokeGemini(payload);

      if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
        return result.candidates[0].content.parts[0].text;
      } else if (result.candidates && result.candidates[0].finishReason === 'SAFETY') {
        throw new Error('Analysis blocked by safety settings. The provided images or text may be sensitive.');
      } else {
        console.warn('Unexpected API response structure:', result);
        throw new Error("Could not parse the AI's response.");
      }
    } catch (error) {
      lastError = error;
      attempt++;
      const retriable = (error.status && (error.status === 429 || error.status >= 500)) || error.isNetworkError;
      if (retriable && attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`AI service error, retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Failed to call Gemini API:', error);
        throw error;
      }
    }
  }

  throw lastError || new Error('Failed to get a response from the AI after multiple attempts.');
}

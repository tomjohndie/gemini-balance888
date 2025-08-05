async function verifyKey(key, controller) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const body = {
    "contents": [{
      "role": "user",
      "parts": [{
        "text": "Hello"
      }]
    }]
  };
  let result;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': key,
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      await response.text(); // Consume body to release connection
      result = { key: `${key.slice(0, 7)}......${key.slice(-7)}`, status: 'GOOD' };
    } else {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      result = { key: `${key.slice(0, 7)}......${key.slice(-7)}`, status: 'BAD', error: errorData.error.message };
    }
  } catch (e) {
    result = { key: `${key.slice(0, 7)}......${key.slice(-7)}`, status: 'ERROR', error: e.message };
  }
  controller.enqueue(new TextEncoder().encode('data: ' + JSON.stringify(result) + '\n\n'));
}

export async function handleVerification(request) {
  try {
    const authHeader = request.headers.get('x-goog-api-key');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing x-goog-api-key header.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const keys = authHeader.split(',').map(k => k.trim()).filter(Boolean);

    const stream = new ReadableStream({
      async start(controller) {
        const verificationPromises = keys.map(key => verifyKey(key, controller));
        await Promise.all(verificationPromises);
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'An unexpected error occurred: ' + e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

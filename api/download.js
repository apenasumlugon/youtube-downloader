// Vercel Serverless Function — Proxy para Cobalt API
// Evita problemas de CORS fazendo a requisição server-to-server

const API_INSTANCES = [
    'https://cobalt-api.meowing.de',
    'https://cobalt-backend.canine.tools',
    'https://capi.3kh0.net',
];

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;

    if (!body || !body.url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    let lastError = null;

    for (let i = 0; i < API_INSTANCES.length; i++) {
        const apiUrl = API_INSTANCES[i];

        try {
            console.log(`[Attempt ${i + 1}] Trying ${apiUrl}...`);

            const response = await fetch(apiUrl + '/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15000), // 15s timeout
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`[Success] Got response from ${apiUrl}`);
                return res.status(200).json(data);
            }

            // If 400, the request format might be wrong for this instance
            // Log and try next
            console.log(`[${response.status}] ${apiUrl} responded:`, JSON.stringify(data));
            lastError = { status: response.status, data, instance: apiUrl };

            // If it's a known Cobalt error (not a format issue), return it
            if (data.status === 'error' && data.error) {
                return res.status(200).json(data);
            }

        } catch (err) {
            console.error(`[Error] ${apiUrl}: ${err.message}`);
            lastError = { status: 500, message: err.message, instance: apiUrl };
        }
    }

    // All instances failed
    return res.status(502).json({
        status: 'error',
        error: {
            code: 'error.api.all_instances_failed',
        },
        details: lastError,
    });
}

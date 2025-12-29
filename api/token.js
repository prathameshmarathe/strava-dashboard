export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, refresh_token, grant_type } = req.body;

    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
        const payload = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type
        };

        if (grant_type === 'authorization_code') {
            payload.code = code;
        } else if (grant_type === 'refresh_token') {
            payload.refresh_token = refresh_token;
        }

        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.body?.url || req.query?.url;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // 1. TikTok Fast Engine
        if (url.includes('tiktok.com')) {
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.code === 0 && data.data) {
                return res.status(200).json({ url: data.data.play });
            }
        }

        // 2. Facebook / Instagram / YouTube Engine (Cobalt)
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (data.url) {
            return res.status(200).json({ url: data.url });
        } else if (data.picker && data.picker.length > 0) {
            return res.status(200).json({ url: data.picker[0].url });
        } else {
            return res.status(400).json({ error: 'Unable to fetch video' });
        }

    } catch (error) {
        return res.status(500).json({ error: 'Server connection error' });
    }
                                            }
        

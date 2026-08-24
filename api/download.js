export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.body?.url || req.query?.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Direct TikTok Downloader (No Watermark)
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.code === 0 && data.data) {
            return res.status(200).json({ url: data.data.play });
        } else {
            return res.status(400).json({ error: 'Unable to fetch TikTok video.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server connection error.' });
    }
                                         }


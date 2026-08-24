export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action, streamUrl, title } = req.query;

    // Direct Gallery File Download Stream
    if (action === 'file' && streamUrl) {
        try {
            const videoRes = await fetch(decodeURIComponent(streamUrl));
            const contentType = videoRes.headers.get('content-type') || 'video/mp4';
            const fileName = title ? `${encodeURIComponent(title)}.mp4` : 'video.mp4';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            const arrayBuffer = await videoRes.arrayBuffer();
            return res.status(200).send(Buffer.from(arrayBuffer));
        } catch (e) {
            return res.redirect(decodeURIComponent(streamUrl));
        }
    }

    const url = req.body?.url || req.query?.url;
    if (!url) return res.status(400).json({ error: 'URL required' });

    try {
        // TikTok Full Data Engine (Video + Audio + HD)
        if (url.includes('tiktok.com')) {
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.code === 0 && data.data) {
                return res.status(200).json({
                    title: data.data.title || 'TikTok Video',
                    cover: data.data.cover,
                    hd_url: data.data.hdplay || data.data.play,
                    sd_url: data.data.play,
                    audio_url: data.data.music
                });
            }
        }

        // Multi-Platform Engine (FB, Insta, YT)
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        const mainUrl = data.url || (data.picker && data.picker[0]?.url);

        if (mainUrl) {
            return res.status(200).json({
                title: 'Social Video',
                cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
                hd_url: mainUrl,
                sd_url: mainUrl,
                audio_url: null
            });
        }

        return res.status(400).json({ error: 'Unable to fetch video' });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
                }
                

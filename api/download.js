export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'RAPIDAPI_KEY configuration missing' });
    }

    try {
        const response = await fetch(`https://social-media-video-downloader.p.rapidapi.com/smvd/get-media?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
            }
        });

        const data = await response.json();

        if (response.ok && data) {
            // SSSTik style response extraction
            const videoLink = data.download_url || data.url || (data.links && data.links[0]?.link);
            const audioLink = data.audio || (data.links && data.links.find(l => l.type === 'audio')?.link) || videoLink;
            
            return res.status(200).json({
                downloadUrl: videoLink,
                audioUrl: audioLink,
                author: data.author || data.username || '@tiktok_user',
                title: data.title || 'TikTok Video',
                cover: data.cover || data.thumbnail || ''
            });
        }

        return res.status(400).json({ error: data.message || 'Unable to fetch video. Check link.' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error processing request' });
    }
}
  

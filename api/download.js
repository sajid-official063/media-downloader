export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  try {
    const inputUrl = url.toLowerCase();

    // 1. TikTok Downloader Engine
    if (inputUrl.includes('tiktok.com') || inputUrl.includes('vt.tiktok.com')) {
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data && data.data) {
        return res.status(200).json({
          downloadUrl: data.data.play,
          audioUrl: data.data.music,
          author: data.data.author.nickname || '@tiktok_user',
          title: data.data.title || 'TikTok Video',
          cover: data.data.cover
        });
      }
    }

    // 2. Facebook, Instagram & YouTube All-in-One Engine (via RapidAPI)
    if (apiKey) {
      // General RapidAPI Media Fetcher
      const apiUrl = `https://social-media-video-downloader.p.rapidapi.com/smvd/get-media?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
        }
      });

      const data = await response.json();

      if (response.ok && data) {
        const videoLink = data.downloadUrl || data.url || (data.links && data.links[0]?.link) || data.video;
        const audioLink = data.audio || (data.links && data.links.find(l => l.type === 'audio')?.link) || videoLink;

        return res.status(200).json({
          downloadUrl: videoLink,
          audioUrl: audioLink,
          author: data.author || data.username || 'Media Owner',
          title: data.title || 'Social Media Video',
          cover: data.cover || data.thumbnail || ''
        });
      }
    }

    // 3. Fallback / Direct Link Parsing
    return res.status(400).json({ error: 'Please check the link or try another social media video URL.' });

  } catch (err) {
    return res.status(500).json({ error: 'Server error processing video link' });
  }
}

                                                                     

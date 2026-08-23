export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const apiKey = process.env.RAPIDAPI_KEY;

  try {
    // TikWM free API for TikTok
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

    return res.status(400).json({ error: 'Video not found or link invalid' });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' });
  }
}

                                                                     

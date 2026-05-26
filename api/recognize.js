export const config = { runtime: 'edge' };

async function searchYouTube(query, apiKey) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: video.id.videoId,
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`
      };
    }
  } catch(e) {}
  return null;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file');

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auddForm = new FormData();
    auddForm.append('file', audioFile, 'audio.wav');
    auddForm.append('api_token', process.env.AUDD_API_KEY);
    auddForm.append('return', 'apple_music,spotify');

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: auddForm,
    });

    const data = await response.json();

    // If AudD found the song, also search YouTube for direct link
    if (data.status === 'success' && data.result) {
      const query = `${data.result.title} ${data.result.artist}`;
      const ytResult = await searchYouTube(query, process.env.YOUTUBE_API_KEY);
      if (ytResult) {
        data.result.youtube_direct = ytResult.url;
      }
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

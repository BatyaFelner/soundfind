export const config = { runtime: 'edge' };

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

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch('https://shazam.p.rapidapi.com/songs/v2/detect?timezone=Asia%2FJerusalem&locale=he-IL', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'x-rapidapi-host': 'shazam.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      },
      body: base64Audio,
    });

    const data = await response.json();

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

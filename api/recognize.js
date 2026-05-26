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

    const auddForm = new FormData();
    auddForm.append('file', audioFile, 'audio.wav');
    auddForm.append('api_token', process.env.AUDD_API_KEY);
    auddForm.append('return', 'apple_music,spotify');

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: auddForm,
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

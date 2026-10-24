// Metadata endpoint. Uses YouTube's public oEmbed endpoint for title/thumbnail.
// This intentionally does not bypass sign-in, age gates, DRM, or other access controls.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).json({error:'Invalid URL.'}); }
  const allowed = ['youtube.com','www.youtube.com','m.youtube.com','youtu.be'];
  if (!allowed.includes(parsed.hostname)) return res.status(400).json({error:'Only YouTube URLs are supported.'});
  const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || parsed.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1];
  if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return res.status(400).json({error:'Could not find a video ID.'});
  try {
    const o = await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id));
    if (!o.ok) return res.status(422).json({error:'YouTube did not return public video details. The video may be private or unavailable.'});
    const d = await o.json();
    return res.status(200).json({title:d.title,author:d.author_name,thumbnail:d.thumbnail_url,duration:'',formats:[]});
  } catch { return res.status(502).json({error:'Could not contact YouTube right now.'}); }
}

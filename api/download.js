// Safe placeholder: YouTube does not provide a general public download API.
// Replace this endpoint only with a lawful source for videos you own or have permission to download.
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(501).json({
    error: 'Direct downloads are not configured. Use YouTube’s official download options where available, or connect a source/API that authorizes downloading this video.'
  });
}

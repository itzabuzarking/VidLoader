# VidLoader

A login-free, responsive video-link UI inspired by the ThumbLoader style: red/white branding, black/red dark mode, rounded cards, subtle motion, mobile layout, Features and About sections.

## Deploy on Vercel
1. Upload this folder to a new GitHub repository.
2. Import the repository in Vercel.
3. Deploy with the default settings.
4. No Google OAuth or environment variables are needed.

## Important functionality note
- `api/video-info.js` uses YouTube's public oEmbed endpoint to retrieve public title/thumbnail information.
- `api/download.js` intentionally returns HTTP 501. YouTube does not offer a general public API for downloading arbitrary videos. Do not bypass access controls or download content without permission. For actual downloads, connect a lawful source/API for videos you own or are authorized to save, or use YouTube's official download options where available.
- The UI is ready to display download formats once an authorized backend returns them.

## Files
- `index.html` — responsive UI and theme toggle
- `api/video-info.js` — public metadata endpoint
- `api/download.js` — safe placeholder endpoint
- `vercel.json` — Vercel configuration

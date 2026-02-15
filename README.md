# e-bat (demo)

This is a minimal React demo app (Vite) that displays a simple question to the user.

To run locally:

```powershell
cd C:\dev\e-bat
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Enable collecting answers
------------------------

This demo app can optionally send answers to a Formspree endpoint so visitors' responses are recorded. Steps:

1. Create a free form at https://formspree.io/ and get the form endpoint (it looks like `https://formspree.io/f/XXXXXXXX`).
2. Edit `src/config.js` and set `SUBMIT_URL` to that endpoint.
3. Commit and push to `main`. GitHub Actions will rebuild and publish the site automatically.

If you don't configure a `SUBMIT_URL`, submissions are simulated locally and will not be stored.

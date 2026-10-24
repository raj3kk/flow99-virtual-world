# Free Hosting Steps (no live URL claimed yet)

This project is static files only: `index.html`, `css/`, `js/`.
Any static host works. Rendering still happens on the visitor's device.

## Option A — GitHub Pages (recommended, free)

1. Create a new public GitHub repo (user's own GitHub sign-in is needed for
   this step — the agent cannot sign in as the user).
2. Upload the whole `virtual-world-external/` folder contents to the repo root.
3. In repo Settings → Pages → Build and deployment → Source: Deploy from a branch,
   Branch: main, Folder: / (root). Save.
4. Wait for Pages to publish, then open the `https://<username>.github.io/<repo>/`
   URL it shows. That URL is the only live URL to share — do not invent one
   before Pages shows it.
5. Test on phone: gate, avatar, movement, swimming, flying, NPC proximity, lag.

## Option B — Vercel (free hobby, static)

1. Import the same repo/folder into Vercel (user's own Vercel sign-in needed).
2. Framework: Other / static, no build command, output: root.
3. Deploy, then test the Vercel URL it shows.

## Option C — PlayCanvas hosting (editor route, optional)

Only if the user later wants the PlayCanvas Editor workflow: create a free
PlayCanvas account, create a public project, import assets, publish.
This is NOT needed for the current runtime build, and no account is
requested in this build.

## Still needed from the user (blocker for live hosting only, not for local test)

- A GitHub repo (or Vercel project) created under the user's own account,
  OR permission + repo name for the agent to create it via the connected
  GitHub connector. Local test (`python3 -m http.server`) needs nothing.

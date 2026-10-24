# Virtual World 3D — Flow99 (Standalone, External)

**NOT a Muse artifact. NOT connected to live Flow99.** This is a standalone demo
project in `~/workspace/virtual-world-external/`. No backend, no database,
no payment, no OTP, no real WhatsApp connection. WhatsApp demo is simulation only.
Gate mobile number is format-checked only — never sent, never stored.

## Stack choice — why PlayCanvas Engine runtime

- PlayCanvas Engine is MIT, free, WebGL/WebGPU, mobile-first, tiny runtime.
  Editor is NOT used here, so no PlayCanvas account is needed to run this code.
  The engine is loaded from its public CDN in `index.html`.
- Fallback considered: optimized Three.js. Not used as primary because the
  parent task approved PlayCanvas external route first. If the PlayCanvas CDN
  is blocked in a given network, the page shows a clear load error instead of
  silently failing, and the same scene logic can be ported to Three.js
  (same CONFIG, same performance budget) — that port is not done in this build.

## Style — Free Fire style, not cartoon/Minecraft

- Characters use procedural canvas textures (cloth weave, metal gradient,
  skin shading) with PBR-style `StandardMaterial`, not flat colour.
- Proportions: body + head + antenna for robots, body + head for visitor —
  not blocky cube characters. Real CC0 packs (KayKit / Quaternius characters,
  Poly Haven PBR textures / HDRIs) can replace the procedural textures with
  the same material slots; see `js/textures.js` header. In this build the
  textures are procedural so the project runs with zero downloads and zero
  licensing risk. That is a deliberate trade-off, documented here, not hidden.

## Performance budget (enforced in code)

- Character primitives are <1,000 polygons each, far below the 10k cap.
- Textures: 128px for characters, 256px for world surfaces, max 512px.
- `maxPixelRatio = 2` always (`js/app.js`).
- Dynamic lights: 1 sun + 1 point lamp only (ambient/fog are not lights).
  Night lamps are emissive spheres, not extra lights.
- Repeated objects use shared materials; Low quality hides fireflies, rain,
  animals and agent limbs, and disables sun shadows (High only).
- Target: <100 draw calls/frame on Low/Medium. On High with all agents,
  fireflies and rain visible, the count can exceed 100 — Auto quality drops
  to Low if FPS falls below 30, so movement never stutters for graphics.
- No server-side rendering exists for free: rendering runs on the visitor's
  own phone GPU. Hosting only delivers static files fast via CDN.

## What is in the world

Gate (10-digit format + `flow99`, mic at gate, fireworks, entry greeting),
avatar creator, 7 zones, house interiors (visitor house building + Castle
secret room logic via quest), river + bridge + boat + fishing demo, swimming
+ dive, jet flying, sit, jump, 3 cameras, WASD/drag/joystick/tap-to-move,
teleport + full map, minimap + compass (minimap canvas), world clock +
NPC schedule (emotion by hour/weather), weather + day-night + rain/fog +
night lights + fireflies, 21 robot agents (13 workers + 8 guards, no human
NPCs), automated workers, proximity voice without click (mic deny = text),
per-agent pitch/rate, robotic robot voice, quests + side + daily quests,
badges only (NO collectable currency system anywhere in game code),
inventory bag (badges + quests), wardrobe colour select, photo mode +
robot selfie, visitor feedback (localStorage only), stuck recovery + Home,
subtitles, sound sliders (voice/music/SFX separate), procedural sounds,
progress only in localStorage, content via `js/config.js` CONFIG object,
rogue AI event (scripted, non-violent containment, no gore, no hacking
instructions, no human harm).

## How to run locally

```bash
cd ~/workspace/virtual-world-external
python3 -m http.server 8000
# open http://localhost:8000/ in Chrome on phone or laptop
```

Use a static server, not `file://` — engine CDN + modules need http(s).

## What is NOT yet visually verified (honest limits)

- 3D render, movement, swimming, flying, NPC proximity, lag on a real phone:
  NOT verified in this VM (no live browser here, no phone GPU here).
  Syntax checks pass (see below), gate/avatar/UI logic is DOM code, but
  the user MUST test on their own phone/laptop and report lag or glitches.
- Tap-to-move in `js/ui.js` is a documented simplification: tap moves the
  player forward; precise engine raycast tap-to-target is not implemented.
  It is not claimed as full raycast in the UI.
- House interiors: visitor house is a building in-world; interior rooms are
  not a separate detailed interior scene in this build — Home button teleports
  to the house area. A full furnished interior is future work, not claimed.
- Voice: browser `speechSynthesis` only. No ElevenLabs, no Edge TTS server,
  no API key in the page (by design, a public page must not hold a key).
- Realism: this is still real-time WebGL, not photo-real or native Free Fire.
  Physics (gravity, collision, buoyancy, bridge height, jet) are implemented
  and must be judged on the phone test — if any physics feels wrong, it is
  a bug to fix, not a claim of perfection.

## Tests run here

- `node --check` on every JS file (see final report for list).
- No passwords/secrets in any file. No live URL claimed.

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
  Worker-3 visual pass: visitor cloth now has woven warp/weft threads +
  stitch seams, robot metal has brushed lines + diagonal gloss streak +
  panel seams/rivets, visitor skin has lit-top/shaded-jaw gradient + cheek
  warmth + pore noise, and a new `glass` draw (visor/panel streaks) was
  added in `js/textures.js` for future use. All texture sizes stay
  128–256px (max 512px), and no material slot or function signature in
  `js/app.js` was changed. Textures are PROCEDURAL ONLY in this build —
  no CC0 pack was downloaded in this pass, so no downloaded CC0
  models/textures are claimed here; a real CC0 pack could still replace
  these procedural draws later under the same material names.
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
avatar creator, 7 zones, furnished visitor-house interior (Home enters it,
Exit button or north door gap leaves it; Castle secret room logic via quest),
river + bridge + boat + fishing demo, swimming
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
- Tap-to-move (fixed 2026-10-25, Worker 2): `js/ui.js` now does a real
  ground-plane raycast — a ray from the camera through the tapped screen
  point (camera world matrix + FOV/aspect) intersected with the y=0 ground
  plane, clamped to world bounds (-58..58), then `js/app.js` `findPath`
  (grid BFS, 2m cells) routes around buildings instead of walking through
  walls; keyboard/joystick input cancels the path, and a blocked step slides
  or stops the player (never through a wall). Honest limit: this is NOT
  mesh hit-testing — it does not test occlusion by buildings, so a tap on a
  roof/wall resolves to the ground point under that screen position, and
  the path then routes around the obstacle. A tap above the horizon does
  nothing. Node-harness verified: centre tap lands at the hand-computed
  ground point, and paths detour around a test wall with no blocked waypoint.
- House interior (fixed 2026-10-25, Worker 2): the Home button now ENTERS
  the furnished visitor-house interior (`buildHouseInterior` in `js/app.js`,
  inside the existing house footprint x -11.5..-4.5, z 25..31): living room
  (sofa, coffee table, armchair, lamp, bookcase), bedroom (bed + pillow,
  bedside table, wardrobe), work corner (desk, chair, wall shelf), with a
  partition wall and doorway between living room and the south rooms.
  Entering hides the solid exterior box so the camera can see the rooms;
  exiting restores it. Exit via the "Ghar se Bahar (Exit)" HUD button
  (created by `js/ui.js`, visible only inside) or by walking north through
  the door gap in the north wall. Inside, only interior walls/furniture
  collide; outside, the building list collides as before. Interior props
  are low-poly boxes/spheres with shared <=256px procedural textures and
  no new lights, and the interior group is disabled while outside, so it
  adds no draw calls to the outside world.
- Voice: browser `speechSynthesis` only. No ElevenLabs, no Edge TTS server,
  no API key in the page (by design, a public page must not hold a key).
- Realism: this is still real-time WebGL, not photo-real or native Free Fire.
  Physics (gravity, collision, buoyancy, bridge height, jet) are implemented
  and must be judged on the phone test — if any physics feels wrong, it is
  a bug to fix, not a claim of perfection.

## Tests run here

- `node --check` on every JS file (see final report for list).
- No passwords/secrets in any file. No live URL claimed.

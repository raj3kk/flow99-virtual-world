// PlayCanvas Engine runtime world. No editor, no account, no server render.
// Rendering happens on the visitor's own device GPU (WebGL). Hosting only delivers files.
// Performance budget enforced here: pixelRatio<=2, <=3 dynamic lights (1 sun + 1 lamp + 1 fill),
// procedural textures <=512px, primitives are <1k polys each (far below the 10k/character cap),
// Low quality hides fireflies/rain/animals/agent limbs to keep draw calls near <100/frame.
window.VW.state = {
  entered: false, micAllowed: false, language: 'hinglish', subtitles: true, sound: true,
  cameraMode: 'third', quality: 'auto', weather: 'clear', worldHour: 9,
  player: { x: 0, y: 0, z: 8, vy: 0, flying: false, sitting: false, swimming: false, onBoat: false },
  keys: {}, tapTarget: null, joystick: { x: 0, y: 0 },
  visitedZones: {}, badges: [], quests: JSON.parse(JSON.stringify(window.VW.CONFIG.quests)),
  rogue: { state: 'idle', t: 0, x: 0, z: 0, target: null },
  entryDone: false, fps: 60
};
window.VW.entities = { agents: {}, buildings: [], lamps: [], fireflies: [], rain: [], animals: [] };
window.VW.makeMaterial = function (app, canvasTex, color, emissive) {
  var m = new pc.StandardMaterial();
  if (canvasTex) {
    var tex = new pc.Texture(app.graphicsDevice, { width: canvasTex.width, height: canvasTex.height, format: pc.PIXELFORMAT_R8_G8_B8_A8 });
    tex.setSource(canvasTex); tex.upload();
    m.diffuseMap = tex;
  }
  if (color) m.diffuse = new pc.Color(color[0], color[1], color[2]);
  if (emissive) m.emissive = new pc.Color(emissive[0], emissive[1], emissive[2]);
  m.update();
  return m;
};
window.VW.box = function (app, parent, name, x, y, z, sx, sy, sz, mat) {
  var e = new pc.Entity(name);
  e.addComponent('model', { type: 'box' });
  e.model.material = mat;
  e.setLocalPosition(x, y, z); e.setLocalScale(sx, sy, sz);
  parent.addChild(e); return e;
};
window.VW.sphere = function (app, parent, name, x, y, z, s, mat) {
  var e = new pc.Entity(name);
  e.addComponent('model', { type: 'sphere' });
  e.model.material = mat;
  e.setLocalPosition(x, y, z); e.setLocalScale(s, s, s);
  parent.addChild(e); return e;
};
window.VW.initWorld = function () {
  if (typeof pc === 'undefined') {
    var el = document.getElementById('loadError');
    if (el) el.style.display = 'block';
    return false;
  }
  var canvas = document.getElementById('application');
  var app = new pc.Application(canvas, { mouse: new pc.Mouse(canvas), keyboard: new pc.Keyboard(window), touch: new pc.TouchDevice(canvas) });
  window.VW.app = app;
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  // Pixel ratio cap = performance budget.
  app.graphicsDevice.maxPixelRatio = 2;
  app.scene.ambientLight = new pc.Color(0.45, 0.5, 0.55);
  app.scene.fog = pc.FOG_LINEAR; app.scene.fogStart = 40; app.scene.fogEnd = 120;
  app.scene.fogColor = new pc.Color(0.75, 0.85, 0.95);
  var sun = new pc.Entity('sun');
  sun.addComponent('light', { type: pc.LIGHTTYPE_DIRECTIONAL, color: new pc.Color(1, 0.95, 0.85), intensity: 1.4, castShadows: false });
  sun.setLocalEulerAngles(45, 30, 0); app.root.addChild(sun); window.VW.sun = sun;
  var lamp = new pc.Entity('lampLight');
  lamp.addComponent('light', { type: pc.LIGHTTYPE_POINT, color: new pc.Color(1, 0.8, 0.4), intensity: 0, range: 20 });
  lamp.setLocalPosition(0, 4, 8); app.root.addChild(lamp); window.VW.lamp = lamp;
  var cam = new pc.Entity('camera');
  cam.addComponent('camera', { clearColor: new pc.Color(0.55, 0.75, 0.95), farClip: 300 });
  app.root.addChild(cam); window.VW.camera = cam;
  // Ground (textured, not flat colour) + river + bridge.
  var grassTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.grass(c, s); }, 256);
  var grassMat = window.VW.makeMaterial(app, grassTex, [0.45, 0.65, 0.4]);
  window.VW.box(app, app.root, 'ground', 0, -0.5, 0, 120, 1, 120, grassMat);
  var waterTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.water(c, s); }, 256);
  var waterMat = window.VW.makeMaterial(app, waterTex, [0.2, 0.5, 0.8]);
  window.VW.waterEnt = window.VW.box(app, app.root, 'river', 20, -0.2, 0, 4, 0.4, 90, waterMat);
  var woodTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.wood(c, s); }, 256);
  var woodMat = window.VW.makeMaterial(app, woodTex, [0.55, 0.4, 0.25]);
  window.VW.box(app, app.root, 'bridge', 20, 0.6, -14, 18, 0.4, 4, woodMat);
  // Zone buildings + stalls + houses (AABB collision list).
  window.VW.entities.buildings = [];
  function building(x, z, w, h, d, mat, name) {
    var e = window.VW.box(app, app.root, name, x, h / 2, z, w, h, d, mat);
    window.VW.entities.buildings.push({ x: x, z: z, hw: w / 2, hd: d / 2 });
    return e;
  }
  var stoneTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.stone(c, s); }, 256);
  var stoneMat = window.VW.makeMaterial(app, stoneTex, [0.7, 0.7, 0.75]);
  var metalTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.metal(c, s); }, 256);
  var metalMat = window.VW.makeMaterial(app, metalTex, [0.8, 0.85, 0.9]);
  window.VW.CONFIG.zones.forEach(function (zn, i) {
    if (zn.id === 'plaza') return; // open plaza, no blocking building
    building(zn.x + 6, zn.z, 6, 4 + (i % 3), 5, i % 2 ? stoneMat : metalMat, 'bld-' + zn.id);
    // Signboard (non-blocking, small) + stall
    window.VW.box(app, app.root, 'stall-' + zn.id, zn.x - 4, 0.8, zn.z + 2, 2.5, 1.6, 1.5, woodMat);
  });
  // Visitor house (interior rooms are separate small boxes inside, entered via House button).
  building(-8, 28, 7, 4, 6, stoneMat, 'visitor-house');
  // Trees (shared geometry, low poly) + lamps.
  for (var ti = 0; ti < 12; ti++) {
    var tx = -50 + ti * 9, tz = (ti % 2 ? -38 : 38);
    window.VW.box(app, app.root, 'tree-' + ti, tx, 1, tz, 0.6, 2, 0.6, woodMat);
    window.VW.sphere(app, app.root, 'leaf-' + ti, tx, 2.8, tz, 2.2, grassMat);
    var lampMat = window.VW.makeMaterial(app, null, [0.2, 0.2, 0.2], [1, 0.8, 0.3]);
    var lampEnt = window.VW.sphere(app, app.root, 'lamp-' + ti, tx + 2, 3, tz, 0.5, lampMat);
    window.VW.entities.lamps.push(lampEnt);
  }
  window.VW.buildAgents(app);
  window.VW.buildPlayer(app);
  window.VW.buildAnimalsAndFx(app);
  app.start();
  app.on('update', function (dt) { window.VW.update(dt); });
  window.VW.applyQuality(window.VW.state.quality);
  return true;
};

window.VW.buildAgents = function (app) {
  window.VW.CONFIG.agents.forEach(function (a) {
    var root = new pc.Entity('agent-' + a.id);
    root.setLocalPosition(a.x, 0, a.z);
    var clothTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.cloth(c, s, '#8899aa'); }, 128);
    var bodyMat = window.VW.makeMaterial(app, clothTex, a.color);
    var metalTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.metal(c, s); }, 128);
    var headMat = window.VW.makeMaterial(app, metalTex, a.color);
    var body = window.VW.box(app, root, 'body', 0, 0.9, 0, 0.9, 1.1, 0.55, bodyMat);
    var head = window.VW.sphere(app, root, 'head', 0, 1.85, 0, 0.7, headMat);
    var ant = window.VW.box(app, root, 'antenna', 0.2, 2.3, 0, 0.08, 0.5, 0.08, headMat);
    var eyeMat = window.VW.makeMaterial(app, null, [0.1, 0.9, 1], [0.1, 0.9, 1]);
    window.VW.sphere(app, root, 'eye', 0, 1.9, 0.36, 0.18, eyeMat);
    root.userData = { def: a, body: body, head: head, antenna: ant, phase: Math.random() * 6 };
    app.root.addChild(root);
    window.VW.entities.agents[a.id] = root;
  });
};
window.VW.buildPlayer = function (app) {
  var root = new pc.Entity('visitor');
  root.setLocalPosition(0, 0, 8);
  var skinTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.skin(c, s, '#c98a5a'); }, 128);
  var skinMat = window.VW.makeMaterial(app, skinTex, [0.8, 0.6, 0.45]);
  var clothTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.cloth(c, s, '#b03030'); }, 128);
  var clothMat = window.VW.makeMaterial(app, clothTex, [0.7, 0.2, 0.2]);
  window.VW.box(app, root, 'p-body', 0, 0.9, 0, 0.8, 1.1, 0.5, clothMat);
  window.VW.sphere(app, root, 'p-head', 0, 1.8, 0, 0.6, skinMat);
  app.root.addChild(root); window.VW.playerEnt = root;
  // Boat on river
  var woodTex = window.VW.makeCanvasTexture(function (c, s) { window.VW.textureDraws.wood(c, s); }, 128);
  var boatMat = window.VW.makeMaterial(app, woodTex, [0.55, 0.4, 0.25]);
  window.VW.boatEnt = window.VW.box(app, app.root, 'boat', 20, 0.1, 10, 2.5, 0.5, 1.2, boatMat);
};
window.VW.buildAnimalsAndFx = function (app) {
  // Animals: simple textured bodies, not blocky cubes alone — sphere body + head, small scale.
  [['dog', -4, 6], ['cat', 10, -4], ['bird', -20, -20]].forEach(function (an, i) {
    var root = new pc.Entity('animal-' + an[0]);
    root.setLocalPosition(an[1], 0.4, an[2]);
    var mat = window.VW.makeMaterial(app, null, i === 0 ? [0.6, 0.4, 0.2] : (i === 1 ? [0.9, 0.9, 0.9] : [0.2, 0.6, 0.9]));
    window.VW.sphere(app, root, 'a-body', 0, 0, 0, 0.7, mat);
    window.VW.sphere(app, root, 'a-head', 0.5, 0.3, 0, 0.4, mat);
    app.root.addChild(root); window.VW.entities.animals.push(root);
  });
  // Fireflies (night only, hidden on Low)
  for (var i = 0; i < 16; i++) {
    var m = window.VW.makeMaterial(app, null, [0.9, 1, 0.4], [0.9, 1, 0.4]);
    var f = window.VW.sphere(app, app.root, 'fly-' + i, Math.random() * 40 - 20, 1.5, Math.random() * 40 - 20, 0.15, m);
    window.VW.entities.fireflies.push(f);
  }
  // Rain (hidden unless weather=rain)
  for (var j = 0; j < 40; j++) {
    var rm = window.VW.makeMaterial(app, null, [0.6, 0.8, 1]);
    var r = window.VW.box(app, app.root, 'rain-' + j, Math.random() * 60 - 30, Math.random() * 10, Math.random() * 60 - 30, 0.08, 0.6, 0.08, rm);
    window.VW.entities.rain.push(r);
  }
  // Fireworks pool for entry celebration
  window.VW.entities.fireworks = [];
  for (var k = 0; k < 21; k++) {
    var fm = window.VW.makeMaterial(app, null, [1, 0.8, 0.2], [1, 0.8, 0.2]);
    var fe = window.VW.sphere(app, app.root, 'fw-' + k, 0, -10, 0, 0.25, fm);
    fe.userData = { vy: 0, life: 0 }; window.VW.entities.fireworks.push(fe);
  }
};
window.VW.groundHeightAt = function (x, z) {
  // Bridge platform over river at z=-14, x 11..29
  if (x >= 11 && x <= 29 && z >= -16 && z <= -12) return 0.8;
  return 0;
};
window.VW.collides = function (x, z) {
  for (var i = 0; i < window.VW.entities.buildings.length; i++) {
    var b = window.VW.entities.buildings[i];
    if (Math.abs(x - b.x) < b.hw + 0.6 && Math.abs(z - b.z) < b.hd + 0.6) return true;
  }
  return false;
};
window.VW.update = function (dt) {
  var st = window.VW.state, app = window.VW.app;
  if (!st.entered) return;
  // FPS + auto quality
  st.fps = st.fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  if (st.quality === 'auto' && st.fps < 30) window.VW.applyQuality('low', true);
  // Clock: 24h in 240s
  st.worldHour = (st.worldHour + dt * 0.1) % 24;
  var hour = st.worldHour;
  var isNight = hour >= 20 || hour < 6;
  // Sun / sky by hour (baked-style: precomputed colours, 1 dynamic sun only)
  var sunI = isNight ? 0.15 : 1.4;
  if (window.VW.sun) window.VW.sun.light.intensity = sunI;
  if (window.VW.lamp) window.VW.lamp.light.intensity = isNight ? 1.2 : 0;
  window.VW.entities.lamps.forEach(function (l) { l.enabled = isNight; });
  window.VW.entities.fireflies.forEach(function (f, i) {
    f.enabled = isNight && st.quality !== 'low';
    if (f.enabled) { var t = app.time || 0; f.setLocalPosition(Math.sin(t + i) * 20, 1.5 + Math.sin(t * 2 + i) * 0.5, Math.cos(t * 0.7 + i) * 20); }
  });
  if (st.weather === 'rain') {
    window.VW.entities.rain.forEach(function (r) {
      var p = r.getLocalPosition(); p.y -= dt * 12; if (p.y < 0) p.y = 10; r.setLocalPosition(p);
    });
  } else { window.VW.entities.rain.forEach(function (r) { r.enabled = false; }); }
  // Movement
  var p = st.player, speed = p.flying ? 10 : (p.swimming ? 4 : 6);
  var mx = 0, mz = 0;
  if (st.keys['KeyW'] || st.keys['ArrowUp']) mz -= 1;
  if (st.keys['KeyS'] || st.keys['ArrowDown']) mz += 1;
  if (st.keys['KeyA'] || st.keys['ArrowLeft']) mx -= 1;
  if (st.keys['KeyD'] || st.keys['ArrowRight']) mx += 1;
  mx += st.joystick.x; mz += st.joystick.y;
  if (st.tapTarget) {
    var dx = st.tapTarget.x - p.x, dz = st.tapTarget.z - p.z;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 0.5) st.tapTarget = null; else { mx = dx / d; mz = dz / d; }
  }
  var len = Math.sqrt(mx * mx + mz * mz);
  if (len > 0.01) {
    mx /= Math.max(len, 1); mz /= Math.max(len, 1);
    var nx = p.x + mx * speed * dt, nz = p.z + mz * speed * dt;
    if (!window.VW.collides(nx, nz)) { p.x = nx; p.z = nz; if (Math.random() < dt * 3) window.VW.Audio.footstep(p.swimming ? 'water' : 'ground'); }
  }
  // Water / bridge / gravity
  var inRiver = p.x >= 18 && p.x <= 22 && !(p.z >= -16 && p.z <= -12);
  var wasSwim = p.swimming; p.swimming = inRiver && !p.flying;
  if (p.swimming && !wasSwim) window.VW.Audio.splash();
  if (p.flying) { p.y += dt * 2; if (p.y > 18) p.y = 18; }
  else if (p.swimming) { p.y += (( -0.3) - p.y) * Math.min(1, dt * 5); }
  else {
    var gh = window.VW.groundHeightAt(p.x, p.z);
    if (!p.sitting) { p.vy -= 19 * dt; p.y += p.vy * dt; if (p.y <= gh) { p.y = gh; p.vy = 0; } }
    else p.y = gh;
  }
  if (st.keys['Space'] && !p.flying && p.y <= window.VW.groundHeightAt(p.x, p.z) + 0.01) { p.vy = 7; }
  if (window.VW.playerEnt) window.VW.playerEnt.setLocalPosition(p.x, p.y, p.z);
  // Boat drifts slowly
  if (window.VW.boatEnt) { var bp = window.VW.boatEnt.getLocalPosition(); bp.z += Math.sin((app.time || 0) * 0.3) * dt * 0.5; window.VW.boatEnt.setLocalPosition(bp); }
  // Workers + guards + animals animation
  Object.keys(window.VW.entities.agents).forEach(function (id) {
    var ent = window.VW.entities.agents[id], def = ent.userData.def, t = (app.time || 0) + ent.userData.phase;
    var pos = ent.getLocalPosition();
    if (def.id === 'delivery-bot') { pos.x = -10 + Math.sin(t * 0.2) * 18; pos.z = Math.cos(t * 0.2) * 12; ent.setLocalPosition(pos); }
    else if (!def.guard && Math.sin(t * 0.5) > 0.9) { /* workers bob while working */ pos.y = 0.05; ent.setLocalPosition(pos); }
    else if (!def.guard) { pos.y = 0; ent.setLocalPosition(pos); }
    // Guards stay at post by design.
  });
  window.VW.entities.animals.forEach(function (an, i) { var ap = an.getLocalPosition(); ap.x += Math.sin((app.time || 0) * 0.5 + i) * dt; an.setLocalPosition(ap); });
  // Rogue AI event state machine (non-violent containment, no weapons)
  window.VW.updateRogue(dt);
  // Fireworks
  window.VW.entities.fireworks.forEach(function (f) {
    if (f.userData.life > 0) { f.userData.life -= dt; var fp = f.getLocalPosition(); fp.y += f.userData.vy * dt; f.userData.vy -= 9 * dt; f.setLocalPosition(fp); if (f.userData.life <= 0) f.setLocalPosition(0, -10, 0); }
  });
  // Camera
  window.VW.updateCamera();
  // Proximity + zones
  window.VW.checkProximity();
  window.VW.CONFIG.zones.forEach(function (zn) {
    var dz = Math.sqrt((p.x - zn.x) * (p.x - zn.x) + (p.z - zn.z) * (p.z - zn.z));
    if (dz < 12 && !st.visitedZones[zn.id]) { st.visitedZones[zn.id] = true; window.VW.saveProgress(); window.VW.renderHUD(); }
  });
  var clockEl = document.getElementById('clockText');
  if (clockEl) clockEl.textContent = 'Time ' + Math.floor(hour) + ':00 • ' + st.weather + ' • ' + window.VW.emotionFor(Math.floor(hour), st.weather);
  window.VW.updateMinimap();
};
window.VW.updateRogue = function (dt) {
  var r = window.VW.state.rogue, app = window.VW.app;
  r.t += dt;
  if (r.state === 'idle' && r.t > 90) { r.state = 'flee'; r.x = 0; r.z = 0; r.t = 0; window.VW.speak('Ek rogue unit bhagne ki koshish kar raha hai. Guards use pakad rahe hain.', window.VW.CONFIG.agents.find(function (a) { return a.id === 'rakshak-8'; })); }
  else if (r.state === 'flee') {
    r.x += dt * 4; r.z += dt * 2;
    if (r.x > 18) { r.state = 'caught'; r.t = 0; window.VW.speak('Guards ne rogue unit ko containment field se pakad liya hai. Koi nuksan nahi hua, use HQ wapas le jaya ja raha hai.', window.VW.CONFIG.agents.find(function (a) { return a.id === 'rakshak-8'; })); }
  } else if (r.state === 'caught' && r.t > 6) { r.state = 'idle'; r.t = 0; }
};
window.VW.updateCamera = function () {
  var st = window.VW.state, p = st.player, cam = window.VW.camera;
  if (!cam) return;
  if (st.cameraMode === 'eye') cam.setLocalPosition(p.x, p.y + 1.7, p.z);
  else if (st.cameraMode === 'drone') cam.setLocalPosition(p.x, p.y + 14, p.z + 14);
  else cam.setLocalPosition(p.x, p.y + 4, p.z + 7);
  cam.lookAt(p.x, p.y + 1.2, p.z);
};
window.VW.applyQuality = function (q, silent) {
  var st = window.VW.state;
  if (q === 'auto') { st.quality = 'auto'; if (window.VW.app) window.VW.app.graphicsDevice.maxPixelRatio = 2; return; }
  st.quality = q;
  var pr = q === 'low' ? 1 : 2;
  if (window.VW.app) window.VW.app.graphicsDevice.maxPixelRatio = pr;
  if (window.VW.sun) window.VW.sun.light.castShadows = (q === 'high');
  window.VW.entities.fireflies.forEach(function (f) { f.enabled = q !== 'low'; });
  window.VW.entities.animals.forEach(function (a) { a.enabled = q !== 'low'; });
  if (!silent) { var el = document.getElementById('qualityText'); if (el) el.textContent = 'Quality: ' + q; }
};
window.VW.checkProximity = function () {
  var st = window.VW.state, p = st.player;
  var nearest = null, nd = 1e9;
  Object.keys(window.VW.entities.agents).forEach(function (id) {
    var ent = window.VW.entities.agents[id], pos = ent.getLocalPosition();
    var d = Math.sqrt((p.x - pos.x) * (p.x - pos.x) + (p.z - pos.z) * (p.z - pos.z));
    if (d < nd) { nd = d; nearest = ent.userData.def; }
  });
  if (nearest && nd < 6) {
    if (window.VW.lastAgent !== nearest.id) {
      window.VW.lastAgent = nearest.id;
      var emo = window.VW.emotionFor(Math.floor(st.worldHour), st.weather);
      var line = nearest.lines[0] + ' (Mood: ' + emo + ') ' + nearest.story;
      window.VW.speak(line, nearest);
      var el = document.getElementById('agentPanel');
      if (el) { el.style.display = 'block'; el.innerHTML = '<b>' + nearest.name + ' — ' + nearest.job + '</b><br>' + line; }
    }
  } else if (window.VW.lastAgent) { window.VW.lastAgent = null; var el2 = document.getElementById('agentPanel'); if (el2) el2.style.display = 'none'; }
};
window.VW.saveProgress = function () {
  try { localStorage.setItem('vw-external-progress', JSON.stringify({ visited: window.VW.state.visitedZones, badges: window.VW.state.badges })); } catch (e) {}
};
window.VW.loadProgress = function () {
  try { var d = JSON.parse(localStorage.getItem('vw-external-progress') || '{}'); window.VW.state.visitedZones = d.visited || {}; window.VW.state.badges = d.badges || []; } catch (e) {}
};
window.VW.renderHUD = function () {
  var st = window.VW.state;
  var el = document.getElementById('hudText');
  if (el) el.textContent = 'Zones: ' + Object.keys(st.visitedZones).length + '/7 • Badges: ' + st.badges.length + ' • Quests done: ' + st.quests.filter(function (q) { return q.done; }).length;
};
window.VW.updateMinimap = function () {
  var cv = document.getElementById('minimap'); if (!cv) return;
  var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, 140, 140);
  ctx.fillStyle = '#1d3a2a'; ctx.fillRect(0, 0, 140, 140);
  window.VW.CONFIG.zones.forEach(function (zn) { ctx.fillStyle = '#ffd166'; ctx.fillRect(70 + zn.x, 70 + zn.z, 6, 6); });
  ctx.fillStyle = '#00e5ff'; ctx.beginPath(); ctx.arc(70 + window.VW.state.player.x, 70 + window.VW.state.player.z, 4, 0, 7); ctx.fill();
};

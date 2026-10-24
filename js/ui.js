// DOM UI: gate, avatar, top bar, map, quests, bag, settings, photo, feedback.
// No data leaves the browser: gate mobile is format-checked only, never sent or stored.
window.VW.startEntrySequence = function () {
  var st = window.VW.state; if (st.entryDone) return; st.entryDone = true;
  window.VW.Audio.gate();
  // Fireworks: 7 bursts, gravity particles (engine entities, no weapons).
  window.VW.entities.fireworks.forEach(function (f, i) {
    setTimeout(function () { f.setLocalPosition((i % 7) * 4 - 12, 2, 0); f.userData.vy = 8; f.userData.life = 1.6; }, i * 220);
  });
  // All agents greet in sequence, then disperse (guards stay, workers resume schedule).
  var agents = window.VW.CONFIG.agents.slice(0, 4);
  agents.forEach(function (a, i) {
    setTimeout(function () { window.VW.speak('Flow99 ka subscription kar lijiye, main fully aapke WhatsApp ko automation kar dunga', a); }, 800 + i * 900);
  });
  setTimeout(function () { window.VW.speak('Sab agents apne posts par chale gaye hain. Ab aaram se poora explore karo.', window.VW.CONFIG.agents[0]); }, 800 + agents.length * 900);
};
window.VW.enterWorld = function () {
  var mobile = (document.getElementById('mobileInput') || {}).value || '';
  var code = (document.getElementById('codeInput') || {}).value || '';
  if (!/^[0-9]{10}$/.test(mobile)) { alert('10-digit mobile number daalo (sirf format check, kahin bheja nahi jata).'); return; }
  if (code.trim() !== window.VW.CONFIG.gateCode) { alert('Code galat hai. Code: flow99'); return; }
  // Mic permission at gate. Deny = text fallback, world still works.
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      window.VW.state.micAllowed = true; stream.getTracks().forEach(function (t) { t.stop(); });
      window.VW.finishEnter();
    }).catch(function () { window.VW.state.micAllowed = false; window.VW.finishEnter(); });
  } else { window.VW.finishEnter(); }
};
window.VW.finishEnter = function () {
  window.VW.state.entered = true;
  var gate = document.getElementById('gateOverlay'); if (gate) gate.style.display = 'none';
  var avatar = document.getElementById('avatarOverlay'); if (avatar) avatar.style.display = 'flex';
  window.VW.Audio.ensure();
};
window.VW.finishAvatar = function () {
  var av = document.getElementById('avatarOverlay'); if (av) av.style.display = 'none';
  var hud = document.getElementById('hud'); if (hud) hud.style.display = 'block';
  window.VW.loadProgress(); window.VW.renderHUD();
  // First quest done on entry.
  window.VW.state.quests[0].done = true; window.VW.state.badges.push('Explorer');
  window.VW.saveProgress(); window.VW.renderHUD();
  window.VW.startEntrySequence();
  var lang = document.getElementById('langSelect');
  if (lang) window.VW.state.language = lang.value;
};
window.VW.teleportTo = function (zoneId) {
  var zn = window.VW.CONFIG.zones.find(function (z) { return z.id === zoneId; });
  if (!zn) return;
  window.VW.state.player.x = zn.x; window.VW.state.player.z = zn.z; window.VW.state.player.y = 0;
  window.VW.Audio.teleport(); window.VW.closeMap();
};
window.VW.openMap = function () {
  var m = document.getElementById('mapOverlay'); if (!m) return;
  m.style.display = 'block';
  m.innerHTML = '<h3>Full Map — kisi zone par tap karke teleport karo</h3>' + window.VW.CONFIG.zones.map(function (zn) {
    return '<button onclick="window.VW.teleportTo(\'' + zn.id + '\')">' + zn.name + '</button> ';
  }).join('') + '<br><button onclick="window.VW.closeMap()">Band karo</button>';
};
window.VW.closeMap = function () { var m = document.getElementById('mapOverlay'); if (m) m.style.display = 'none'; };
window.VW.showQuests = function () {
  var all = window.VW.CONFIG.quests.concat(window.VW.CONFIG.sideQuests, window.VW.CONFIG.dailyQuests);
  alert('Quests:\n' + all.map(function (q) { return '- ' + q.title + ': ' + q.desc; }).join('\n') + '\n\nBag (badges + quests only): ' + window.VW.state.badges.join(', '));
};
window.VW.showDemo = function () {
  alert('WhatsApp Demo (simulation only, asli connection nahi):\nCustomer: Price kya hai?\nFlow99 Auto-Reply: Demo plan dekh lo, asli payment yahan nahi hota.\nBroadcast / Booking / Reminder bhi isi demo me dikhte hain.');
  window.VW.state.quests[3].done = true; window.VW.saveProgress(); window.VW.renderHUD();
};
window.VW.takePhoto = function () {
  try {
    var canvas = document.getElementById('application');
    var url = canvas.toDataURL('image/png');
    var a = document.createElement('a'); a.href = url; a.download = 'flow99-world-photo.png'; a.click();
    window.VW.speak('Photo save ho gayi hai.', window.VW.CONFIG.agents[0]);
  } catch (e) { alert('Photo is waqt save nahi ho payi, dobara try karo.'); }
};
window.VW.robotSelfie = function () {
  // Place Robo-Prime next to visitor for the photo moment.
  var ent = window.VW.entities.agents['robo-prime'];
  if (ent) ent.setLocalPosition(window.VW.state.player.x + 1.5, 0, window.VW.state.player.z);
  window.VW.takePhoto();
};
window.VW.stuckRecovery = function () {
  var st = window.VW.state;
  if (st.insideHouse) { st.insideHouse = false; if (window.VW.houseEnt) window.VW.houseEnt.enabled = true; if (window.VW.interiorEnt) window.VW.interiorEnt.enabled = false; }
  st.player.x = 0; st.player.z = 8; st.player.y = 0; st.player.flying = false; st.tapTarget = null; st.tapPath = null;
  if (window.VW.syncHouseButton) window.VW.syncHouseButton();
  window.VW.speak('Wapas safe jagah par aa gaye ho.', window.VW.CONFIG.agents[0]);
};
// Home ENTERS the furnished house interior (living room), not just the house area.
window.VW.goHome = function () { if (window.VW.enterHouse) window.VW.enterHouse(); else { window.VW.teleportTo('castle'); window.VW.state.player.x = -8; window.VW.state.player.z = 28; } };
window.VW.syncHouseButton = function () {
  var b = document.getElementById('exitHouseBtn');
  if (b) b.style.display = window.VW.state.insideHouse ? 'inline-block' : 'none';
};
// Ray from the camera through a screen tap, intersected with the ground plane
// (y=0). This is ground-plane raycast, NOT mesh hit-testing: it does not test
// occlusion by buildings, and a tap on a roof/wall resolves to the ground point
// under that screen position. Collision safety comes from findPath (app.js),
// which routes around buildings/furniture instead of walking through them.
// Returns {x, z} or null (tap above the horizon, or no camera yet).
window.VW.screenTapToGround = function (clientX, clientY) {
  var cam = window.VW.camera, canvas = document.getElementById('application');
  if (!cam || !canvas || !cam.getWorldTransform) return null;
  var rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
  var ny = 1 - ((clientY - rect.top) / rect.height) * 2;
  var m = cam.getWorldTransform().data;
  var rx = m[0], ry = m[1], rz = m[2], ux = m[4], uy = m[5], uz = m[6];
  var fx = -m[8], fy = -m[9], fz = -m[10]; // camera looks down -Z in world space
  var fov = (cam.camera && cam.camera.fov) || 45;
  var tanH = Math.tan(fov * Math.PI / 360), aspect = rect.width / rect.height;
  var dx = fx + rx * nx * tanH * aspect + ux * ny * tanH;
  var dy = fy + ry * nx * tanH * aspect + uy * ny * tanH;
  var dz = fz + rz * nx * tanH * aspect + uz * ny * tanH;
  var dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!dl || dy >= -0.001) return null;
  var o = cam.getPosition();
  var t = -o.y / (dy / dl);
  if (t < 0) return null;
  return { x: o.x + (dx / dl) * t, z: o.z + (dz / dl) * t };
};
window.VW.handleTap = function (clientX, clientY) {
  if (!window.VW.state.entered) return;
  var hit = window.VW.screenTapToGround(clientX, clientY);
  if (!hit) return;
  var p = window.VW.state.player;
  if (window.VW.state.insideHouse) {
    hit.x = Math.max(-11, Math.min(-5, hit.x)); hit.z = Math.max(25.5, Math.min(30.5, hit.z));
  } else {
    hit.x = Math.max(-58, Math.min(58, hit.x)); hit.z = Math.max(-58, Math.min(58, hit.z));
  }
  if (window.VW.findPath) {
    var path = window.VW.findPath(p.x, p.z, hit.x, hit.z);
    if (path && path.length) { window.VW.state.tapPath = path; window.VW.state.tapTarget = path[path.length - 1]; return; }
  }
  window.VW.state.tapPath = null; window.VW.state.tapTarget = hit;
};
window.VW.toggleFly = function () { window.VW.state.player.flying = !window.VW.state.player.flying; if (window.VW.state.player.flying) window.VW.Audio.jet(); };
window.VW.toggleSit = function () { window.VW.state.player.sitting = !window.VW.state.player.sitting; };
window.VW.setCamera = function (mode) { window.VW.state.cameraMode = mode; };
window.VW.setQuality = function (q) { window.VW.applyQuality(q); };
window.VW.feedback = function () {
  var stars = prompt('Tour kaisa laga? 1 se 5 stars do (sirf is browser me save hoga):', '5');
  if (stars) { try { localStorage.setItem('vw-external-feedback', stars); } catch (e) {} alert('Shukriya! Feedback local save ho gaya.'); }
};
window.VW.bindUI = function () {
  document.addEventListener('keydown', function (e) {
    window.VW.state.keys[e.code] = true;
    if (e.code === 'KeyF') window.VW.toggleSit();
  });
  document.addEventListener('keyup', function (e) { window.VW.state.keys[e.code] = false; });
  var canvas = document.getElementById('application');
  if (canvas) {
    canvas.addEventListener('click', function (e) {
      // Suppress the synthetic click that follows a touch tap (handled below).
      if (window.VW._lastTouchTap && Date.now() - window.VW._lastTouchTap < 600) return;
      window.VW.handleTap(e.clientX, e.clientY);
    });
    canvas.addEventListener('touchend', function (e) {
      var t = e.changedTouches && e.changedTouches[0];
      if (t) { window.VW._lastTouchTap = Date.now(); window.VW.handleTap(t.clientX, t.clientY); }
    }, { passive: true });
  }
  // Exit-house button (created here so index.html needs no edit): visible only inside.
  var hud = document.getElementById('hud');
  var topbar = hud ? hud.querySelector('.topbar') : null;
  if (topbar && !document.getElementById('exitHouseBtn')) {
    var eb = document.createElement('button');
    eb.id = 'exitHouseBtn'; eb.textContent = 'Ghar se Bahar (Exit)'; eb.style.display = 'none';
    eb.addEventListener('click', function () { if (window.VW.exitHouse) window.VW.exitHouse(); });
    topbar.appendChild(eb);
  }
  // Joystick (touch)
  var joy = document.getElementById('joystick');
  if (joy) {
    joy.addEventListener('touchmove', function (e) {
      var t = e.touches[0]; var r = joy.getBoundingClientRect();
      window.VW.state.joystick.x = Math.max(-1, Math.min(1, (t.clientX - r.left - r.width / 2) / (r.width / 2)));
      window.VW.state.joystick.y = Math.max(-1, Math.min(1, (t.clientY - r.top - r.height / 2) / (r.height / 2)));
    }, { passive: true });
    joy.addEventListener('touchend', function () { window.VW.state.joystick = { x: 0, y: 0 }; });
  }
  var vs = document.getElementById('voiceVol'), ms = document.getElementById('musicVol'), ss = document.getElementById('sfxVol');
  if (vs) vs.addEventListener('input', function (e) { window.VW.Audio.vols.voice = e.target.value / 100; });
  if (ms) ms.addEventListener('input', function (e) { window.VW.Audio.vols.music = e.target.value / 100; });
  if (ss) ss.addEventListener('input', function (e) { window.VW.Audio.vols.sfx = e.target.value / 100; });
  var sub = document.getElementById('subToggle');
  if (sub) sub.addEventListener('change', function (e) { window.VW.state.subtitles = e.target.checked; });
};
window.addEventListener('load', function () {
  window.VW.bindUI();
  if (!window.VW.initWorld()) return;
});

// Procedural PBR-style canvas textures (max 512px, most 128-256px).
// Purpose: Free Fire style textured look WITHOUT flat colour and WITHOUT heavy downloads.
// Improved in this pass (Worker 3): the visitor + robot slots got real weave / brushed-metal
// / glass / skin-shading detail. No material slot or function signature changed, so
// js/app.js keeps working untouched: makeCanvasTexture(draw, size) and
// textureDraws.{cloth,metal,glass,skin,grass,stone,wood,water} with the same arguments.
// A real CC0 pack (KayKit/Quaternius + Poly Haven) can replace these files later with
// the same material names — the engine code does not depend on the source of the texture.
// NOTE (honest): in THIS build no CC0 pack was downloaded. All textures below are
// procedural canvas textures, generated on the visitor's device at load time. Do not
// claim downloaded CC0 models/textures for this build — see README.md.
window.VW.makeCanvasTexture = function (draw, size) {
  size = size || 256;
  var c = document.createElement('canvas');
  c.width = size; c.height = size;
  var ctx = c.getContext('2d');
  draw(ctx, size);
  return c;
};
// Small deterministic pseudo-random helper so a texture looks the same on every load
// (Math.random would reshuffle speckles/blades on every page load).
window.VW._seededRand = function (seed) {
  var s = seed >>> 0 || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
window.VW.textureDraws = {
  // Visitor clothes + robot body cloth: woven warp/weft threads, stitch seams,
  // subtle fibre noise. Base colour comes from the caller (app.js), never hard-coded
  // to one outfit, so wardrobe colour select still works.
  cloth: function (ctx, s, base) {
    var rnd = window.VW._seededRand(12345 + s);
    ctx.fillStyle = base || '#8899aa'; ctx.fillRect(0, 0, s, s);
    var step = Math.max(4, Math.round(s / 64));
    for (var y = 0; y < s; y += step) {
      for (var x = 0; x < s; x += step) {
        // Warp thread: darker vertical strip; weft thread: lighter horizontal strip.
        ctx.fillStyle = ((x / step + y / step) % 2 === 0) ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.10)';
        ctx.fillRect(x, y, step, step);
        if (rnd() > 0.85) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(x, y, 1, 1); }
      }
    }
    // Stitch seams (hem + centre seam) — reads as tailored cloth, not a flat fill.
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(0, s * 0.08); ctx.lineTo(s, s * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 0.5, 0); ctx.lineTo(s * 0.5, s); ctx.stroke();
    ctx.setLineDash([]);
    // Soft vertical shading so the cloth is not uniformly lit.
    var g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.14)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  },
  // Robot metal/glass: brushed-metal gradient + fine horizontal brush lines +
  // diagonal gloss streak + panel seams + rivets. Used for robot heads/antennas
  // and metal buildings (same slot, same call signature as before).
  metal: function (ctx, s) {
    var rnd = window.VW._seededRand(777 + s);
    var g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, '#d3dbe2'); g.addColorStop(0.35, '#8b98a6'); g.addColorStop(0.55, '#6e7b89'); g.addColorStop(0.75, '#aab4be'); g.addColorStop(1, '#c8d0d8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    // Brushed lines.
    for (var y = 0; y < s; y += 2) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, s, 1);
    }
    // Diagonal gloss streak (the "premium gloss" highlight).
    var gloss = ctx.createLinearGradient(0, 0, s, s);
    gloss.addColorStop(0, 'rgba(255,255,255,0)');
    gloss.addColorStop(0.42, 'rgba(255,255,255,0.42)');
    gloss.addColorStop(0.55, 'rgba(255,255,255,0.10)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss; ctx.fillRect(0, 0, s, s);
    // Panel seams + rivets.
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(s * 0.08, s * 0.08, s * 0.84, s * 0.84);
    ctx.fillStyle = 'rgba(20,26,32,0.8)';
    [[0.08, 0.08], [0.92, 0.08], [0.08, 0.92], [0.92, 0.92]].forEach(function (p) {
      ctx.beginPath(); ctx.arc(s * p[0], s * p[1], Math.max(2, s / 64), 0, 7); ctx.fill();
    });
    // Edge highlight along the top so metal reads as lit, not grey-flat.
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, 0, s, Math.max(3, s / 32));
  },
  // NEW slot (additive only — app.js does not call it yet, so nothing breaks):
  // glass for robot visors/panels: dark tint + bright reflection streaks + edge glow.
  glass: function (ctx, s) {
    var g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, '#1a2e3d'); g.addColorStop(0.5, '#3d6a86'); g.addColorStop(1, '#16222e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = 'rgba(180,230,255,0.55)';
    ctx.beginPath(); ctx.moveTo(s * 0.15, 0); ctx.lineTo(s * 0.35, 0); ctx.lineTo(s * 0.15, s); ctx.lineTo(s * 0.0, s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(180,230,255,0.28)';
    ctx.beginPath(); ctx.moveTo(s * 0.45, 0); ctx.lineTo(s * 0.55, 0); ctx.lineTo(s * 0.35, s); ctx.lineTo(s * 0.25, s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(160,220,255,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, s - 2, s - 2);
  },
  grass: function (ctx, s) {
    var rnd = window.VW._seededRand(4242 + s);
    ctx.fillStyle = '#3f7a3a'; ctx.fillRect(0, 0, s, s);
    // Dirt patches so the ground is not one flat green.
    for (var p = 0; p < 12; p++) {
      ctx.fillStyle = 'rgba(90,65,35,0.18)';
      ctx.beginPath(); ctx.ellipse(rnd() * s, rnd() * s, 8 + rnd() * 18, 5 + rnd() * 10, 0, 0, 7); ctx.fill();
    }
    for (var i = 0; i < 500; i++) {
      var shades = ['#4f9448', '#2f6b2e', '#5fae54', '#356e33'];
      ctx.fillStyle = shades[Math.floor(rnd() * shades.length)];
      var bx = rnd() * s, by = rnd() * s;
      ctx.fillRect(bx, by, 2, 5 + rnd() * 5);
      ctx.fillRect(bx + 1, by - 1, 1, 2);
    }
  },
  stone: function (ctx, s) {
    var rnd = window.VW._seededRand(999 + s);
    ctx.fillStyle = '#7e7e88'; ctx.fillRect(0, 0, s, s);
    var rows = 6, cols = 4, bh = s / rows, bw = s / cols;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var off = (r % 2) * bw / 2;
        var x = c * bw + off - (off ? bw / 2 : 0);
        // Per-block tone variation + top light / bottom shade.
        ctx.fillStyle = rnd() > 0.5 ? '#8a8a92' : '#7a7a84';
        ctx.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 2, r * bh + 2, bw - 4, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.20)'; ctx.fillRect(x + 2, (r + 1) * bh - 5, bw - 4, 3);
        for (var k = 0; k < 14; k++) {
          ctx.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.10)';
          ctx.fillRect(x + 3 + rnd() * (bw - 8), r * bh + 3 + rnd() * (bh - 8), 2, 2);
        }
      }
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (var y = 0; y <= s; y += bh) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke(); }
  },
  wood: function (ctx, s) {
    var rnd = window.VW._seededRand(31337 + s);
    ctx.fillStyle = '#7a5230'; ctx.fillRect(0, 0, s, s);
    // Wavy grain + a knot, instead of straight parallel lines.
    ctx.lineWidth = 2;
    for (var y = 0; y < s; y += 16) {
      ctx.strokeStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.28)' : 'rgba(255,220,160,0.16)';
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(s * 0.3, y + 4, s * 0.7, y - 4, s, y + 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(s * 0.7, s * 0.3, 10, 6, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(s * 0.7, s * 0.3, 5, 3, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,160,0.10)'; ctx.fillRect(0, 0, s, 4);
  },
  water: function (ctx, s) {
    var rnd = window.VW._seededRand(555 + s);
    var g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, '#3a8ac4'); g.addColorStop(1, '#1d5d8a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
    for (var y = 0; y < s; y += 22) {
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(s * 0.3, y - 6, s * 0.7, y + 6, s, y);
      ctx.stroke();
    }
    // Sparkle dots on the surface.
    for (var i = 0; i < 60; i++) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd() * 0.5).toFixed(2) + ')';
      ctx.fillRect(rnd() * s, rnd() * s, 2, 2);
    }
  },
  // Visitor skin: vertical shading gradient (lit top, shaded jaw/neck zone),
  // soft cheek tone and fine pore noise — not a single flat skin fill.
  skin: function (ctx, s, base) {
    var rnd = window.VW._seededRand(2024 + s);
    var g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, base || '#c98a5a');
    g.addColorStop(0.55, base || '#c98a5a');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = base || '#c98a5a'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    // Soft highlight at the top (forehead light) + subtle cheek warmth.
    var hi = ctx.createRadialGradient(s * 0.5, s * 0.15, 2, s * 0.5, s * 0.15, s * 0.45);
    hi.addColorStop(0, 'rgba(255,230,200,0.30)'); hi.addColorStop(1, 'rgba(255,230,200,0)');
    ctx.fillStyle = hi; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = 'rgba(200,90,70,0.10)';
    ctx.beginPath(); ctx.ellipse(s * 0.28, s * 0.55, s * 0.12, s * 0.08, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.72, s * 0.55, s * 0.12, s * 0.08, 0, 0, 7); ctx.fill();
    for (var i = 0; i < 220; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(rnd() * s, rnd() * s, 1, 1);
    }
  }
};

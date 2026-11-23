/* Rotating gold "data globe" with deal arcs from Dubai to each market. */
window.initGlobe = function (canvas, opts) {
  opts = opts || {};
  var ctx = canvas.getContext('2d');
  if (!ctx) return null;

  var markets = opts.markets || [
    { name: 'Dubai', lat: 25.2, lon: 55.27, hub: true, dx: 10, dy: -10 },
    { name: 'USA', lat: 38.9, lon: -77.0 },
    { name: 'Doha', lat: 25.29, lon: 51.53, left: true, dy: 16 },
    { name: 'Hong Kong', lat: 22.32, lon: 114.17, left: true, dy: 14 },
    { name: 'China', lat: 24.87, lon: 118.68, dy: -10 },
    { name: 'Cairo', lat: 30.04, lon: 31.24, left: true, dy: -8 }
  ];

  var small = window.innerWidth < 700;
  var N = small ? 900 : 1500;
  var pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  function ll(lat, lon) {
    var p = lat * Math.PI / 180, l = lon * Math.PI / 180;
    return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
  }
  markets.forEach(function (m) { m.v = ll(m.lat, m.lon); });
  var hub = markets.filter(function (m) { return m.hub; })[0];

  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    var om = Math.acos(d), so = Math.sin(om);
    if (so < 1e-5) return a.slice();
    var k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  var arcs = markets.filter(function (m) { return !m.hub; }).map(function (m, idx) {
    var d = Math.acos(Math.max(-1, Math.min(1, hub.v[0] * m.v[0] + hub.v[1] * m.v[1] + hub.v[2] * m.v[2])));
    var lift = 0.05 + d * 0.11, samples = [];
    for (var s = 0; s <= 48; s++) {
      var t = s / 48, v = slerp(hub.v, m.v, t), h = 1 + Math.sin(Math.PI * t) * lift;
      samples.push([v[0] * h, v[1] * h, v[2] * h]);
    }
    return { pts: samples, offset: idx * 0.19 };
  });

  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  var angle = -55 * Math.PI / 180, tilt = 0.42; // tilt so ~25°N (Gulf) faces the viewer
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.4; cx = W / 2; cy = H / 2;
  }
  function rot(v) {
    var ca = Math.cos(angle), sa = Math.sin(angle);
    var x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    return [x1, v[1] * ct - z1 * st, v[1] * st + z1 * ct];
  }
  function proj(v) { return [cx + v[0] * R, cy - v[1] * R, v[2]]; }

  function frame(time) {
    var t = time / 1000;
    ctx.clearRect(0, 0, W, H);

    // atmosphere
    var g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.25);
    g.addColorStop(0, 'rgba(236,230,216,0)');
    g.addColorStop(0.55, 'rgba(236,230,216,0.10)');
    g.addColorStop(1, 'rgba(236,230,216,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();

    // sphere body
    var body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, 'rgba(38,38,35,0.95)');
    body.addColorStop(1, 'rgba(12,12,11,0.97)');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(236,230,216,0.25)'; ctx.lineWidth = 1; ctx.stroke();

    // dots
    for (var i = 0; i < pts.length; i++) {
      var p = proj(rot(pts[i]));
      if (p[2] < 0) continue;
      var a = 0.12 + p[2] * 0.75;
      ctx.fillStyle = 'rgba(236,230,216,' + a.toFixed(3) + ')';
      var s = 0.6 + p[2] * 1.1;
      ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
    }

    // arcs
    arcs.forEach(function (arc) {
      var P = arc.pts.map(function (v) { return proj(rot(v)); });
      ctx.lineWidth = 1.2;
      for (var k = 1; k < P.length; k++) {
        var z = Math.min(P[k - 1][2], P[k][2]);
        if (z < 0.02) continue;
        ctx.strokeStyle = 'rgba(236,230,216,' + (0.18 + Math.max(0, z) * 0.35).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(P[k - 1][0], P[k - 1][1]); ctx.lineTo(P[k][0], P[k][1]); ctx.stroke();
      }
      // travelling light
      var prog = ((t * 0.32 + arc.offset) % 1);
      var head = Math.floor(prog * (P.length - 1));
      for (var j = Math.max(1, head - 7); j <= head; j++) {
        if (Math.min(P[j - 1][2], P[j][2]) < 0.02) continue;
        var f = 1 - (head - j) / 8;
        ctx.strokeStyle = 'rgba(255,252,242,' + (f * 0.95).toFixed(3) + ')';
        ctx.lineWidth = 1.2 + f * 1.6;
        ctx.beginPath(); ctx.moveTo(P[j - 1][0], P[j - 1][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
      }
    });

    // markers
    ctx.font = '500 ' + (small ? 10 : 12) + 'px Jost, sans-serif';
    markets.forEach(function (m, idx) {
      var p = proj(rot(m.v));
      if (p[2] < 0.02) return;
      var pulse = (t * 0.8 + idx * 0.3) % 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], 4 + pulse * 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(236,230,216,' + ((1 - pulse) * 0.6 * p[2]).toFixed(3) + ')';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], m.hub ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = m.hub ? '#fffaf0' : '#ece6d8'; ctx.fill();
      ctx.fillStyle = 'rgba(244,239,230,' + (0.35 + p[2] * 0.65).toFixed(3) + ')';
      ctx.textAlign = m.left ? 'right' : 'left';
      ctx.fillText(m.name.toUpperCase(), p[0] + (m.left ? -9 : 9), p[1] + (m.dy != null ? m.dy : -8));
    });
  }

  var running = false, inView = false, raf = 0, last = performance.now();
  function loop(time) {
    var dt = Math.min(0.05, (time - last) / 1000); last = time;
    angle += dt * 0.16;
    frame(time);
    if (running) raf = requestAnimationFrame(loop);
  }
  function play() { if (!running && inView && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } }
  function pause() { running = false; cancelAnimationFrame(raf); }

  window.addEventListener('resize', function () { resize(); if (!running) frame(performance.now()); });
  resize();
  frame(performance.now());
  if (opts.static) return {};

  new IntersectionObserver(function (e) { inView = e[0].isIntersecting; inView ? play() : pause(); }).observe(canvas);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });
  return { play: play, pause: pause };
};

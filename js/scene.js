/* =========================================================
   Cinematic WebGL stage: an endless monochrome grid floor,
   a slowly turning monolith (half skyscraper, half server tower)
   and an Art-Deco sunburst behind it. Scroll flies the camera.
   ========================================================= */
window.initStage = function (canvas, opts) {
  opts = opts || {};
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  var deriv = gl.getExtension('OES_standard_derivatives');

  var vert = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  var frag = [
    deriv ? '#extension GL_OES_standard_derivatives : enable' : '',
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime; uniform float uScroll; uniform vec2 uMouse; uniform float uIntro;',
    'const vec3 BG = vec3(0.078, 0.078, 0.076);',
    'const vec3 INK = vec3(0.93, 0.905, 0.85);',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(41.31, 289.17))) * 45758.5453); }',
    'mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }',
    // grid line intensity, anti-aliased
    'float grid(vec2 p, float w){',
    deriv ? '  vec2 fw = fwidth(p);' : '  vec2 fw = vec2(0.02);',
    '  vec2 a = abs(fract(p - 0.5) - 0.5) / max(fw * w, vec2(1e-4));',
    '  return 1.0 - min(min(a.x, a.y), 1.0);',
    '}',
    // ray vs axis-aligned box centred at origin (iq)
    'vec2 boxHit(vec3 ro, vec3 rd, vec3 b, out vec3 n){',
    '  vec3 m = 1.0 / rd; vec3 k = abs(m) * b;',
    '  vec3 t1 = -m * ro - k; vec3 t2 = -m * ro + k;',
    '  float tN = max(max(t1.x, t1.y), t1.z); float tF = min(min(t2.x, t2.y), t2.z);',
    '  if (tN > tF || tF < 0.0) return vec2(-1.0);',
    '  n = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);',
    '  return vec2(tN, tF);',
    '}',
    'const vec3 B = vec3(0.55, 2.6, 0.55);',   // monolith half size
    'const vec3 C = vec3(0.0, 2.6, 0.0);',     // monolith centre
    // shade a hit on the monolith in local space
    'vec3 shadeTower(vec3 lp, vec3 n){',
    '  vec3 q = abs(lp) / B;',
    '  float e;',
    '  if (abs(n.y) > 0.5) e = max(q.x, q.z); else if (abs(n.x) > 0.5) e = max(q.y, q.z); else e = max(q.x, q.y);',
    '  float edge = smoothstep(0.965, 0.995, e);',
    '  float fv = abs(fract(lp.y * 2.6) - 0.5) * 2.0;',
    '  float floors = smoothstep(0.88, 0.97, fv) * step(abs(n.y), 0.5) * 0.2;',
    '  vec2 cell = floor(vec2((abs(n.x) > 0.5 ? lp.z : lp.x) * 6.0, lp.y * 2.6));',
    '  float lit = step(0.93, hash(cell + n.xz * 7.0)) * (0.55 + 0.45 * sin(uTime * 2.0 + hash(cell) * 30.0));',
    '  lit *= step(abs(n.y), 0.5);',
    '  float face = 0.05 + 0.035 * dot(n, normalize(vec3(0.6, 0.4, 0.7)));',
    '  vec3 col = vec3(face) + INK * (edge * 0.95 + floors + lit * 0.5);',
    '  col += INK * 0.12 * smoothstep(0.0, 2.0 * B.y, lp.y + B.y) * smoothstep(-0.2, 1.0, n.z);',
    '  return col;',
    '}',
    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;',
    '  float s = clamp(uScroll, 0.0, 1.0);',
    '  float t = uTime;',
    // camera
    '  vec3 ro = vec3(sin(t * 0.06) * 0.8 + uMouse.x * 0.9, 1.35 + s * 3.2 + uMouse.y * 0.25, 10.5 - s * 5.0 + (1.0 - uIntro) * 6.0);',
    '  vec3 ta = vec3(0.0, 2.7 + s * 1.6, 0.0);',
    '  vec3 fw = normalize(ta - ro); vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0))); vec3 up = cross(rt, fw);',
    '  float focal = 1.65;',
    '  vec3 rd = normalize(uv.x * rt + uv.y * up + focal * fw);',
    // background: soft vertical gradient + stars
    '  vec3 col = BG * (0.75 + 0.5 * smoothstep(-0.4, 0.6, uv.y));',
    '  vec2 sg = floor(gl_FragCoord.xy / 3.0);',
    '  float star = step(0.9965, hash(sg)) * (0.4 + 0.6 * sin(t * 1.5 + hash(sg + 3.0) * 40.0));',
    '  col += INK * star * 0.55 * smoothstep(-0.05, 0.3, uv.y);',
    // sunburst behind the top of the tower
    '  vec3 P = C + vec3(0.0, B.y * 0.85, 0.0);',
    '  vec3 dP = P - ro; float z = dot(dP, fw);',
    '  vec2 sp = vec2(dot(dP, rt), dot(dP, up)) / z * focal;',
    '  vec2 d = uv - sp; float r = length(d); float ang = atan(d.y, d.x);',
    '  float rays = smoothstep(0.82, 0.98, abs(sin(ang * 18.0 + t * 0.05)));',
    '  float upper = smoothstep(-0.25, 0.25, d.y / max(r, 1e-3));',
    '  float burst = rays * upper * smoothstep(1.4, 0.15, r) * smoothstep(0.05, 0.22, r);',
    '  float ring = 1.0 - smoothstep(0.0, 0.004, abs(r - 0.42));',
    '  float ring2 = 1.0 - smoothstep(0.0, 0.003, abs(r - 0.5));',
    '  col += INK * (burst * 0.16 + (ring * 0.35 + ring2 * 0.18) * upper);',
    '  col += INK * 0.12 * exp(-r * 3.5);',
    // floor
    '  float tFloor = rd.y < 0.0 ? -ro.y / rd.y : 1e9;',
    // tower
    '  float ra = t * 0.07;',
    '  mat2 R = rot(ra);',
    '  vec3 lro = ro - C; lro.xz = R * lro.xz;',
    '  vec3 lrd = rd; lrd.xz = R * lrd.xz;',
    '  vec3 n; vec2 bh = boxHit(lro, lrd, B, n);',
    '  float tTower = bh.x > 0.0 ? bh.x : 1e9;',
    '  if (tTower < tFloor) {',
    '    vec3 lp = lro + lrd * tTower;',
    '    col = shadeTower(lp, n);',
    '    col = mix(col, BG, 1.0 - exp(-tTower * 0.035));',
    '  } else if (tFloor < 1e8) {',
    '    vec3 p = ro + rd * tFloor;',
    '    float g1 = grid(p.xz * 1.0, 1.2);',
    '    float g2 = grid(p.xz * 4.0, 1.0) * 0.25;',
    '    vec3 fc = BG * 0.8 + INK * (g1 * 0.42 + g2 * 0.12);',
    // fake reflection of the tower
    '    vec3 rrd = reflect(rd, vec3(0.0, 1.0, 0.0));',
    '    vec3 rro = p - C; rro.xz = R * rro.xz; vec3 rlrd = rrd; rlrd.xz = R * rlrd.xz;',
    '    vec3 rn; vec2 rh = boxHit(rro, rlrd, B, rn);',
    '    if (rh.x > 0.0) fc += shadeTower(rro + rlrd * rh.x, rn) * 0.22;',
    '    float glow = exp(-length(p.xz) * 0.55);',
    '    fc += INK * glow * 0.16;',
    '    float fog = 1.0 - exp(-tFloor * 0.075);',
    '    col = mix(fc, col, fog);',
    '  }',
    // horizon haze, vignette, grain
    '  col += INK * 0.05 * exp(-abs(uv.y + 0.02) * 9.0);',
    '  col *= 1.0 - 0.55 * dot(uv * 0.8, uv * 0.8);',
    '  col += (hash(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.035;',
    '  col *= uIntro;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['uRes', 'uTime', 'uScroll', 'uMouse', 'uIntro'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });

  var state = { scroll: 0, intro: opts.static ? 1 : 0 };
  var mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  var start = performance.now(), running = false, inView = true, raf = 0;

  function resize() {
    var small = window.innerWidth < 768;
    var scale = Math.min(window.devicePixelRatio || 1, 2) * (small ? 0.6 : 0.75);
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }
  function draw(now) {
    mouse.x += (target.x - mouse.x) * 0.04; mouse.y += (target.y - mouse.y) * 0.04;
    gl.uniform1f(U.uTime, (now - start) / 1000 + 20.0);
    gl.uniform1f(U.uScroll, state.scroll);
    gl.uniform1f(U.uIntro, state.intro);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) { draw(now); if (running) raf = requestAnimationFrame(loop); }
  function play() { if (!running && inView && !document.hidden && !opts.static) { running = true; raf = requestAnimationFrame(loop); } }
  function pause() { running = false; cancelAnimationFrame(raf); }

  window.addEventListener('resize', function () { resize(); draw(performance.now()); });
  window.addEventListener('pointermove', function (e) {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });

  resize();
  draw(performance.now());
  play();

  return {
    state: state,
    setVisible: function (v) { inView = v; v ? play() : pause(); },
    redraw: function () { draw(performance.now()); }
  };
};

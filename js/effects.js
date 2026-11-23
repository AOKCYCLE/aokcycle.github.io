/* =========================================================
   Interactive effects, inspired by React Bits components and
   rebuilt in plain JavaScript on top of GSAP:
   Rotating Text · Circular Text · Flowing Menu · Magic Bento ·
   Pixel Transition · Image Trail · Click Spark · Scramble Text ·
   Scroll Velocity · Typewriter — plus an animated line-art library.
   ========================================================= */
window.Effects = (function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = window.gsap;

  /* ---------- Animated line-art library (160 × 100) ---------- */
  function d(n) { return ' style="animation-delay:' + n + 's"'; }
  var VIZ = {
    rack: '<rect x="20" y="22" width="30" height="70" rx="2" opacity=".45"/><rect x="110" y="22" width="30" height="70" rx="2" opacity=".45"/>' +
      '<rect x="55" y="8" width="50" height="84" rx="3"/><path d="M55 26H105M55 44H105M55 62H105M55 80H105"/>' +
      '<path stroke-width="1" d="M72 17H98M72 35H98M72 53H98M72 71H98"/>' +
      '<circle class="v-blink" cx="63" cy="17" r="2.4" fill="currentColor"/><circle class="v-blink"' + d(-.3) + ' cx="63" cy="35" r="2.4" fill="currentColor"/>' +
      '<circle class="v-blink"' + d(-.7) + ' cx="63" cy="53" r="2.4" fill="currentColor"/><circle class="v-blink"' + d(-.5) + ' cx="63" cy="71" r="2.4" fill="currentColor"/>' +
      '<circle class="v-blink"' + d(-.9) + ' cx="30" cy="40" r="2" fill="currentColor"/><circle class="v-blink"' + d(-.2) + ' cx="130" cy="56" r="2" fill="currentColor"/>',
    gpu: '<rect x="14" y="26" width="132" height="50" rx="6"/><path d="M146 38h6v26h-6M30 76v8M42 76v8M54 76v8M66 76v8M78 76v8M90 76v8"/>' +
      '<g class="v-spin"><circle cx="52" cy="51" r="17"/><path d="M52 51V36M52 51l13 8M52 51l-13 8"/></g>' +
      '<g class="v-spin"' + d(-.6) + '><circle cx="108" cy="51" r="17"/><path d="M108 51V36M108 51l13 8M108 51l-13 8"/></g>',
    pad: '<path d="M44 32h72c14 0 24 12 26 30l3 14c2 10-10 16-18 8L115 72H45L33 84c-8 8-20 2-18-8l3-14c2-18 12-30 26-30z"/>' +
      '<path d="M50 50h14M57 43v14"/><circle cx="68" cy="66" r="5"/><circle cx="92" cy="66" r="5"/>' +
      '<circle class="v-blink" cx="104" cy="44" r="3" fill="currentColor"/><circle class="v-blink"' + d(-.4) + ' cx="114" cy="52" r="3" fill="currentColor"/>' +
      '<circle class="v-blink"' + d(-.8) + ' cx="94" cy="52" r="3" fill="currentColor"/><circle cx="104" cy="60" r="3"/>',
    trophy: '<path d="M60 12h40v22c0 14-9 24-20 24S60 48 60 34z"/><path d="M60 18H46c0 12 6 18 14 20M100 18h14c0 12-6 18-14 20"/>' +
      '<path d="M80 58v12M70 70h20v14H70zM62 88h36"/>' +
      '<path class="v-twinkle" d="M30 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor"/>' +
      '<path class="v-twinkle"' + d(-.9) + ' d="M130 44l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor"/>',
    globe: '<circle cx="80" cy="50" r="38"/><ellipse class="v-squash" cx="80" cy="50" rx="16" ry="38"/>' +
      '<ellipse class="v-squash"' + d(-2) + ' cx="80" cy="50" rx="30" ry="38"/><path d="M42 50h76M47 31h66M47 69h66"/>',
    pyramid: '<path d="M14 88L60 26l46 62M86 88l28-38 28 38"/><path opacity=".55" d="M30 70h60M44 52h32"/>' +
      '<circle class="v-pulse" cx="124" cy="22" r="9"/><path d="M6 88h148"/>',
    camel: '<path d="M52 52C56 36 66 22 80 22C94 22 100 38 108 48C116 44 122 32 126 18C128 10 134 6 142 7L152 10C155 12 154 18 150 18L140 18C136 30 132 48 126 58C120 62 112 62 104 60L62 60C56 60 52 56 52 52Z"/>' +
      '<path d="M62 60l2 16-4 16M72 60v16l2 16M118 60l-2 16 2 16M126 58l2 18-2 16M52 52c-6 4-6 14-4 20"/><circle cx="146" cy="12" r="1.2" fill="currentColor"/>' +
      '<path opacity=".45" d="M14 92h140"/><circle class="v-pulse" cx="24" cy="18" r="7"/>',
    cart: '<g class="v-roll"><path d="M26 22h12l12 40h52l10-30H44"/><circle cx="58" cy="74" r="6"/><circle cx="96" cy="74" r="6"/>' +
      '<rect class="v-drop" x="64" y="8" width="16" height="14" rx="2"/></g><path opacity=".4" d="M10 86h140"/>',
    line: '<path opacity=".35" d="M10 90H150M10 10V90"/><path fill="currentColor" stroke="none" opacity=".12" d="M10 82L38 66L60 72L86 46L110 52L148 18V90H10Z"/>' +
      '<path class="v-draw" pathLength="1" d="M10 82L38 66L60 72L86 46L110 52L148 18"/><circle class="v-pulse" cx="148" cy="18" r="4" fill="currentColor"/>',
    bars: '<path opacity=".35" d="M10 90H150"/>' +
      '<rect class="v-bar" x="20" y="62" width="14" height="28"/><rect class="v-bar"' + d(-.2) + ' x="42" y="48" width="14" height="42"/>' +
      '<rect class="v-bar"' + d(-.4) + ' x="64" y="54" width="14" height="36"/><rect class="v-bar"' + d(-.6) + ' x="86" y="34" width="14" height="56"/>' +
      '<rect class="v-bar"' + d(-.8) + ' x="108" y="24" width="14" height="66"/><rect class="v-bar"' + d(-1) + ' x="130" y="10" width="14" height="80" fill="currentColor"/>',
    donut: '<circle cx="80" cy="50" r="32" opacity=".3"/><circle class="v-spin" cx="80" cy="50" r="32" stroke-width="6" stroke-dasharray="120 201"/>' +
      '<text x="80" y="56" text-anchor="middle" font-size="15" fill="currentColor" stroke="none" font-family="Federo, serif">+28%</text>',
    coin: '<ellipse cx="58" cy="82" rx="26" ry="7"/><path d="M32 82v-10M84 82v-10"/><ellipse cx="58" cy="72" rx="26" ry="7"/>' +
      '<path d="M32 72v-10M84 72v-10"/><ellipse cx="58" cy="62" rx="26" ry="7"/><path d="M32 62v-10M84 62v-10"/><ellipse cx="58" cy="52" rx="26" ry="7"/>' +
      '<path class="v-rise" d="M122 86V22M110 34l12-12 12 12"/>',
    candles: '<path opacity=".35" d="M10 92H150"/>' +
      '<path d="M26 20v62M48 30v50M70 14v56M92 26v58M114 10v52M136 6v44"/>' +
      '<rect class="v-bar" x="20" y="36" width="12" height="30"/><rect class="v-bar"' + d(-.3) + ' x="42" y="42" width="12" height="26" fill="currentColor"/>' +
      '<rect class="v-bar"' + d(-.6) + ' x="64" y="26" width="12" height="30"/><rect class="v-bar"' + d(-.9) + ' x="86" y="38" width="12" height="30" fill="currentColor"/>' +
      '<rect class="v-bar"' + d(-1.2) + ' x="108" y="20" width="12" height="30"/><rect class="v-bar"' + d(-1.5) + ' x="130" y="14" width="12" height="24" fill="currentColor"/>',
    network: '<path class="v-dash" d="M80 52L30 28M80 52L80 16M80 52L132 30M80 52L46 80M80 52L116 82M30 28L80 16L132 30M46 80L116 82"/>' +
      '<circle cx="30" cy="28" r="5"/><circle cx="80" cy="16" r="5"/><circle cx="132" cy="30" r="5"/><circle cx="46" cy="80" r="5"/><circle cx="116" cy="82" r="5"/>' +
      '<circle class="v-pulse" cx="80" cy="52" r="8" fill="currentColor"/>',
    tower: '<path d="M76 92V30L80 4L84 30V92M60 92V50h12v42M88 92V44h12v48M44 92V62h12v30M104 92V58q8-10 16 0v34M14 92h132"/>' +
      '<circle class="v-blink" cx="66" cy="60" r="1.8" fill="currentColor"/><circle class="v-blink"' + d(-.5) + ' cx="94" cy="56" r="1.8" fill="currentColor"/>' +
      '<circle class="v-blink"' + d(-.9) + ' cx="50" cy="72" r="1.8" fill="currentColor"/><circle class="v-blink"' + d(-.3) + ' cx="112" cy="70" r="1.8" fill="currentColor"/>',
    doc: '<path d="M46 6h50l18 18v68H46z"/><path d="M96 6v18h18"/><path opacity=".55" d="M58 38h40M58 50h40M58 62h24"/>' +
      '<path class="v-draw" pathLength="1" d="M82 74l8 8 18-20"/>'
  };
  function viz(name, cls) {
    var body = VIZ[name] || VIZ.line;
    return '<svg class="viz ' + (cls || '') + '" viewBox="0 0 160 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  function injectViz() {
    $$('[data-viz-art]').forEach(function (el) { el.innerHTML = viz(el.getAttribute('data-viz-art'), 'viz--art'); });
  }

  /* ---------- Rotating Text ---------- */
  function rotatingText() {
    $$('.rotator').forEach(function (rot) {
      var words = rot.getAttribute('data-words').split('|'), i = 0;
      var holder = $('.rotator__word', rot);
      function render(word) {
        holder.innerHTML = '';
        word.split('').forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'rc'; s.textContent = ch === ' ' ? ' ' : ch;
          holder.appendChild(s);
        });
        return $$('.rc', holder);
      }
      render(words[0]);
      if (reduce || !G) return;
      setInterval(function () {
        if (document.hidden) return;
        G.to($$('.rc', holder), {
          yPercent: -110, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.018,
          onComplete: function () {
            i = (i + 1) % words.length;
            G.fromTo(render(words[i]), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.022 });
          }
        });
      }, 2800);
    });
  }

  /* ---------- Circular Text badge ---------- */
  function circularText() {
    $$('.orbit-badge svg').forEach(function (svg) {
      if (reduce || !G) return;
      var spin = G.to(svg, { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      var badge = svg.parentNode;
      badge.addEventListener('pointerenter', function () { G.to(spin, { timeScale: 5, duration: 0.6 }); });
      badge.addEventListener('pointerleave', function () { G.to(spin, { timeScale: 1, duration: 0.8 }); });
    });
  }

  /* ---------- Flowing Menu (animated charts, no stock photos) + detail drawer ---------- */
  function flowingMenu(onBook) {
    var drawer = $('#drawer');
    $$('.flow__item').forEach(function (item) {
      var words = (item.getAttribute('data-words') || '').split('|');
      var vizzes = (item.getAttribute('data-viz') || 'line').split(',');
      var marquee = document.createElement('div');
      marquee.className = 'flow__marquee'; marquee.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('div');
      inner.className = 'flow__marquee-inner';
      var html = '';
      for (var r = 0; r < 2; r++) {
        words.forEach(function (w, k) { html += '<span class="display">' + w + '</span><i class="pill">' + viz(vizzes[k % vizzes.length]) + '</i>'; });
      }
      inner.innerHTML = '<div class="flow__marquee-track"><div class="flow__marquee-part">' + html + '</div><div class="flow__marquee-part">' + html + '</div></div>';
      marquee.appendChild(inner);
      item.appendChild(marquee);
      if (G) G.set(marquee, { yPercent: 101, visibility: 'visible' });

      function edge(e) { var b = item.getBoundingClientRect(); return (e.clientY - b.top) < b.height / 2 ? 'top' : 'bottom'; }
      function show(from) {
        if (!G) { marquee.style.visibility = 'visible'; return; }
        G.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
          .set(marquee, { yPercent: from === 'top' ? -101 : 101 }, 0)
          .set(inner, { yPercent: from === 'top' ? 101 : -101 }, 0)
          .to([marquee, inner], { yPercent: 0 }, 0);
        item.classList.add('is-on');
      }
      function hide(to) {
        if (!G) { marquee.style.visibility = ''; return; }
        G.timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
          .to(marquee, { yPercent: to === 'top' ? -101 : 101 }, 0)
          .to(inner, { yPercent: to === 'top' ? 101 : -101 }, 0);
        item.classList.remove('is-on');
      }
      item._show = show; item._hide = hide;
      if (fine) {
        item.addEventListener('mouseenter', function (e) { show(edge(e)); });
        item.addEventListener('mouseleave', function (e) { hide(edge(e)); });
      }
      $('.flow__link', item).addEventListener('click', function () { openDrawer(item); });
    });

    if (!fine && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var it = en.target;
          if (en.isIntersecting && !it.classList.contains('is-on')) it._show(en.boundingClientRect.top > 0 ? 'bottom' : 'top');
          else if (!en.isIntersecting && it.classList.contains('is-on')) it._hide(en.boundingClientRect.top > window.innerHeight / 2 ? 'bottom' : 'top');
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      $$('.flow__item').forEach(function (it) { io.observe(it); });
    }

    function openDrawer(item) {
      if (!drawer) return;
      var tpl = $('.flow__detail', item);
      $('.drawer__content', drawer).innerHTML = tpl ? tpl.innerHTML : '';
      var media = (item.getAttribute('data-media') || '').split(',').filter(Boolean);
      $('.drawer__media', drawer).innerHTML = media.map(function (m) {
        var p = m.split(':');
        return p[0] === 'img' ? '<figure><img src="' + p[1] + '" alt="Ahmed Osama"></figure>' : '<figure class="is-viz">' + viz(p[1]) + '</figure>';
      }).join('');
      $('.drawer__cta', drawer).onclick = function (e) { e.preventDefault(); closeDrawer(); if (onBook) onBook(item.getAttribute('data-service')); };
      if (typeof drawer.showModal === 'function') drawer.showModal(); else drawer.setAttribute('open', '');
      document.documentElement.classList.add('drawer-open');
      if (window.__lenis) window.__lenis.stop();
      if (G && !reduce) {
        G.fromTo(drawer, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'expo.out' });
        G.fromTo($$('.drawer__media figure', drawer), { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.15 });
        G.fromTo($$('.drawer__content > *, .drawer__actions > *', drawer), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.25 });
      }
      if (window.Sound) Sound.tick();
    }
    function closeDrawer() {
      if (!drawer || !drawer.open) return;
      var done = function () {
        if (typeof drawer.close === 'function') drawer.close(); else drawer.removeAttribute('open');
        document.documentElement.classList.remove('drawer-open');
        if (window.__lenis) window.__lenis.start();
      };
      if (G && !reduce) G.to(drawer, { clipPath: 'inset(0 0 0 100%)', duration: 0.5, ease: 'power3.in', onComplete: done });
      else done();
    }
    if (drawer) {
      $('.drawer__close', drawer).addEventListener('click', closeDrawer);
      drawer.addEventListener('cancel', function (e) { e.preventDefault(); closeDrawer(); });
      drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    }
  }

  /* ---------- Video modal ---------- */
  function videoModal() {
    var dlg = $('#video'); if (!dlg) return;
    var frame = $('.vmodal__frame', dlg);
    function open(id, vertical) {
      frame.classList.toggle('is-vertical', !!vertical);
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      if (window.__lenis) window.__lenis.stop();
      if (window.Sound && Sound.isOn()) Sound.stop();
    }
    function close() {
      frame.innerHTML = '';
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
      if (window.__lenis) window.__lenis.start();
    }
    $$('[data-video]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(el.getAttribute('data-video'), el.hasAttribute('data-vertical')); });
    });
    $('.vmodal__close', dlg).addEventListener('click', close);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  }

  /* ---------- KoshariCode agent console ---------- */
  function agentConsole() {
    var box = $('.agent__log'); if (!box) return;
    var tasks = JSON.parse(box.getAttribute('data-tasks'));
    var started = false;
    function run() {
      box.innerHTML = '';
      var i = 0;
      (function nextLine() {
        if (i >= tasks.length) { setTimeout(run, 3500); return; }
        var t = tasks[i++];
        var li = document.createElement('li');
        li.innerHTML = '<span class="agent__cmd"></span><b class="agent__ok"></b>';
        box.appendChild(li);
        var cmd = $('.agent__cmd', li), ok = $('.agent__ok', li), c = 0;
        if (reduce) { cmd.textContent = t[0]; ok.textContent = t[1]; li.classList.add('is-done'); nextLine(); return; }
        (function type() {
          cmd.textContent = t[0].slice(0, ++c);
          if (c < t[0].length) setTimeout(type, 22);
          else setTimeout(function () { ok.textContent = t[1]; li.classList.add('is-done'); setTimeout(nextLine, 520); }, 420);
        })();
      })();
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; run(); } }, { threshold: 0.3 }).observe(box);
  }

  /* ---------- Magic Bento ---------- */
  function magicBento() {
    $$('.bcard').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
        card.style.setProperty('--my', (e.clientY - b.top) + 'px');
        if (G && fine && !reduce) {
          var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
          G.to(card, { rotateY: px * 7, rotateX: -py * 7, duration: 0.5, ease: 'power3.out', transformPerspective: 900 });
        }
      });
      card.addEventListener('pointerleave', function () { if (G) G.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' }); });
      var timer = null;
      card.addEventListener('pointerenter', function () {
        if (reduce || !G) return;
        clearInterval(timer);
        timer = setInterval(function () { particle(card); }, 140);
      });
      card.addEventListener('pointerleave', function () { clearInterval(timer); });
      card.addEventListener('click', function (e) {
        if (!G || reduce) return;
        var b = card.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
        var r = Math.max(Math.hypot(x, y), Math.hypot(b.width - x, y), Math.hypot(x, b.height - y), Math.hypot(b.width - x, b.height - y));
        var ring = document.createElement('i');
        ring.className = 'ripple';
        ring.style.cssText = 'left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + r * 2 + 'px;height:' + r * 2 + 'px';
        card.appendChild(ring);
        G.fromTo(ring, { scale: 0, opacity: 0.5 }, { scale: 1, opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: function () { ring.remove(); } });
        var c = $('.count', card); if (c && c._run) c._run();
      });
    });
    function particle(card) {
      var p = document.createElement('i'), b = card.getBoundingClientRect();
      p.className = 'particle';
      p.style.left = Math.random() * b.width + 'px'; p.style.top = Math.random() * b.height + 'px';
      card.appendChild(p);
      G.fromTo(p, { scale: 0, opacity: 1 }, { scale: 1, x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90, opacity: 0, duration: 1.6 + Math.random(), ease: 'power2.out', onComplete: function () { p.remove(); } });
    }
  }

  /* ---------- Pixel Transition cards ---------- */
  function pixelCards() {
    var N = 9;
    $$('.case').forEach(function (card) {
      var grid = document.createElement('div');
      grid.className = 'case__pixels'; grid.setAttribute('aria-hidden', 'true');
      var cells = [];
      for (var i = 0; i < N * N; i++) {
        var c = document.createElement('i');
        c.style.width = (100 / N) + '%'; c.style.height = (100 / N) + '%';
        c.style.left = (i % N) * (100 / N) + '%'; c.style.top = Math.floor(i / N) * (100 / N) + '%';
        grid.appendChild(c); cells.push(c);
      }
      card.appendChild(grid);
      var active = false, tl = null;
      function flip(on) {
        if (on === active) return;
        active = on;
        if (reduce || !G) { card.classList.toggle('is-flipped', on); return; }
        if (tl) tl.kill();
        G.set(cells, { opacity: 0 });
        tl = G.timeline()
          .to(cells, { opacity: 1, duration: 0.01, stagger: { each: 0.004, from: 'random' } })
          .add(function () { card.classList.toggle('is-flipped', on); })
          .to(cells, { opacity: 0, duration: 0.01, stagger: { each: 0.004, from: 'random' } }, '+=0.05');
        if (window.Sound) Sound.tick();
      }
      if (fine) {
        card.addEventListener('mouseenter', function () { flip(true); });
        card.addEventListener('mouseleave', function () { flip(false); });
      }
      card.addEventListener('click', function () { if (!fine) flip(!active); });
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(!active); } });
    });
  }

  /* ---------- Image Trail: self-drawing line art in Art-Deco frames ---------- */
  function imageTrail() {
    var stage = $('.trail__stage');
    if (!stage || reduce || !G) return;
    var names = stage.getAttribute('data-trail').split(',');
    var k = 0, last = null;
    function drop(x, y) {
      var el = document.createElement('div');
      el.className = 'trail__item';
      el.innerHTML = viz(names[k++ % names.length], 'viz--trail');
      el.style.left = x + 'px'; el.style.top = y + 'px';
      stage.appendChild(el);
      var paths = $$('path, circle, rect, ellipse', el);
      G.set(paths, { attr: { pathLength: 1 }, strokeDasharray: 1, strokeDashoffset: 1 });
      G.timeline({ onComplete: function () { el.remove(); } })
        .fromTo(el, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0, rotate: (Math.random() - 0.5) * 12 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' })
        .to(paths, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', stagger: 0.03 }, 0)
        .to(el, { scale: 0.75, opacity: 0, y: 50, duration: 0.8, ease: 'power2.in' }, '+=0.5');
    }
    var sec = stage.parentNode;
    sec.addEventListener('pointermove', function (e) {
      var b = stage.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      if (!last || Math.hypot(x - last.x, y - last.y) > 110) { drop(x, y); last = { x: x, y: y }; }
    });
    if (!fine) {
      var t = 0, tick = null;
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          tick = setInterval(function () {
            var b = stage.getBoundingClientRect(); t += 0.6;
            drop(b.width / 2 + Math.sin(t) * b.width * 0.3, b.height / 2 + Math.sin(t * 1.7) * b.height * 0.26);
          }, 420);
        } else clearInterval(tick);
      }, { threshold: 0.3 }).observe(sec);
    }
  }

  /* ---------- Click Spark ---------- */
  function clickSpark() {
    var cv = $('#sparks');
    if (!cv || reduce) return;
    var ctx = cv.getContext('2d'), sparks = [], running = false, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    function loop(now) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      sparks = sparks.filter(function (s) {
        var t = (now - s.t0) / 450; if (t >= 1) return false;
        var e = t * (2 - t), dd = e * 26, len = 12 * (1 - e);
        ctx.strokeStyle = 'rgba(236,230,216,' + (1 - t) + ')'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x + dd * Math.cos(s.a), s.y + dd * Math.sin(s.a));
        ctx.lineTo(s.x + (dd + len) * Math.cos(s.a), s.y + (dd + len) * Math.sin(s.a));
        ctx.stroke();
        return true;
      });
      if (sparks.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    document.addEventListener('pointerdown', function (e) {
      var now = performance.now();
      for (var i = 0; i < 8; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 8, t0: now });
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
  }

  /* ---------- Scramble text on hover ---------- */
  function scramble() {
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%&#*+';
    $$('[data-scramble]').forEach(function (el) {
      if (el.children.length) return;
      var orig = el.textContent, raf = 0;
      el.addEventListener('pointerenter', function () {
        if (reduce) return;
        var start = performance.now(), dur = 420;
        cancelAnimationFrame(raf);
        (function step(now) {
          var p = Math.min(1, (now - start) / dur), out = '';
          for (var i = 0; i < orig.length; i++) out += (orig[i] === ' ' || i < p * orig.length) ? orig[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
          el.textContent = out;
          if (p < 1) raf = requestAnimationFrame(step); else el.textContent = orig;
        })(start);
      });
    });
  }

  /* ---------- Scroll Velocity marquee ---------- */
  function scrollVelocity() {
    var track = $('.marquee__track');
    if (!track || reduce || !G) return;
    track.style.animation = 'none';
    var x = 0, skew = G.quickSetter(track, 'skewX', 'deg'), set = G.quickSetter(track, 'x', 'px');
    G.ticker.add(function () {
      var v = window.__lenis ? window.__lenis.velocity : 0, dir = v < -0.1 ? -1 : 1;
      x += -0.6 * dir - Math.abs(v) * 0.45 * dir;
      var half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      set(x);
      skew(Math.max(-8, Math.min(8, -v * 0.35)));
    });
  }

  /* ---------- Typewriter ---------- */
  function typewriter() {
    $$('.type').forEach(function (el) {
      var lines = el.getAttribute('data-type').split('|'), li = 0, ci = 0, del = false;
      if (reduce) { el.textContent = lines[0]; return; }
      (function tick() {
        var word = lines[li];
        el.textContent = word.slice(0, ci);
        if (!del && ci < word.length) ci++;
        else if (!del) { del = true; return setTimeout(tick, 1400); }
        else if (ci > 0) ci--;
        else { del = false; li = (li + 1) % lines.length; }
        setTimeout(tick, del ? 35 : 75);
      })();
    });
  }

  return {
    viz: viz,
    init: function (opts) {
      opts = opts || {};
      injectViz(); rotatingText(); circularText(); flowingMenu(opts.onBook); videoModal(); agentConsole();
      magicBento(); pixelCards(); imageTrail(); clickSpark(); scramble(); scrollVelocity(); typewriter();
    }
  };
})();

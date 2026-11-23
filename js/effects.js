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
    card: '<rect x="22" y="14" width="116" height="72" rx="10"/><path d="M22 34h116"/><rect x="34" y="46" width="18" height="13" rx="2"/>' +
      '<path opacity=".55" d="M34 72h40"/>' +
      '<rect class="v-blink" x="84" y="62" width="10" height="10" rx="2" fill="currentColor"/><rect class="v-blink"' + d(-.3) + ' x="98" y="62" width="10" height="10" rx="2" fill="currentColor"/>' +
      '<rect class="v-blink"' + d(-.6) + ' x="112" y="62" width="10" height="10" rx="2" fill="currentColor"/><rect class="v-blink"' + d(-.9) + ' x="126" y="62" width="10" height="10" rx="2"/>',
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
    $$('.orbit-badge__ring').forEach(function (svg) {
      if (reduce || !G) return;
      var spin = G.to(svg, { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      var badge = svg.parentNode;
      badge.addEventListener('pointerenter', function () { G.to(spin, { timeScale: 5, duration: 0.6 }); });
      badge.addEventListener('pointerleave', function () { G.to(spin, { timeScale: 1, duration: 0.8 }); });
    });
  }

  /* ---------- Flowing Menu (animated charts, no stock photos) + detail drawer ---------- */
  function flowingMenu() {
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
      $('.flow__link', item).addEventListener('click', function () {
        var tpl = $('.flow__detail', item);
        openDrawer(tpl ? tpl.innerHTML : '', [], item.getAttribute('data-service'));
      });
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

  }

  /* ---------- Side panel shared by the pillars and the case studies ---------- */
  var drawer = null, bookFn = null;
  function openDrawer(html, media, service) {
    if (!drawer) return;
    $('.drawer__content', drawer).innerHTML = html;
    drawer.classList.toggle('no-media', !(media || []).filter(Boolean).length);
    $('.drawer__media', drawer).innerHTML = (media || []).filter(Boolean).map(function (m) {
      var p = m.split(':');
      return p[0] === 'img' ? '<figure><img src="' + p[1] + '" alt="Ahmed Osama"></figure>' : '<figure class="is-viz">' + viz(p[1]) + '</figure>';
    }).join('');
    $('.drawer__cta', drawer).onclick = function (e) { e.preventDefault(); closeDrawer(); if (bookFn) bookFn(service); };
    if (typeof drawer.showModal === 'function') drawer.showModal(); else drawer.setAttribute('open', '');
    drawer.scrollTop = 0;
    document.documentElement.classList.add('drawer-open');
    if (window.__lenis) window.__lenis.stop();
    if (G && !reduce) {
      G.fromTo(drawer, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'expo.out' });
      G.fromTo($$('.drawer__media figure', drawer), { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.15 });
      G.fromTo($$('.drawer__content > *, .drawer__actions > *', drawer), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.04, ease: 'power3.out', delay: 0.25 });
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
  function setupDrawer(onBook) {
    drawer = $('#drawer'); bookFn = onBook;
    if (!drawer) return;
    $('.drawer__close', drawer).addEventListener('click', closeDrawer);
    drawer.addEventListener('cancel', function (e) { e.preventDefault(); closeDrawer(); });
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
  }

  /* ---------- Case studies: challenge, solution, execution, outcome ---------- */
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function openCase(id) {
    var c = (window.CASES || {})[id]; if (!c) return;
    var h = '<p class="label">' + esc(c.label) + '</p><h3 class="display case-title">' + esc(c.title) + '</h3>';
    if (c.meta) h += '<dl class="cmeta">' + c.meta.map(function (m) { return '<div><dt>' + esc(m[0]) + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') + '</dl>';
    if (c.outcome) h += '<h4 class="label csub">Results</h4><ul class="outcomes">' + c.outcome.map(function (o) { return '<li><b class="display">' + esc(o[0]) + '</b><span>' + esc(o[1]) + '</span></li>'; }).join('') + '</ul>';
    var n = 0, steps = '';
    [['Challenge', c.challenge], ['Solution', c.solution], ['Overview', c.overview]].forEach(function (x) {
      if (x[1]) steps += '<div class="cstep"><span class="cstep__n display">0' + (++n) + '</span><h4>' + x[0] + '</h4><p>' + esc(x[1]) + '</p></div>';
    });
    if (c.execution) steps += '<div class="cstep"><span class="cstep__n display">0' + (++n) + '</span><h4>Execution</h4><ul class="ticks">' + c.execution.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="csteps">' + steps + '</div>';
    if (c.note) h += '<p class="fineprint">' + esc(c.note) + '</p>';
    openDrawer(h, [], c.service);
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
          .to(cells, { opacity: 1, duration: 0.01, stagger: { each: 0.0016, from: 'random' } })
          .add(function () { card.classList.toggle('is-flipped', on); })
          .to(cells, { opacity: 0, duration: 0.01, stagger: { each: 0.0016, from: 'random' } }, '+=0.02')
          .add(function () { G.set(cells, { opacity: 0 }); });
        if (window.Sound) Sound.tick();
      }
      var id = card.getAttribute('data-case');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', ($('h3', card) || card).textContent.trim() + ', open the case study');
      if (fine) {
        card.addEventListener('mouseenter', function () { flip(true); });
        card.addEventListener('mouseleave', function () { flip(false); });
      }
      card.addEventListener('focus', function () { flip(true); });
      card.addEventListener('blur', function () { flip(false); });
      // mouse: click opens the case; touch: first tap reveals the result, second tap opens
      card.addEventListener('click', function () {
        if (!fine && !active) { flip(true); return; }
        openCase(id);
      });
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(id); } });
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
    var x = 0, skew = G.quickSetter(track, 'skewX', 'deg'), set = G.quickSetter(track, 'x', 'px'), seen = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; }).observe(track);
    G.ticker.add(function () {
      if (!seen) return;
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

  /* ---------- Brand names turn into line-drawn logos on hover / tap ---------- */
  function brandLogos() {
    var L = window.BRAND_LOGOS || {}, S = window.BRAND_SITES || {}, all = [];
    $$('.premium li, .chips li').forEach(function (li) {
      var name = li.textContent.trim(), d = L[name], art;
      if (d) {
        art = '<svg class="bl__logo" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="' + d + '"/></svg>';
      } else {
        var ini = name.replace(/[^A-Za-z0-9 .-]/g, '').split(/[\s.-]+/).filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        art = '<svg class="bl__logo bl__logo--mono" viewBox="0 0 24 24" aria-hidden="true"><circle pathLength="1" cx="12" cy="12" r="10.6"/><circle pathLength="1" cx="12" cy="12" r="8.6"/><text x="12" y="15.3" text-anchor="middle">' + ini + '</text></svg>';
      }
      var url = S[name];
      var inner = '<span class="bl__name">' + li.innerHTML + '</span>' + art + (url ? '<i class="bl__go" aria-hidden="true">\u2197</i>' : '');
      li.innerHTML = url ? '<a class="bl__link" href="' + url + '" target="_blank" rel="noopener" aria-label="' + name + ' official website">' + inner + '</a>' : inner;
      li.classList.add('bl');
      li.setAttribute('title', url ? name + ' \u2014 official website' : name);
      all.push(li);
      var svg = li.querySelector('.bl__logo'), fitted = false;
      function fit() {
        // crop the viewBox tight around the logo so wide wordmarks fill the tile, then keep strokes ~1px
        if (!fitted && !svg.classList.contains('bl__logo--mono')) {
          try { var b = svg.querySelector('path').getBBox(); if (b.width && b.height) svg.setAttribute('viewBox', [b.x - 0.4, b.y - 0.4, b.width + 0.8, b.height + 0.8].join(' ')); } catch (e) { /* not rendered yet */ }
          fitted = true;
        }
        var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
        var scale = Math.min(r.width / vb.width, r.height / vb.height) || 1;
        svg.style.setProperty('--sw', (li.closest('.chips') ? 0.9 : 1.15) / scale);
      }
      function on() { fit(); li.classList.add('is-logo'); if (window.Sound) Sound.tick(); }
      function off() { li.classList.remove('is-logo'); }
      if (fine) { li.addEventListener('pointerenter', on); li.addEventListener('pointerleave', off); }
      else {
        // touch: first tap draws the logo, second tap opens the official website
        li.addEventListener('click', function (e) {
          if (!li.classList.contains('is-logo')) {
            e.preventDefault();
            all.forEach(function (o) { if (o !== li) o.classList.remove('is-logo'); });
            on();
          }
        });
      }
    });
  }

  /* ---------- Entry gate: blinking eye buttons ---------- */
  function eyeSVG(id) {
    var shape = 'M8 48Q80-14 152 48Q80 110 8 48Z', fibers = '';
    for (var a = 0; a < 360; a += 20) {
      var c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
      fibers += 'M' + (80 + c * 12.5).toFixed(1) + ' ' + (48 + s * 12.5).toFixed(1) + 'L' + (80 + c * 23.5).toFixed(1) + ' ' + (48 + s * 23.5).toFixed(1);
    }
    return '<svg class="eye" viewBox="0 0 160 96" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="' + shape + '"/></clipPath></defs>' +
      '<path class="eye__crease" d="M14 22Q80-26 146 22"/>' +
      '<g class="eye__lids"><g clip-path="url(#' + id + ')"><path class="eye__white" d="' + shape + '"/>' +
      '<g class="eye__look"><circle class="eye__iris" cx="80" cy="48" r="25"/><path class="eye__fibers" d="' + fibers + '"/>' +
      '<circle class="eye__pupil" cx="80" cy="48" r="10.5"/><circle class="eye__glint" cx="88" cy="40" r="3.2"/></g></g>' +
      '<path class="eye__outline" d="' + shape + '"/>' +
      '<path class="eye__lashes" d="M36.8 28.2L28.8 22.3M58.4 19.8L53.7 11M80 17V6M101.6 19.8L106.3 11M123.2 28.2L131.2 22.3"/></g></svg>';
  }
  function eyes(root) {
    var items = $$('.eye-btn', root).map(function (b, i) {
      var holder = $('[data-eye]', b);
      if (holder) holder.outerHTML = eyeSVG('eyeclip' + i);
      return { b: b, lids: $('.eye__lids', b), look: $('.eye__look', b), svg: $('svg.eye', b), t: 0 };
    });
    if (!G) return null;
    G.set(items.map(function (it) { return it.lids; }), { transformOrigin: '50% 62%' });
    function blinkOne(it, times) {
      var tl = G.timeline();
      for (var i = 0; i < (times || 1); i++) {
        tl.to(it.lids, { scaleY: 0.04, duration: 0.07, ease: 'power2.in' })
          .to(it.lids, { scaleY: 1, duration: 0.14, ease: 'power2.out' }, '+=0.03');
      }
      return tl;
    }
    var alive = true;
    items.forEach(function (it) {
      (function loop() {
        it.t = setTimeout(function () { if (!alive) return; blinkOne(it, Math.random() < 0.25 ? 2 : 1); loop(); }, 1800 + Math.random() * 3400);
      })();
      it.b.addEventListener('pointerenter', function () { G.to(it.lids, { scaleY: 1.12, duration: 0.35, ease: 'power3.out' }); });
      it.b.addEventListener('pointerleave', function () { G.to(it.lids, { scaleY: 1, duration: 0.5, ease: 'power3.out' }); });
    });
    function onMove(e) {
      items.forEach(function (it) {
        var r = it.svg.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        G.to(it.look, { x: Math.max(-16, Math.min(16, dx / 16)), y: Math.max(-7, Math.min(7, dy / 26)), duration: 0.45, ease: 'power3.out' });
      });
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    return {
      blink: function (btn, done) {
        var tl = G.timeline({ onComplete: done });
        items.forEach(function (it) { tl.add(blinkOne(it, it.b === btn ? 2 : 1), 0); });
        return tl;
      },
      destroy: function () {
        alive = false;
        items.forEach(function (it) { clearTimeout(it.t); });
        window.removeEventListener('pointermove', onMove);
      }
    };
  }

  /* ---------- Entry gate: neuron brain (canvas) ---------- */
  function brain(canvas) {
    if (!canvas || !canvas.getContext) return function () {};
    var ctx = canvas.getContext('2d');
    var OUT = 'M30 70C18 66 12 52 20 42C14 30 24 16 38 18C44 8 60 6 70 14C80 6 96 8 102 18C116 16 126 30 120 42C128 52 122 66 110 70C108 80 96 86 86 82C80 90 60 90 54 82C44 86 32 80 30 70Z';
    var outline = new Path2D(OUT);
    var fissure = new Path2D('M70 14C67 28 73 40 70 52C67 64 72 74 70 86');
    var gyri = new Path2D('M34 34C42 30 48 36 56 32M26 52C34 48 42 54 52 50M38 68C46 64 52 70 60 66M84 32C92 36 100 30 108 34M88 50C96 54 104 48 114 52M80 66C88 70 96 64 104 68');
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W, H;
    function size() {
      W = canvas.clientWidth || 160; H = canvas.clientHeight || 115;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    size();
    // neurons scattered inside the brain outline, 140 x 100 design space
    var nodes = [], tries = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    while (nodes.length < 46 && tries++ < 4000) {
      var x = 14 + Math.random() * 112, y = 8 + Math.random() * 82;
      if (!ctx.isPointInPath(outline, x, y)) continue;
      if (nodes.some(function (n) { return Math.hypot(n.x - x, n.y - y) < 9.5; })) continue;
      nodes.push({ x: x, y: y, g: 0, links: [] });
    }
    var edges = [];
    nodes.forEach(function (n, i) {
      nodes.map(function (m, j) { return { j: j, d: Math.hypot(m.x - n.x, m.y - n.y) }; })
        .filter(function (o) { return o.j !== i; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 3)
        .forEach(function (o) {
          if (edges.some(function (e) { return (e.a === i && e.b === o.j) || (e.a === o.j && e.b === i); })) return;
          var k = edges.length; edges.push({ a: i, b: o.j });
          n.links.push(k); nodes[o.j].links.push(k);
        });
    });
    var signals = [], running = true, last = performance.now(), spawn = 0, raf = 0;
    function fire(from) {
      var n = nodes[from]; if (!n || !n.links.length) return;
      var k = n.links[Math.floor(Math.random() * n.links.length)], e = edges[k];
      signals.push({ e: k, from: from, to: e.a === from ? e.b : e.a, t: 0, v: 1.4 + Math.random() * 1.2 });
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      spawn -= dt;
      if (spawn <= 0 && signals.length < 26) { fire(Math.floor(Math.random() * nodes.length)); spawn = 0.09; }
      var sx = W / 140, sy = H / 100;
      ctx.setTransform(dpr * sx, 0, 0, dpr * sy, 0, 0);
      ctx.clearRect(0, 0, 140, 100);
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(236,230,216,.55)'; ctx.lineWidth = 1.1 / sx; ctx.stroke(outline);
      ctx.strokeStyle = 'rgba(236,230,216,.28)'; ctx.lineWidth = 0.8 / sx; ctx.stroke(fissure); ctx.stroke(gyri);
      ctx.strokeStyle = 'rgba(236,230,216,.16)'; ctx.lineWidth = 0.6 / sx;
      ctx.beginPath();
      edges.forEach(function (e) { var a = nodes[e.a], b = nodes[e.b]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); });
      ctx.stroke();
      signals = signals.filter(function (s) {
        s.t += dt * s.v;
        var a = nodes[s.from], b = nodes[s.to];
        if (s.t >= 1) { b.g = 1; if (Math.random() < 0.55) fire(s.to); return false; }
        var x = a.x + (b.x - a.x) * s.t, y = a.y + (b.y - a.y) * s.t;
        ctx.strokeStyle = 'rgba(255,250,238,.85)'; ctx.lineWidth = 1 / sx;
        ctx.beginPath(); ctx.moveTo(a.x + (b.x - a.x) * Math.max(0, s.t - 0.25), a.y + (b.y - a.y) * Math.max(0, s.t - 0.25)); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      nodes.forEach(function (n) {
        n.g = Math.max(0, n.g - dt * 1.6);
        if (n.g > 0.02) { ctx.fillStyle = 'rgba(236,230,216,' + (0.18 * n.g).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, 4.5 * n.g + 1.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = 'rgba(236,230,216,' + (0.45 + n.g * 0.55).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.1 + n.g * 1.1, 0, Math.PI * 2); ctx.fill();
      });
      if (running) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', size);
    return function stop() { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }

  return {
    viz: viz,
    eyes: eyes,
    brain: brain,
    openCase: openCase,
    init: function (opts) {
      opts = opts || {};
      setupDrawer(opts.onBook);
      injectViz(); brandLogos(); rotatingText(); circularText(); flowingMenu(); videoModal(); agentConsole();
      magicBento(); pixelCards(); imageTrail(); clickSpark(); scramble(); scrollVelocity(); typewriter();
    }
  };
})();

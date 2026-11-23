/* =========================================================
   Interactive effects, inspired by React Bits components and
   rebuilt in plain JavaScript on top of GSAP:
   Rotating Text · Circular Text · Flowing Menu · Magic Bento ·
   Pixel Transition · Image Trail · Click Spark · Scramble Text ·
   Scroll Velocity · Typewriter
   ========================================================= */
window.Effects = (function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = window.gsap;
  function img(id, w) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 600) + '&q=70'; }

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
        var old = $$('.rc', holder);
        G.to(old, {
          yPercent: -110, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: { each: 0.018, from: 'start' },
          onComplete: function () {
            i = (i + 1) % words.length;
            var chars = render(words[i]);
            G.fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.022 });
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

  /* ---------- Flowing Menu + detail drawer ---------- */
  function flowingMenu(onBook) {
    var drawer = $('#drawer');
    $$('.flow__item').forEach(function (item) {
      var words = (item.getAttribute('data-words') || '').split('|');
      var imgs = (item.getAttribute('data-images') || '').split(',');
      var marquee = document.createElement('div');
      marquee.className = 'flow__marquee'; marquee.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('div');
      inner.className = 'flow__marquee-inner';
      var html = '';
      for (var r = 0; r < 2; r++) {
        words.forEach(function (w, k) {
          html += '<span class="display">' + w + '</span><img src="' + img(imgs[k % imgs.length], 420) + '" alt="" loading="lazy">';
        });
      }
      inner.innerHTML = '<div class="flow__marquee-track"><div class="flow__marquee-part">' + html + '</div><div class="flow__marquee-part">' + html + '</div></div>';
      marquee.appendChild(inner);
      item.appendChild(marquee);
      if (G) G.set(marquee, { yPercent: 101, visibility: 'visible' });

      function edge(e) {
        var r = item.getBoundingClientRect();
        return (e.clientY - r.top) < r.height / 2 ? 'top' : 'bottom';
      }
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

    // touch screens: the line in the middle of the screen comes alive
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
      var imgs = (item.getAttribute('data-images') || '').split(',');
      $('.drawer__media', drawer).innerHTML = imgs.slice(0, 3).map(function (id) { return '<img src="' + img(id, 700) + '" alt="">'; }).join('');
      var cta = $('.drawer__cta', drawer);
      cta.onclick = function (e) {
        e.preventDefault();
        closeDrawer();
        if (onBook) onBook(item.getAttribute('data-service'));
      };
      if (typeof drawer.showModal === 'function') drawer.showModal(); else drawer.setAttribute('open', '');
      document.documentElement.classList.add('drawer-open');
      if (window.__lenis) window.__lenis.stop();
      if (G && !reduce) {
        G.fromTo(drawer, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'expo.out' });
        G.fromTo($$('.drawer__media img', drawer), { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.15 });
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

  /* ---------- Magic Bento: border glow, particles, tilt, click ripple ---------- */
  function magicBento() {
    $$('.bcard').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        if (G && fine && !reduce) {
          var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          G.to(card, { rotateY: px * 7, rotateX: -py * 7, duration: 0.5, ease: 'power3.out', transformPerspective: 900 });
        }
      });
      card.addEventListener('pointerleave', function () { if (G) G.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' }); });
      var timer = null;
      card.addEventListener('pointerenter', function () {
        if (reduce || !G) return;
        clearInterval(timer);
        timer = setInterval(function () { particle(card); }, 140);
        card.classList.add('is-live');
      });
      card.addEventListener('pointerleave', function () { clearInterval(timer); card.classList.remove('is-live'); });
      card.addEventListener('click', function (e) {
        if (!G || reduce) return;
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var d = Math.max(Math.hypot(x, y), Math.hypot(r.width - x, y), Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y));
        var ring = document.createElement('i');
        ring.className = 'ripple';
        ring.style.cssText = 'left:' + (x - d) + 'px;top:' + (y - d) + 'px;width:' + d * 2 + 'px;height:' + d * 2 + 'px';
        card.appendChild(ring);
        G.fromTo(ring, { scale: 0, opacity: 0.5 }, { scale: 1, opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: function () { ring.remove(); } });
        var c = $('.count', card); if (c && c._run) c._run();
      });
    });
    function particle(card) {
      var p = document.createElement('i');
      p.className = 'particle';
      var r = card.getBoundingClientRect();
      p.style.left = Math.random() * r.width + 'px';
      p.style.top = Math.random() * r.height + 'px';
      card.appendChild(p);
      G.fromTo(p, { scale: 0, opacity: 1 }, {
        scale: 1, x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90, opacity: 0,
        duration: 1.6 + Math.random(), ease: 'power2.out', onComplete: function () { p.remove(); }
      });
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

  /* ---------- Image Trail ---------- */
  function imageTrail() {
    var stage = $('.trail__stage');
    if (!stage || reduce || !G) return;
    var ids = stage.getAttribute('data-trail').split(',');
    var urls = ids.map(function (id) { return img(id, 420); });
    urls.forEach(function (u) { var im = new Image(); im.src = u; });
    var k = 0, last = null;
    function drop(x, y) {
      var el = document.createElement('img');
      el.src = urls[k++ % urls.length]; el.alt = ''; el.className = 'trail__img';
      el.style.left = x + 'px'; el.style.top = y + 'px';
      stage.appendChild(el);
      G.timeline({ onComplete: function () { el.remove(); } })
        .fromTo(el, { xPercent: -50, yPercent: -50, scale: 0.4, opacity: 0, rotate: (Math.random() - 0.5) * 16 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' })
        .to(el, { scale: 0.7, opacity: 0, y: 60, duration: 0.8, ease: 'power2.in' }, '+=0.35');
    }
    var sec = stage.parentNode;
    sec.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      if (!last || Math.hypot(x - last.x, y - last.y) > 90) { drop(x, y); last = { x: x, y: y }; }
    });
    // auto-play on touch screens while the section is on screen
    if (!fine) {
      var t = 0, tick = null;
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          tick = setInterval(function () {
            var r = stage.getBoundingClientRect();
            t += 0.55;
            drop(r.width / 2 + Math.sin(t) * r.width * 0.32, r.height / 2 + Math.sin(t * 1.7) * r.height * 0.28);
          }, 320);
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
        var e = t * (2 - t), d = e * 26, len = 12 * (1 - e);
        var x1 = s.x + d * Math.cos(s.a), y1 = s.y + d * Math.sin(s.a);
        var x2 = s.x + (d + len) * Math.cos(s.a), y2 = s.y + (d + len) * Math.sin(s.a);
        ctx.strokeStyle = 'rgba(236,230,216,' + (1 - t) + ')'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
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
      if (el.children.length) return; // only plain-text elements
      var orig = el.textContent, raf = 0;
      el.addEventListener('pointerenter', function () {
        if (reduce) return;
        var start = performance.now(), dur = 420;
        cancelAnimationFrame(raf);
        (function step(now) {
          var p = Math.min(1, (now - start) / dur), out = '';
          for (var i = 0; i < orig.length; i++) {
            if (orig[i] === ' ' || i < p * orig.length) out += orig[i];
            else out += glyphs[Math.floor(Math.random() * glyphs.length)];
          }
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
    var x = 0, base = -0.6, skew = G.quickSetter(track, 'skewX', 'deg');
    var set = G.quickSetter(track, 'x', 'px');
    G.ticker.add(function () {
      var v = window.__lenis ? window.__lenis.velocity : 0;
      var dir = v < -0.1 ? -1 : 1;
      x += base * dir - Math.abs(v) * 0.45 * dir;
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

  /* ---------- Personal photos (assets/me/me-1.jpg … me-N.jpg, N set in config.js) ---------- */
  function personalPhotos(count) {
    var sec = $('#me'), grid = $('.me__grid');
    if (!sec || !grid || !count) return;
    var found = 0;
    for (var i = 1; i <= count; i++) {
      (function (n) {
        var im = new Image();
        im.onload = function () {
          found++;
          var fig = document.createElement('figure');
          fig.className = 'me__shot';
          fig.style.order = n;
          fig.innerHTML = '<img src="' + im.src + '" alt="Ahmed Osama">';
          grid.appendChild(fig);
          if (found === 1) { sec.hidden = false; if (window.ScrollTrigger) ScrollTrigger.refresh(); }
        };
        im.src = 'assets/me/me-' + n + '.jpg';
      })(i);
    }
  }

  return {
    init: function (opts) {
      opts = opts || {};
      rotatingText(); circularText(); flowingMenu(opts.onBook); magicBento(); pixelCards();
      imageTrail(); clickSpark(); scramble(); scrollVelocity(); typewriter(); personalPhotos(opts.photos || 0);
    }
  };
})();

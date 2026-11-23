/* =========================================================
   Ahmed Osama — cinematic monochrome edition
   GSAP + ScrollTrigger + SplitText · Lenis · WebGL stage · Web Audio
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ---------- Contact details & social links ---------- */
  var ICONS = {
    linkedin: 'fa-brands fa-linkedin-in', youtube: 'fa-brands fa-youtube', tiktok: 'fa-brands fa-tiktok',
    instagram: 'fa-brands fa-instagram', x: 'fa-brands fa-x-twitter', facebook: 'fa-brands fa-facebook-f', whatsapp: 'fa-brands fa-whatsapp'
  };
  var social = Object.assign({}, CFG.social || {});
  if (CFG.whatsapp) social.whatsapp = 'https://wa.me/' + CFG.whatsapp;
  $$('[data-email]').forEach(function (a) { if (CFG.email) { a.href = 'mailto:' + CFG.email; a.textContent = CFG.email; } });
  $$('[data-phone]').forEach(function (a) { if (CFG.phoneLink) { a.href = 'tel:' + CFG.phoneLink; a.textContent = CFG.phoneDisplay; } });
  $$('[data-whatsapp]').forEach(function (a) { if (social.whatsapp) a.href = social.whatsapp; });
  $$('[data-social]').forEach(function (el) {
    var url = social[el.getAttribute('data-social')];
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; }
    else {
      el.classList.add('is-soon'); el.setAttribute('aria-disabled', 'true');
      var cta = $('.channel__cta', el); if (cta) cta.textContent = 'Coming soon';
    }
  });
  $$('[data-socials]').forEach(function (wrap) {
    ['linkedin', 'youtube', 'tiktok', 'instagram', 'x', 'facebook', 'whatsapp'].forEach(function (k) {
      if (!social[k]) return;
      var a = document.createElement('a');
      a.href = social[k]; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', k.charAt(0).toUpperCase() + k.slice(1));
      a.innerHTML = '<i class="' + ICONS[k] + '"></i>';
      wrap.appendChild(a);
    });
  });
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Toast & copy ---------- */
  var toastEl = $('.toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(
        function () { toast('Copied: ' + v); }, function () { toast(v); });
    });
  });

  /* ---------- Sound ---------- */
  var soundBtn = $('.sound-btn');
  function syncSound() { soundBtn.setAttribute('aria-pressed', String(window.Sound && Sound.isOn())); }
  soundBtn.addEventListener('click', function () { if (window.Sound) { Sound.toggle(); syncSound(); } });
  var lastTick = 0;
  document.addEventListener('pointerover', function (e) {
    if (!window.Sound || !Sound.isOn()) return;
    if (!e.target.closest('a, button, summary, .pills label')) return;
    var now = performance.now(); if (now - lastTick < 90) return; lastTick = now;
    Sound.tick();
  });

  /* ---------- Contact form → WhatsApp / email ---------- */
  var form = $('#contactForm');
  if (form) {
    var lastSend = 'whatsapp';
    $$('[data-send]', form).forEach(function (b) { b.addEventListener('click', function () { lastSend = b.getAttribute('data-send'); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('name') || '').trim(), msg = (d.get('message') || '').trim();
      var err = $('.form__error', form);
      if (!name || !msg) { err.hidden = false; return; }
      err.hidden = true;
      var lines = ['Hello Ahmed,', '', msg, '', 'Interested in: ' + d.get('service'), 'Name: ' + name];
      if (d.get('company')) lines.push('Company: ' + d.get('company'));
      if (d.get('email')) lines.push('Email: ' + d.get('email'));
      if (d.get('phone')) lines.push('Phone: ' + d.get('phone'));
      var text = lines.join('\n');
      if (lastSend === 'email') {
        var subject = 'Consultation request: ' + d.get('service') + ' (' + name + ')';
        window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      } else {
        window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
      toast('Opening ' + (lastSend === 'email' ? 'your email app' : 'WhatsApp') + '…');
    });
    $$('[data-service]').forEach(function (a) {
      a.addEventListener('click', function () {
        var r = $('input[name="service"][value="' + a.getAttribute('data-service') + '"]', form);
        if (r) r.checked = true;
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $('.nav__burger'), menu = $('#menu'), lenis = null;
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && hasGsap && !reduce) {
      gsap.fromTo($$('.menu__links a'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: 'power3.out', delay: 0.25 });
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Services slider (works with or without GSAP) ---------- */
  var slider = $('.slider');
  var goTo = function () {};
  if (slider) {
    var track = $('.slider__track', slider), slides = $$('.slide', slider);
    var current = 0, countEl = $('.slider__current', slider), dotsWrap = $('.slider__dots', slider);
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Service ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
    });
    var dots = $$('button', dotsWrap);
    goTo = function (i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * current) + '%)';
      countEl.textContent = String(current + 1).padStart(2, '0');
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === current)); });
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== current)); s.inert = k !== current; });
      if (hasGsap && !reduce) {
        var s = slides[current];
        gsap.fromTo($('.slide__art', s), { scale: 0.92, opacity: 0.2 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.15 });
        gsap.fromTo($$('.slide__body > *', s), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.9, ease: 'power3.out', delay: 0.25 });
      }
      if (window.Sound) Sound.tick();
    };
    $$('.slider__btn', slider).forEach(function (b) { b.addEventListener('click', function () { goTo(current + Number(b.getAttribute('data-dir'))); }); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });
    var sx = null;
    slider.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    slider.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    });
    // first state without animation
    track.style.transform = 'translateX(0)';
    countEl.textContent = '01';
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === 0)); });
    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== 0)); s.inert = k !== 0; });
  }

  /* ---------- Static fallback ---------- */
  if (!hasGsap) {
    document.documentElement.classList.remove('js');
    window.__siteReady = true;
    return;
  }
  window.__siteReady = true;
  // the film always starts at the top (no jump to an old scroll position on reload)
  if (!location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- Lenis smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var el = document.querySelector(id); if (!el) return;
      e.preventDefault();
      if (menu.classList.contains('is-open')) setMenu(false);
      var y = id === '#story' ? el.offsetTop + window.innerHeight * 0.35 : el;
      if (lenis) lenis.scrollTo(y, { offset: 0, duration: 1.8 });
      else if (typeof y === 'number') window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- WebGL stage + globe ---------- */
  var stage = window.initStage ? window.initStage($('#stage'), { static: reduce }) : null;
  if (window.initGlobe) window.initGlobe($('#globe'), { static: reduce });

  /* ---------- Split headings (masked line reveal) ---------- */
  var heroName = $('.hero__name');
  var heroWords = $$('.hero__word');
  var heroSplit = window.SplitText ? SplitText.create(heroWords, { type: 'chars' }) : null;

  function heroIntro() {
    gsap.set(heroName, { autoAlpha: 1 });
    gsap.set('[data-intro]', { opacity: 1 });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (stage) tl.to(stage.state, { intro: 1, duration: 3.2, ease: 'power2.out' }, 0);
    if (heroSplit) {
      tl.fromTo(heroSplit.chars, { opacity: 0, yPercent: 40, filter: 'blur(16px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.6, stagger: { each: 0.06, from: 'center' }, clearProps: 'filter' }, 0.4);
    }
    tl.from('.kicker', { opacity: 0, y: 16, duration: 1 }, 0.9)
      .from('.hero__line', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 1.2, clearProps: 'filter' }, 1.2)
      .from('.hero__ctas > *', { opacity: 0, y: 24, stagger: 0.12, duration: 1 }, 1.4)
      .from('.nav', { opacity: 0, y: -20, duration: 1, clearProps: 'opacity,transform' }, 1.2)
      .from('.scroll-cue', { opacity: 0, duration: 1 }, 1.8);
  }
  function ready() {
    if (!location.hash) { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); }
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  /* ---------- Loader → gate → enter ---------- */
  var loader = $('.loader'), gate = $('.gate');
  if (reduce) {
    loader.remove(); gate.remove();
    gsap.set(heroName, { autoAlpha: 1 }); gsap.set('[data-intro]', { opacity: 1 });
    if (stage) { stage.state.intro = 1; stage.redraw(); }
    ready();
  } else {
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var minTime = new Promise(function (r) { setTimeout(r, 1900); });
    var cap = new Promise(function (r) { setTimeout(r, 3000); });
    gsap.to('.loader__emblem .draw', { strokeDashoffset: 0, duration: 1.8, stagger: 0.12, ease: 'power2.inOut' });
    gsap.to('.loader__bar span', { scaleX: 0.85, duration: 1.9, ease: 'power2.out' });
    Promise.race([Promise.all([minTime, fontsReady]), cap]).then(function () {
      gsap.to('.loader__bar span', { scaleX: 1, duration: 0.3 });
      var skipGate = store.get('ao-entered');
      var out = gsap.timeline({ delay: 0.35 });
      out.to(['.loader__brand', '.loader__bar'], { opacity: 0, duration: 0.5 })
        .to('.loader__emblem', { scale: 0.4, opacity: 0, duration: 0.8, ease: 'power3.in' }, 0)
        .add(function () {
          if (skipGate) { loader.remove(); gate.remove(); heroIntro(); ready(); return; }
          openGate();
        });
    });
  }

  function openGate() {
    gate.classList.add('is-open');
    gate.setAttribute('aria-hidden', 'false');
    loader.remove();
    var parts = window.SplitText ? SplitText.create(['.gate__top', '.gate__bottom'], { type: 'chars' }) : null;
    var tl = gsap.timeline();
    if (parts) tl.from(parts.chars, { yPercent: 60, opacity: 0, filter: 'blur(10px)', stagger: 0.035, duration: 1.1, ease: 'power3.out', clearProps: 'filter' });
    tl.from('.gate__mid > *', { opacity: 0, y: 20, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.5);
    var first = $('[data-enter="sound"]', gate); if (first) first.focus({ preventScroll: true });
    $$('[data-enter]', gate).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-enter') === 'sound' && window.Sound) { Sound.start(); syncSound(); }
        store.set('ao-entered', '1');
        gsap.timeline()
          .to('.gate__top', { yPercent: -120, opacity: 0, duration: 1, ease: 'power3.in' }, 0)
          .to('.gate__bottom', { yPercent: 120, opacity: 0, duration: 1, ease: 'power3.in' }, 0)
          .to('.gate__mid', { opacity: 0, scale: 0.9, duration: 0.6 }, 0)
          .to(gate, { opacity: 0, duration: 0.8 }, 0.6)
          .add(function () { heroIntro(); }, 0.7)
          .add(function () { gate.remove(); ready(); });
      }, { once: true });
    });
  }

  if (reduce) { window.addEventListener('load', function () { ScrollTrigger.refresh(); }); return; }

  /* ---------- Camera flight: hero + chapter drive the stage ---------- */
  if (stage) {
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', endTrigger: '.chapter', end: 'bottom bottom', scrub: true,
      onUpdate: function (self) { stage.state.scroll = self.progress; }
    });
    ScrollTrigger.create({
      trigger: '.manifesto', start: 'top top',
      onEnter: function () { stage.setVisible(false); },
      onLeaveBack: function () { stage.setVisible(true); }
    });
  }
  gsap.fromTo('.hero > *', { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true } });

  /* ---------- Chapter statements, one at a time ---------- */
  var lines = $$('.chapter__line');
  var ctl = gsap.timeline({ scrollTrigger: { trigger: '.chapter', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  lines.forEach(function (line, i) {
    ctl.fromTo(line, { opacity: 0, filter: 'blur(14px)', letterSpacing: '0.22em', scale: 1.04 },
      { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.015em', scale: 1, duration: 1, ease: 'power2.out' });
    ctl.to(line, { opacity: 1, duration: 0.8 });
    if (i < lines.length - 1) ctl.to(line, { opacity: 0, filter: 'blur(10px)', y: -30, duration: 0.8, ease: 'power2.in' });
  });

  /* ---------- Masked heading reveals ---------- */
  if (window.SplitText) {
    $$('[data-split]').forEach(function (h) {
      var sp = SplitText.create(h, { type: 'lines', mask: 'lines' });
      gsap.from(sp.lines, { yPercent: 105, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
    });
  }
  $$('[data-reveal]').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.set('[data-reveal-batch]', { opacity: 0 });
  ScrollTrigger.batch('[data-reveal-batch]', {
    start: 'top 92%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 1.1, ease: 'power3.out', overwrite: true }); }
  });

  gsap.fromTo('.portrait', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.portrait', start: 'top 85%', once: true } });

  /* ---------- Counters ---------- */
  $$('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var o = { v: 0 }; el.textContent = pre + '0' + suf;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () { gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', onUpdate: function () { el.textContent = pre + Math.round(o.v) + suf; } }); }
    });
  });

  /* ---------- Gallery strip glides sideways while you scroll ---------- */
  var strip = $('.strip__track');
  if (strip) {
    gsap.fromTo(strip, { x: function () { return window.innerWidth * 0.15; } }, {
      x: function () { return -(strip.scrollWidth - window.innerWidth * 0.85); }, ease: 'none',
      scrollTrigger: { trigger: '.world', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  }

  /* ---------- Journey accordion with smooth height ---------- */
  $$('.role').forEach(function (d) {
    var sum = $('summary', d), body = $('.role__body', d);
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut', onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.7, ease: 'power3.out', onComplete: function () { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ---------- Nav: scrolled state, hide on scroll down, active link ---------- */
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  var nav = $('.nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', self.direction === 1 && y > 700);
    }
  });
  $$('.nav__side a').forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { a.classList.toggle('is-active', self.isActive); } });
  });

  /* ---------- Desktop polish: cursor + magnetic buttons ---------- */
  if (finePointer) {
    var cursor = $('.cursor');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' }), cy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    cursor.classList.add('is-hidden');
    window.addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); cursor.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, summary, label, .shot'));
    });
    $$('.magnetic').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

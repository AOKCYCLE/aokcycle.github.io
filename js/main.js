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
    instagram: 'fa-brands fa-instagram', kosharicode: 'fa-solid fa-robot', facebook: 'fa-brands fa-facebook-f', whatsapp: 'fa-brands fa-whatsapp'
  };
  var social = Object.assign({}, CFG.social || {});
  if (CFG.whatsapp) social.whatsapp = 'https://wa.me/' + CFG.whatsapp;
  $$('[data-email]').forEach(function (a) { if (CFG.email) { a.href = 'mailto:' + CFG.email; a.textContent = CFG.email; } });
  $$('[data-email-card]').forEach(function (a) { if (CFG.email) a.href = 'mailto:' + CFG.email; });
  $$('[data-phone]').forEach(function (a) { if (CFG.phoneLink) { a.href = 'tel:' + CFG.phoneLink; a.textContent = CFG.phoneDisplay; } });
  $$('[data-whatsapp]').forEach(function (a) { if (social.whatsapp) a.href = social.whatsapp; });
  $$('[data-social]').forEach(function (el) {
    var url = social[el.getAttribute('data-social')];
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; }
    else el.remove();
  });
  $$('[data-social-href]').forEach(function (a) { var u = social[a.getAttribute('data-social-href')]; if (u) a.href = u; });
  $$('[data-socials]').forEach(function (wrap) {
    var seen = {};
    ['linkedin', 'youtube', 'tiktok', 'instagram', 'kosharicode', 'facebook', 'whatsapp'].forEach(function (k) {
      if (!social[k] || seen[social[k]]) return;
      seen[social[k]] = true;
      var a = document.createElement('a');
      a.href = social[k]; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', k === 'kosharicode' ? 'KoshariCode, my AI agent' : k.charAt(0).toUpperCase() + k.slice(1));
      a.innerHTML = '<i class="' + ICONS[k] + '"></i>';
      wrap.appendChild(a);
    });
  });
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Toast & copy ---------- */
  var toastEl = $('.toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
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
    if (!e.target.closest('a, button, summary, .pills label, .bcard, .case, .flow__item')) return;
    var now = performance.now(); if (now - lastTick < 90) return; lastTick = now;
    Sound.tick();
  });

  /* ---------- Contact form → email (FormSubmit) ---------- */
  var form = $('#contactForm');
  function pickService(value) {
    if (!form) return;
    var r = $$('input[name="service"]', form).filter(function (i) { return i.value === value; })[0];
    if (r) r.checked = true;
  }
  if (form) {
    var body = $('.form__body', form), done = $('.form__done', form), err = $('.form__error', form);
    var btn = $('button[type="submit"]', form), btnLabel = $('.btn-label', btn);
    function fail(msg) { err.innerHTML = msg; err.hidden = false; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('name') || '').trim(), email = (d.get('email') || '').trim(), msg = (d.get('message') || '').trim();
      if (!name || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        fail('Please add your name, a valid email and a short message.');
        return;
      }
      if (d.get('_honey')) return; // bot
      err.hidden = true;
      btn.disabled = true; btnLabel.textContent = 'Sending…';
      var subject = 'New website request: ' + d.get('service') + ' (' + name + ')';
      var fields = {
        name: name, email: email,
        phone: (d.get('phone') || '').trim() || '-',
        company: (d.get('company') || '').trim() || '-',
        service: d.get('service'), budget: d.get('budget'), message: msg
      };
      // Web3Forms when an access key is set, otherwise the FormSubmit fallback
      var useW3 = !!CFG.web3formsKey;
      var payload = useW3
        ? Object.assign({ access_key: CFG.web3formsKey, subject: subject, from_name: 'Ahmed Osama website', replyto: email, botcheck: '' }, fields)
        : Object.assign({ _subject: subject, _template: 'table', _replyto: email }, fields);
      fetch(useW3 ? 'https://api.web3forms.com/submit' : CFG.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }); }).then(function (res) {
        if (String(res.success) === 'true') {
          showDone();
        } else {
          var m = (res && res.message) ? String(res.message) : '';
          fail('Your message could not be sent right now' + (m ? ' (' + m.replace(/</g, '&lt;') + ')' : '') + '. Please email <a href="mailto:' + CFG.email + '">' + CFG.email + '</a> or <a href="https://wa.me/' + CFG.whatsapp + '" target="_blank" rel="noopener">WhatsApp me</a>.');
        }
      }).catch(function () {
        fail('Connection problem. Please email <a href="mailto:' + CFG.email + '">' + CFG.email + '</a> or <a href="https://wa.me/' + CFG.whatsapp + '" target="_blank" rel="noopener">WhatsApp me</a>.');
      }).then(function () { btn.disabled = false; btnLabel.textContent = 'Send my request'; });
    });
    function showDone() {
      body.hidden = true; done.hidden = false;
      if (window.gsap && !reduce) {
        gsap.fromTo($$('svg circle, svg path', done), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.3, ease: 'power2.out' });
        gsap.from($$('h3, p, button', done), { y: 20, opacity: 0, stagger: 0.1, duration: 0.7, delay: 0.4 });
      }
      if (window.Sound && Sound.isOn()) { Sound.tick(); setTimeout(Sound.tick, 160); }
    }
    $('.form__again', form).addEventListener('click', function () {
      form.reset(); done.hidden = true; body.hidden = false;
    });
    $$('[data-service]:not(.flow__item)').forEach(function (a) {
      a.addEventListener('click', function () { pickService(a.getAttribute('data-service')); });
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

  /* ---------- FAQ accordion (smooth height) ---------- */
  $$('.qa').forEach(function (d) {
    var sum = $('summary', d), bodyEl = $('.qa__body', d);
    sum.addEventListener('click', function (e) {
      if (!window.gsap || reduce) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(bodyEl, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: function () { d.open = false; gsap.set(bodyEl, { clearProps: 'height,opacity' }); if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(bodyEl, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: function () { gsap.set(bodyEl, { clearProps: 'height' }); if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ---------- Brand access tabs ---------- */
  var tabs = $$('.brands__tabs [role="tab"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      $$('.brands__panel').forEach(function (panel) {
        var on = panel.getAttribute('data-panel') === tab.getAttribute('data-tab');
        panel.hidden = !on;
        if (on && window.gsap && !reduce) {
          gsap.fromTo($$('.chips li', panel), { y: 18, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.012, from: 'random' }, ease: 'power3.out' });
        }
      });
      if (window.Sound) Sound.tick();
    });
    tab.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        next.focus(); next.click();
      }
    });
  });

  /* ---------- Static fallback ---------- */
  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function onBook(service) {
    pickService(service);
    scrollToEl($('#contact'));
    setTimeout(function () { var f = $('#contactForm input[name="name"]'); if (f) f.focus({ preventScroll: true }); }, 1700);
  }
  if (!hasGsap) {
    document.documentElement.classList.remove('js');
    window.__siteReady = true;
    if (window.Effects) Effects.init({ onBook: onBook });
    return;
  }
  window.__siteReady = true;
  if (!location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- Lenis smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    window.__lenis = lenis;
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
      if (id === '#story') { var y = el.offsetTop + window.innerHeight * 0.35; if (lenis) lenis.scrollTo(y, { duration: 1.8 }); else window.scrollTo({ top: y, behavior: 'smooth' }); return; }
      scrollToEl(el);
    });
  });

  /* ---------- WebGL stage + globe + effects ---------- */
  var stage = window.initStage ? window.initStage($('#stage'), { static: reduce }) : null;
  if (window.initGlobe) window.initGlobe($('#globe'), { static: reduce });
  if (window.Effects) Effects.init({ onBook: onBook });

  /* ---------- Hero intro ---------- */
  var heroName = $('.hero__name');
  var heroSplit = window.SplitText ? SplitText.create($$('.hero__word'), { type: 'chars' }) : null;
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
      .from('.orbit-badge', { opacity: 0, scale: 0.6, rotate: -90, duration: 1.4, ease: 'expo.out' }, 1.5)
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
      gsap.timeline({ delay: 0.35 })
        .to(['.loader__brand', '.loader__bar'], { opacity: 0, duration: 0.5 })
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
    var stopBrain = (window.Effects && Effects.brain) ? Effects.brain($('.gate__brain', gate)) : function () {};
    var eyeCtl = (window.Effects && Effects.eyes) ? Effects.eyes(gate) : null;
    var parts = window.SplitText ? SplitText.create(['.gate__top', '.gate__bottom'], { type: 'chars', charsClass: 'gch' }) : null;
    var tl = gsap.timeline();
    if (parts) tl.from(parts.chars, { yPercent: 60, opacity: 0, filter: 'blur(10px)', stagger: 0.035, duration: 1.1, ease: 'power3.out', clearProps: 'filter' });
    tl.from('.gate__mid > *', { opacity: 0, y: 20, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.5);

    // "UP" keeps jumping like a looping GIF: crouch, leap, fall, squash, settle
    var up = $$('.jump .gch', gate), shadow = $('.jump__shadow', gate), jump = null;
    if (up.length) {
      gsap.set(up, { transformOrigin: '50% 100%' });
      jump = gsap.timeline({ repeat: -1, repeatDelay: 0.45, delay: 1.7 });
      jump.to(up, { scaleY: 0.8, scaleX: 1.14, duration: 0.16, ease: 'power2.out', stagger: 0.07 })
        .to(up, { y: -48, scaleY: 1.12, scaleX: 0.9, rotation: function (i) { return i ? 6 : -6; }, duration: 0.34, ease: 'power2.out', stagger: 0.07 })
        .to(up, { y: 0, scaleY: 1, scaleX: 1, rotation: 0, duration: 0.3, ease: 'power2.in', stagger: 0.07 })
        .to(up, { scaleY: 0.82, scaleX: 1.14, duration: 0.09, ease: 'power1.out', stagger: 0.07 })
        .to(up, { scaleY: 1, scaleX: 1, duration: 0.55, ease: 'elastic.out(1, 0.32)', stagger: 0.07 });
      if (shadow) {
        jump.to(shadow, { scaleX: 0.4, opacity: 0.15, duration: 0.34, ease: 'power2.out' }, 0.18)
          .to(shadow, { scaleX: 1.1, opacity: 0.6, duration: 0.3, ease: 'power2.in' }, 0.55)
          .to(shadow, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, 0.9);
      }
    }

    var first = $('[data-enter="sound"]', gate); if (first) first.focus({ preventScroll: true });
    $$('[data-enter]', gate).forEach(function (b) {
      b.addEventListener('click', function () {
        if (gate.classList.contains('is-leaving')) return;
        gate.classList.add('is-leaving');
        if (b.getAttribute('data-enter') === 'sound' && window.Sound) { Sound.start(); syncSound(); }
        store.set('ao-entered', '1');
        function leave() {
          gsap.timeline()
            .to('.gate__top', { yPercent: -120, opacity: 0, duration: 1, ease: 'power3.in' }, 0)
            .to('.gate__bottom', { yPercent: 120, opacity: 0, duration: 1, ease: 'power3.in' }, 0)
            .to('.gate__mid', { opacity: 0, scale: 0.9, duration: 0.6 }, 0)
            .to(gate, { opacity: 0, duration: 0.8 }, 0.6)
            .add(function () { heroIntro(); }, 0.7)
            .add(function () { if (jump) jump.kill(); stopBrain(); if (eyeCtl) eyeCtl.destroy(); gate.remove(); ready(); });
        }
        if (eyeCtl) eyeCtl.blink(b, leave); else leave();
      });
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

  // "From pyramids to processors" draws itself as you scroll
  var jl = $('.journey-line');
  if (jl) {
    gsap.set($$('.jl', jl), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({ scrollTrigger: { trigger: jl, start: 'top 85%', end: 'bottom 45%', scrub: 0.8 } })
      .to($$('.jl', jl), { strokeDashoffset: 0, stagger: 0.12, ease: 'none' })
      .from('.jl-labels text', { opacity: 0, y: 8, stagger: 0.2 }, 0.6);
  }

  // personal photos: curtain reveal + slow drift
  $$('.me__shot').forEach(function (fig, i) {
    gsap.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', delay: (i % 3) * 0.1, scrollTrigger: { trigger: fig, start: 'top 92%', once: true } });
    gsap.fromTo($('img', fig), { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // premium brand wall and chips cascade in
  if ($('.premium')) {
    gsap.from('.premium li', { y: 40, opacity: 0, duration: 1, stagger: { each: 0.05, from: 'random' }, ease: 'power3.out', scrollTrigger: { trigger: '.premium', start: 'top 88%', once: true } });
    gsap.from('.brands__panel:not([hidden]) .chips li', { y: 18, opacity: 0, duration: 0.6, stagger: { each: 0.01, from: 'random' }, ease: 'power3.out', scrollTrigger: { trigger: '.brands__panel', start: 'top 90%', once: true } });
  }

  // service lines slide in from alternating sides
  $$('.flow__item').forEach(function (it, i) {
    gsap.from(it, { xPercent: i % 2 ? 8 : -8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: it, start: 'top 92%', once: true } });
  });

  /* ---------- Counters (replay on hover / tap) ---------- */
  $$('.count').forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var o = { v: 0 };
    el.textContent = pre + '0' + suf;
    el._run = function () {
      o.v = 0;
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', overwrite: true, onUpdate: function () { el.textContent = pre + Math.round(o.v) + suf; } });
    };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: el._run });
    var host = el.closest('.num');
    if (host) host.addEventListener('pointerenter', el._run);
  });

  /* ---------- Bento mini visuals start when seen ---------- */
  $$('.bcard').forEach(function (card) {
    ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: function () { card.classList.add('is-seen'); } });
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

  /* ---------- Desktop polish: cursor with labels + magnetic buttons ---------- */
  if (finePointer) {
    var cursor = $('.cursor'), label = $('.cursor__label');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' }), cy = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    cursor.classList.add('is-hidden');
    window.addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); cursor.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    var LABELS = [['.flow__item', 'Open'], ['.case', 'Reveal'], ['.trail', 'Move'], ['.bcard', 'Tap'], ['.feature', 'Play'], ['.short', 'Play'], ['.me__shot', 'View']];
    document.addEventListener('pointerover', function (e) {
      var text = '';
      for (var i = 0; i < LABELS.length; i++) { if (e.target.closest(LABELS[i][0])) { text = LABELS[i][1]; break; } }
      label.textContent = text;
      cursor.classList.toggle('is-label', !!text);
      cursor.classList.toggle('is-hover', !text && !!e.target.closest('a, button, summary, label'));
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

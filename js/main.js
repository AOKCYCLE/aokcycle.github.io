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
  var ICONS = { linkedin: 'li', youtube: 'yt', tiktok: 'tt', instagram: 'ig', kosharicode: 'robot', facebook: 'fb', whatsapp: 'wa' };
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
      a.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-' + ICONS[k] + '"/></svg>';
      wrap.appendChild(a);
    });
  });
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  // light deterrent: personal photos can't be dragged out or right-click saved
  $$('.me__shot img, .portrait__photo, .contact__me img').forEach(function (im) {
    im.setAttribute('draggable', 'false');
    im.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

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

  /* ---------- Project enquiry form → email (Web3Forms, FormSubmit fallback) ---------- */
  var form = $('#contactForm');
  function pickService(value) {
    if (!form || !value) return;
    var r = $$('input[name="service"]', form).filter(function (i) { return i.value === value; })[0];
    if (r) r.checked = true;
  }
  if (form) {
    var body = $('.form__body', form), done = $('.form__done', form), err = $('.form__error', form);
    var btn = $('button[type="submit"]', form), btnLabel = $('.btn-label', btn);
    var shownAt = Date.now(), sentAt = 0;
    var contactLine = function () {
      return 'Please email <a href="mailto:' + CFG.email + '">' + CFG.email + '</a> or <a href="https://wa.me/' + CFG.whatsapp + '" target="_blank" rel="noopener">WhatsApp me</a>.';
    };
    function fail(msg) { err.innerHTML = msg; err.hidden = false; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form), v = function (k) { return String(d.get(k) || '').trim(); };
      var name = v('name'), email = v('email'), msg = v('message');
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || msg.length < 10) {
        fail('Please add your name, a valid business email and a few words about the project.');
        return;
      }
      // spam protection: hidden honeypot, a minimum fill time and one send per minute
      if (v('_honey') || Date.now() - shownAt < 2500) { showDone(); return; }
      if (sentAt && Date.now() - sentAt < 60000) { fail('Thanks, your enquiry is already on its way. ' + contactLine()); return; }
      err.hidden = true;
      btn.disabled = true; btnLabel.textContent = 'Sending…';
      var fields = {
        name: name, email: email,
        company: v('company') || '-', country: v('country') || '-',
        category: v('service'), estimated_value: v('value'), timeline: v('timeline'),
        requirements: msg
      };
      var subject = 'New enquiry: ' + fields.category + ' · ' + fields.estimated_value + ' (' + name + ')';
      var useW3 = !!CFG.web3formsKey;
      var payload = useW3
        ? Object.assign({ access_key: CFG.web3formsKey, subject: subject, from_name: 'Ahmed Osama website', replyto: email, botcheck: '' }, fields)
        : Object.assign({ _subject: subject, _template: 'table', _replyto: email, _captcha: 'false' }, fields);
      fetch(useW3 ? 'https://api.web3forms.com/submit' : CFG.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }); }).then(function (res) {
        if (String(res.success) === 'true') {
          sentAt = Date.now(); showDone();
          if (window.gtag) gtag('event', 'generate_lead', { form: 'project_enquiry', category: fields.category });
        }
        else {
          var m = (res && res.message) ? String(res.message) : '';
          fail('Your enquiry could not be sent right now' + (m ? ' (' + m.replace(/</g, '&lt;') + ')' : '') + '. ' + contactLine());
        }
      }).catch(function () {
        fail('Connection problem. ' + contactLine());
      }).then(function () { btn.disabled = false; btnLabel.textContent = 'Send enquiry'; });
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
      form.reset(); done.hidden = true; body.hidden = false; shownAt = Date.now();
    });
    $$('[data-service]:not(.flow__item)').forEach(function (a) {
      a.addEventListener('click', function () { pickService(a.getAttribute('data-service')); });
    });
  }

  /* ---------- Proof numbers expand for the full story ---------- */
  $$('.num').forEach(function (n) {
    n.addEventListener('click', function () {
      var open = n.getAttribute('aria-expanded') !== 'true';
      n.setAttribute('aria-expanded', String(open));
      n.classList.toggle('is-open', open);
      if (window.Sound) Sound.tick();
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 450);
    });
  });

  /* ---------- Testimonials appear only when real ones exist ---------- */
  (function () {
    var list = (window.TESTIMONIALS || []).filter(function (t) { return t && t.quote && t.name; });
    var sec = $('#testimonials'); if (!sec || !list.length) return;
    var esc = function (t) { return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    $('.quotes__grid', sec).innerHTML = list.map(function (t) {
      return '<figure class="quote" data-reveal-batch><blockquote>' + esc(t.quote) + '</blockquote><figcaption><b>' + esc(t.name) + '</b><span>' + esc([t.role, t.company].filter(Boolean).join(', ')) + '</span></figcaption></figure>';
    }).join('');
    sec.hidden = false;
  })();

  /* ---------- Brand ecosystem: search + category filters ---------- */
  (function () {
    var wrap = $('.bfinder'); if (!wrap) return;
    var input = $('input', wrap), btns = $$('.bf', wrap), chips = $$('.brand-list > li');
    var count = $('.bcount'), empty = $('.bempty'), cat = 'all', total = chips.length, t = null;
    var list = $('.brand-list'), more = $('.bmore'), collapsed = true;
    function refreshST() { if (window.ScrollTrigger) { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 300); } }
    function setCollapsed(c, animate) {
      collapsed = c;
      more.setAttribute('aria-expanded', String(!c));
      more.textContent = c ? 'Show all ' + total + ' brands' : 'Show fewer brands';
      var from = list.offsetHeight;
      list.classList.toggle('is-collapsed', c);
      if (animate && window.gsap && !reduce) {
        var to = list.offsetHeight;
        gsap.fromTo(list, { height: from }, { height: to, duration: 0.7, ease: 'power3.inOut', clearProps: 'height', onComplete: refreshST });
      } else refreshST();
    }
    if (more) {
      more.addEventListener('click', function () {
        setCollapsed(!collapsed, true);
        if (collapsed) { var top = wrap.getBoundingClientRect().top; if (top < 0) scrollToEl(wrap); }
        if (window.Sound) Sound.tick();
      });
      list.addEventListener('focusin', function () { if (collapsed && !list.classList.contains('is-filtered')) setCollapsed(false, false); });
    }
    function apply(animate) {
      var q = input.value.trim().toLowerCase(), shown = [];
      chips.forEach(function (li) {
        var name = (li.getAttribute('data-name') || li.textContent).toLowerCase();
        var ok = (cat === 'all' || (' ' + li.getAttribute('data-cats') + ' ').indexOf(' ' + cat + ' ') > -1) && (!q || name.indexOf(q) > -1);
        li.hidden = !ok; if (ok) shown.push(li);
      });
      var filtered = !!(q || cat !== 'all');
      count.textContent = filtered ? 'Showing ' + shown.length + ' of ' + total + ' brands' : '';
      empty.hidden = shown.length > 0;
      // a search or filter always shows every match; the collapsed view is only for the full list
      list.classList.toggle('is-filtered', filtered);
      if (more) more.hidden = filtered;
      if (animate && window.gsap && !reduce && shown.length) {
        gsap.fromTo(shown, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: { each: Math.min(0.02, 0.6 / shown.length) }, ease: 'power3.out', overwrite: true });
      }
      refreshST();
    }
    chips.forEach(function (li) { li.setAttribute('data-name', li.textContent.trim()); });
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-filter');
        btns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        apply(true);
        if (window.Sound) Sound.tick();
      });
    });
    input.addEventListener('input', function () { apply(false); });
  })();

  /* ---------- Carousels: swipe, drag or use the arrows ---------- */
  $$('[data-rail]').forEach(function (track) {
    var nav = document.createElement('div');
    nav.className = 'rail__nav';
    nav.innerHTML = '<span class="rail__bar" aria-hidden="true"><i></i></span>' +
      '<button type="button" class="rail__btn" data-dir="-1" aria-label="Previous"><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>' +
      '<button type="button" class="rail__btn" data-dir="1" aria-label="Next"><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>';
    track.parentNode.insertBefore(nav, track.nextSibling);
    var prev = nav.children[1], next = nav.children[2], bar = $('.rail__bar i', nav);
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var on = max > 4 && getComputedStyle(track).overflowX !== 'visible';
      nav.hidden = !on;
      if (!on) return;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      var vis = track.clientWidth / track.scrollWidth;
      bar.style.width = (vis * 100) + '%';
      bar.style.transform = 'translateX(' + ((track.scrollLeft / track.clientWidth) * 100) + '%)';
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: Number(b.getAttribute('data-dir')) * track.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
        if (window.Sound) Sound.tick();
      });
    });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    sync();
    // mouse: drag to scroll (a drag never counts as a click)
    if (finePointer) {
      var down = false, moved = false, x0 = 0, s0 = 0;
      track.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || e.pointerType !== 'mouse' || nav.hidden) return;
        down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
        if (moved) track.scrollLeft = s0 - dx;
      });
      window.addEventListener('pointerup', function () {
        if (!down) return;
        down = false;
        if (moved) {
          track.classList.remove('is-dragging');
          var stop = function (e) { e.preventDefault(); e.stopPropagation(); };
          track.addEventListener('click', stop, { capture: true, once: true });
          setTimeout(function () { track.removeEventListener('click', stop, true); }, 50);
        }
      });
      track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }
  });

  /* ---------- Network: pick a market, the globe turns to it ---------- */
  var globe = null;
  $$('.markets [data-market]').forEach(function (b) {
    function go() {
      $$('.markets [data-market]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      if (globe && globe.focus) globe.focus(b.getAttribute('data-market'));
    }
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', go);
    if (finePointer) b.addEventListener('pointerenter', go);
  });

  /* ---------- Optional analytics (only when an ID is set in config.js) ---------- */
  (function () {
    var a = CFG.analytics || {};
    function add(src, attrs) {
      var sc = document.createElement('script'); sc.src = src; sc.defer = true;
      Object.keys(attrs || {}).forEach(function (k) { sc.setAttribute(k, attrs[k]); });
      document.head.appendChild(sc);
    }
    var go = function () {
      if (a.ga4) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
        gtag('js', new Date());
        gtag('config', a.ga4);
        add('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(a.ga4));
      }
      if (a.plausible) add('https://plausible.io/js/script.js', { 'data-domain': a.plausible });
      if (a.cloudflare) add('https://static.cloudflareinsights.com/beacon.min.js', { 'data-cf-beacon': JSON.stringify({ token: a.cloudflare }) });
      if (a.goatcounter) add('https://gc.zgo.at/count.js', { 'data-goatcounter': 'https://' + a.goatcounter + '.goatcounter.com/count' });
    };
    if (a.ga4 || a.plausible || a.cloudflare || a.goatcounter) window.addEventListener('load', function () { setTimeout(go, 1500); });
  })();

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

  /* ---------- Static fallback ---------- */
  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function goToForm() {
    var f = $('#contactForm'); if (!f) return;
    if (lenis) lenis.scrollTo(f, { offset: -90, duration: 1.6 }); else f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    setTimeout(function () {
      var n = $('input[name="name"]', f); if (n) n.focus({ preventScroll: true });
      f.classList.remove('is-calling'); void f.offsetWidth; f.classList.add('is-calling');
      setTimeout(function () { f.classList.remove('is-calling'); }, 2200);
    }, reduce ? 50 : 1650);
  }
  function onBook(service) {
    pickService(service);
    scrollToEl($('#contact'));
    setTimeout(function () { var f = $('#contactForm input[name="name"]'); if (f) f.focus({ preventScroll: true }); }, 1700);
  }
  if (!hasGsap) {
    document.documentElement.classList.remove('js');
    window.__siteReady = true;
    var g0 = $('.gate'); if (g0) g0.remove();
    if (window.initGlobe) globe = window.initGlobe($('#globe'), { static: true });
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
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1.05 });
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
      if (a.hasAttribute('data-to-form')) { goToForm(); return; }
      scrollToEl(el);
    });
  });

  /* ---------- WebGL stage + globe + effects ---------- */
  var stage = window.initStage ? window.initStage($('#stage'), { static: reduce }) : null;
  if (window.initGlobe) globe = window.initGlobe($('#globe'), { static: reduce });
  if (window.Effects) Effects.init({ onBook: onBook });

  /* ---------- Hero intro ---------- */
  var heroName = $('.hero__name');
  var fontsOk = Promise.race([
    (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]);
  var heroSplit = null;
  function heroIntro() {
    if (!heroSplit && window.SplitText) heroSplit = SplitText.create($$('.hero__word'), { type: 'chars' });
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
      .from('.hero__sub', { opacity: 0, y: 16, duration: 1 }, 1.35)
      .from('.hero__caps li', { opacity: 0, y: 14, stagger: 0.1, duration: 0.9 }, 1.45)
      .from('.hero__ctas > *', { opacity: 0, y: 24, stagger: 0.12, duration: 1 }, 1.4)
      .from('.orbit-badge', { opacity: 0, scale: 0.6, rotate: -90, duration: 1.4, ease: 'expo.out' }, 1.5)
      .from('.nav', { opacity: 0, y: -20, duration: 1, clearProps: 'opacity,transform' }, 1.2)
      .from('.scroll-cue', { opacity: 0, duration: 1 }, 1.8)
      .add(nameAlive, 2.4);
  }
  function nameAlive() {
    if (!heroSplit || reduce) return;
    heroName.classList.add('is-alive');
    // a slow wave runs through the letters
    gsap.to(heroSplit.chars, { y: -10, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.14, from: 'start' } });
    // the whole name tilts a little toward the cursor
    if (finePointer) {
      var rx = gsap.quickTo(heroName, 'rotationX', { duration: 1.2, ease: 'power3' }), ry = gsap.quickTo(heroName, 'rotationY', { duration: 1.2, ease: 'power3' });
      gsap.set(heroName, { transformPerspective: 900 });
      window.addEventListener('pointermove', function (e) {
        if (window.scrollY > window.innerHeight) return;
        ry((e.clientX / window.innerWidth - 0.5) * 10);
        rx(-(e.clientY / window.innerHeight - 0.5) * 8);
      }, { passive: true });
    }
  }
  function ready() {
    if (lenis) lenis.start();
    if (!location.hash) { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); }
    ScrollTrigger.refresh();
  }

  /* ---------- Entry gate (first visit of a session) → enter ---------- */
  var gate = $('.gate');
  if (reduce || store.get('ao-entered') || document.documentElement.classList.contains('entered')) {
    if (gate) gate.remove();
    if (reduce) {
      gsap.set(heroName, { autoAlpha: 1 }); gsap.set('[data-intro]', { opacity: 1 });
      if (stage) { stage.state.intro = 1; stage.redraw(); }
    } else fontsOk.then(heroIntro);
    ready();
  } else openGate();
  function openGate() {
    gate.classList.add('is-open');
    var stopBrain = (window.Effects && Effects.brain) ? Effects.brain($('.gate__brain', gate)) : function () {};
    var eyeCtl = (window.Effects && Effects.gateIcons) ? Effects.gateIcons(gate) : null;
    gsap.from('.gate__mid > *', { opacity: 0, y: 20, stagger: 0.12, duration: 0.8, ease: 'power3.out' });

    // the headings are already painted; only "UP" is split so it can jump like a looping GIF
    var jump = null;
    fontsOk.then(function () {
    if (!window.SplitText || gate.classList.contains('is-leaving')) return;
    SplitText.create('.jump', { type: 'chars', charsClass: 'gch' });
    var up = $$('.jump .gch', gate), shadow = $('.jump__shadow', gate);
    if (up.length) {
      gsap.set(up, { transformOrigin: '50% 100%' });
      jump = gsap.timeline({ repeat: -1, repeatDelay: 0.45, delay: 1 });
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
    });

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
        if (eyeCtl) eyeCtl.play(b, leave); else leave();
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
    fontsOk.then(function () {
      $$('[data-split]').forEach(function (h) {
        var sp = SplitText.create(h, { type: 'lines', mask: 'lines' });
        gsap.from(sp.lines, { yPercent: 105, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
      });
      ScrollTrigger.refresh();
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
    gsap.fromTo($('img', fig), { scale: 1.1, transformOrigin: '50% 0%' }, { scale: 1, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // premium brand wall and chips cascade in
  if ($('.premium')) {
    gsap.from('.premium li', { y: 40, opacity: 0, duration: 1, stagger: { each: 0.05, from: 'random' }, ease: 'power3.out', scrollTrigger: { trigger: '.premium', start: 'top 88%', once: true } });
    gsap.from('.brand-list > li', { y: 18, opacity: 0, duration: 0.6, stagger: { each: 0.01, from: 'random' }, ease: 'power3.out', scrollTrigger: { trigger: '.brand-list', start: 'top 90%', once: true } });
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
  var floatCta = $('.float-cta'), contactSec = $('#contact');
  if (floatCta) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var c = contactSec ? contactSec.getBoundingClientRect().top : 1e9;
        floatCta.classList.toggle('is-on', self.scroll() > window.innerHeight * 0.85 && c > window.innerHeight * 0.55);
      }
    });
  }
  $$('.nav__side a').forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { a.classList.toggle('is-active', self.isActive); } });
  });

  /* ---------- Living cursor: it changes with the area you are in + magnetic buttons ---------- */
  if (finePointer) {
    var ring = $('.cursor');
    ring.innerHTML = '<i class="cursor__icon"></i><span class="cursor__label"></span>';
    var cIcon = $('.cursor__icon', ring), cLabel = $('.cursor__label', ring);
    var dot = document.createElement('div');
    dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-cursor');
    gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });
    var rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' });
    var placed = false;
    var hideCursor = function (on) { ring.classList.toggle('is-hidden', on); dot.classList.toggle('is-hidden', on); };
    hideCursor(true);
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!placed) { gsap.set([ring, dot], { x: e.clientX, y: e.clientY }); placed = true; }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
      hideCursor(false);
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) hideCursor(true); });
    window.addEventListener('pointerdown', function () { gsap.to(ring, { scale: 0.78, duration: 0.15, overwrite: 'auto' }); });
    window.addEventListener('pointerup', function () { gsap.to(ring, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' }); });

    var ICON_PLAY = '<svg class="ic"><use href="#i-play"/></svg>';
    var ICON_OPEN = '<svg class="ic ic--ne"><use href="#i-arrow"/></svg>';
    var ICON_DRAG = '<svg class="ic ic--back"><use href="#i-arrow"/></svg><svg class="ic"><use href="#i-arrow"/></svg>';
    var BRANDS = [['youtube', '#ff0033'], ['tiktok', '#25f4ee'], ['instagram', '#e1306c'], ['linkedin', '#4c9be8'], ['wa.me', '#25d366'], ['whatsapp', '#25d366']];
    function modeFor(t) {
      if (!t || !t.closest) return ['default'];
      if (t.closest('dialog, input, textarea, select')) return ['hidden'];
      if (t.closest('.orbit-badge, .eye-btn, .float-cta')) return ['dot'];
      if (t.closest('.feature, .short')) return ['play', ICON_PLAY, 'Play'];
      if (t.closest('.me__grid')) return ['drag', ICON_DRAG, 'Drag'];
      var a = t.closest('a[href]');
      if (a) {
        var h = (a.getAttribute('href') || '') + ' ' + (a.getAttribute('data-social') || '');
        for (var i = 0; i < BRANDS.length; i++) if (h.indexOf(BRANDS[i][0]) > -1) return ['brand', '', '', BRANDS[i][1]];
      }
      if (t.closest('.case, .flow__item, .num, .bl, .plan')) return ['open', ICON_OPEN];
      if (t.closest('.reach__globe, .markets')) return ['globe'];
      if (t.closest('.trail')) return ['cross'];
      if (t.closest('a, button, summary, label, [role="button"]')) return ['link'];
      if (t.closest('.hero__name, .head__title, .chapter__line, .manifesto__title, .contact__title, .footer__name, .gate__top, .gate__bottom')) return ['lens'];
      if (t.closest('p, li, dd, blockquote')) return ['text'];
      return ['default'];
    }
    var curMode = '';
    document.addEventListener('pointerover', function (e) {
      var m = modeFor(e.target), key = m.join('|');
      if (key === curMode) return;
      curMode = key;
      ring.setAttribute('data-mode', m[0]); dot.setAttribute('data-mode', m[0]);
      cIcon.innerHTML = m[1] || ''; cLabel.textContent = m[2] || '';
      if (m[3]) { ring.style.setProperty('--brand', m[3]); dot.style.setProperty('--brand', m[3]); }
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

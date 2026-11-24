/* =========================================================
   القطع الخارجية — السادس الإعدادي
   Offline app logic: index, timed solution/translation,
   British-male narration with word highlighting.
   ========================================================= */
(function () {
  'use strict';

  var DATA = Array.isArray(window.PASSAGES) ? window.PASSAGES : [];
  var META = window.APP_META || {};
  var app = document.getElementById('app');
  var boot = document.getElementById('boot');
  var toastEl = document.getElementById('toast');

  var UNLOCK_MS = 10 * 60 * 1000;
  var RATE_KEY = 'p6_rate';
  var FONT_KEY = 'p6_font';
  var WELCOME_KEY = 'p6_welcome';
  var OPEN_PREFIX = 'p6_open_';
  var SEEN_PREFIX = 'p6_seen_';
  var LAST_KEY = 'p6_last';

  var LEVELS = [
    { key: 'سهل', cls: 'easy', en: 'EASY', title: 'أساسيات البداية', desc: 'الثلث الأول · ابدأ بالقطع الأقصر والأوضح لبناء الثقة والمفردات.' },
    { key: 'متوسط', cls: 'medium', en: 'MED', title: 'تدريب متدرج', desc: 'الثلث الأوسط · نصوص أطول وأفكار مترابطة، مع تدريب على الاستنتاج.' },
    { key: 'صعب', cls: 'hard', en: 'HARD', title: 'مرحلة التحدّي', desc: 'الثلث الأخير · كثافة أعلى وأسئلة أعمق، استعدادًا للورقة الوزارية.' }
  ];

  var ICONS = {
    back: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    chevron: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7"/></svg>',
    chevronLeft: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7"/></svg>',
    chevronRight: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    search: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    shuffle: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    clock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    lock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    unlock: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7-2.6"/></svg>',
    book: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/></svg>',
    text: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>',
    help: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 17h.01"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    volume: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    play: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>',
    heart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/></svg>',
    arrowStart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>',
    arrowEnd: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>',
    warn: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4L2.5 20h19z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    flag: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    grid: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>'
  };

  var state = {
    timerId: null,
    audio: null,
    audioP: null,
    wordEls: [],
    wordTimes: [],
    activeWord: -1,
    rate: 1,
    openTs: 0,
    locked: true,
    contentBuilt: false,
    homeScroll: 0,
    filter: 'all',
    query: '',
    route: ''
  };

  /* ---------- storage ---------- */
  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  function savedRate() {
    var r = parseFloat(lsGet(RATE_KEY) || '1');
    if (!isFinite(r) || r < 0.5 || r > 2) r = 1;
    return r;
  }

  function savedFont() {
    var f = parseInt(lsGet(FONT_KEY) || '19', 10);
    if (!isFinite(f) || f < 16 || f > 26) f = 19;
    return f;
  }

  function openStamp(id) {
    try { localStorage.removeItem(OPEN_PREFIX + id); } catch (e) {}
    return Date.now();
  }

  function isSeen(id) {
    return lsGet(SEEN_PREFIX + id) === '1';
  }
  function markSeen(id) {
    lsSet(SEEN_PREFIX + id, '1');
  }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normAr(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function fmtClock(ms) {
    ms = Math.max(0, ms);
    var total = Math.ceil(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return pad2(m) + ':' + pad2(s);
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + pad2(s);
  }

  function findPassage(id) {
    for (var i = 0; i < DATA.length; i++) if (DATA[i].id === id) return DATA[i];
    return null;
  }

  function levelInfo(key) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].key === key) return LEVELS[i];
    return LEVELS[0];
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
  }

  function scrollTop(smooth) {
    try { window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }); }
    catch (e) { window.scrollTo(0, 0); }
  }

  /* ---------- routing ---------- */
  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (h.indexOf('p/') === 0) {
      var id = parseInt(h.slice(2), 10);
      if (id) return { name: 'detail', id: id };
    }
    if (h === 'about') return { name: 'about' };
    if (h === 'guide') return { name: 'guide' };
    return { name: 'home' };
  }

  function navigate(hash) {
    if ((location.hash || '') === hash) {
      route();
    } else {
      location.hash = hash;
    }
  }

  function route() {
    var r = parseHash();
    teardownTimer();
    teardownAudio();
    if (r.name === 'detail') {
      var p = findPassage(r.id);
      if (!p) { navigate('#/'); return; }
      state.route = 'detail';
      renderDetail(p);
    } else if (r.name === 'about') {
      state.route = 'about';
      renderAbout();
      scrollTop(false);
    } else if (r.name === 'guide') {
      state.route = 'guide';
      renderGuide();
      scrollTop(false);
    } else {
      state.route = 'home';
      renderHome();
      requestAnimationFrame(function () {
        if (state.homeScroll) window.scrollTo(0, state.homeScroll);
        else scrollTop(false);
      });
    }
  }

  function teardownTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  window.appBack = function () {
    if (state.route !== 'home') {
      navigate('#/');
      return true;
    }
    return false;
  };

  window.appPauseAudio = function () {
    if (state.audio && !state.audio.paused) {
      try { state.audio.pause(); } catch (e) {}
    }
  };

  /* ================= HOME ================= */
  function heroHTML() {
    var s = META;
    return '' +
      '<header class="hero">' +
        '<div class="hero-inner">' +
          '<div class="hero-top">' +
            '<div class="brand">' +
              '<img class="brand-logo" src="icon512.png" alt="شعار الأستاذ علي معز الشلاه">' +
              '<div>' +
                '<p class="eyebrow">Ministry Passages · 2014 — 2026</p>' +
                '<h1>القطع <span>الخارجية</span></h1>' +
                '<p class="brand-sub">السادس الإعدادي · اللغة الإنكليزية</p>' +
              '</div>' +
            '</div>' +
            '<div class="hero-actions">' +
              '<button class="icon-btn gold" id="aboutBtn" aria-label="عن التطبيق" title="عن التطبيق">' + ICONS.info + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="hero-rule"></div>' +
          '<div class="hero-note"><span class="dot"></span>الحل والترجمة يُفتحان بعد 10 دقائق من فتح القطعة</div>' +
          '<div class="stats">' +
            '<div class="stat"><b>' + (s.total || 78) + '</b><span>قطعة وزارية</span></div>' +
            '<div class="stat"><b>' + (s.questions || 469) + '</b><span>سؤالًا محلولًا</span></div>' +
            '<div class="stat"><b>' + (s.sessions || 82) + '</b><span>دورة امتحانية</span></div>' +
            '<div class="stat"><b>12</b><span>سنة دراسية</span></div>' +
          '</div>' +
          '<div class="hero-sign">' +
            '<span>إعداد: <strong>الأستاذ علي معز الشلاه</strong></span>' +
            '<span class="english">Ali Moez Al-Shallah</span>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  function toolbarHTML() {
    var chips = '<button class="filter-chip' + (state.filter === 'all' ? ' active' : '') + '" data-level="all">الكل <strong>' + DATA.length + '</strong></button>';
    for (var i = 0; i < LEVELS.length; i++) {
      var lv = LEVELS[i];
      var n = DATA.filter(function (x) { return x.level === lv.key; }).length;
      chips += '<button class="filter-chip' + (state.filter === lv.cls ? ' active' : '') + '" data-level="' + lv.cls + '">' + lv.key + ' <strong>' + n + '</strong></button>';
    }
    return '' +
      '<div class="toolbar">' +
        '<div class="search-row">' +
          '<div class="search-box">' + ICONS.search +
            '<input id="searchInput" type="search" inputmode="search" autocomplete="off" ' +
              'placeholder="ابحث باسم القطعة أو السنة أو كلمة من النص..." aria-label="بحث">' +
            '<button class="clear-search" id="clearSearch" aria-label="مسح البحث">' + ICONS.close + '</button>' +
          '</div>' +
          '<button class="random-btn" id="randomBtn" aria-label="قطعة عشوائية">' + ICONS.shuffle + '<span>عشوائي</span></button>' +
        '</div>' +
        '<div class="filters" id="filters">' + chips + '</div>' +
      '</div>';
  }

  function matchesSearch(p, q) {
    if (!q) return true;
    var hay = normAr([p.titleAr, p.titleEn, p.year, p.role, p.text, p.source].join(' '));
    var words = normAr(q).split(' ').filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      if (hay.indexOf(words[i]) === -1) return false;
    }
    return true;
  }

  function cardHTML(p) {
    var lv = levelInfo(p.level);
    var seen = isSeen(p.id);
    return '' +
      '<button class="passage-card ' + lv.cls + '" data-id="' + p.id + '" style="--i:' + Math.min(p.id, 12) + '">' +
        (seen ? '<i class="visited-dot" aria-label="تمت زيارتها"></i>' : '') +
        '<span class="card-index">' + p.n + '<small>PASSAGE</small></span>' +
        '<span class="card-body">' +
          '<span class="card-titles">' +
            '<strong>' + esc(p.titleAr) + '</strong>' +
            '<em>' + esc(p.titleEn) + '</em>' +
          '</span>' +
          '<span class="card-meta">' +
            '<span class="year-chip">' + esc(p.year) + '</span>' +
            '<span class="role-text">' + esc(p.role) + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="card-side">' +
          '<span class="diff-num"><b>' + p.words + '</b>كلمة</span>' +
          ICONS.chevronLeft +
        '</span>' +
      '</button>';
  }

  function renderList() {
    var area = document.getElementById('listArea');
    if (!area) return;
    var q = state.query;
    var filter = state.filter;
    var visible = DATA.filter(function (p) {
      if (filter !== 'all' && levelInfo(p.level).cls !== filter) return false;
      return matchesSearch(p, q);
    });
    var html = '';
    if (!visible.length) {
      html = '<div class="empty-state">' + ICONS.search +
        '<strong>لا توجد نتائج مطابقة</strong><span>جرّب كلمة أخرى أو اختر مستوى مختلفًا.</span></div>';
    } else if (q) {
      html = '<div class="level-section"><div class="section-head">' +
        '<div class="section-title-wrap"><h2>نتائج البحث</h2></div>' +
        '<span class="section-count">' + visible.length + ' / ' + DATA.length + '</span></div>' +
        '<div class="cards">' + visible.map(cardHTML).join('') + '</div></div>';
    } else {
      LEVELS.forEach(function (lv) {
        var list = visible.filter(function (p) { return p.level === lv.key; });
        if (!list.length) return;
        html += '<section class="level-section">' +
          '<div class="section-head">' +
            '<div class="section-title-wrap">' +
              '<span class="level-pill ' + lv.cls + '">' + lv.key + '</span>' +
              '<h2>' + lv.title + '</h2>' +
            '</div>' +
            '<span class="section-count">' + pad2(list.length) + ' PASSAGES</span>' +
          '</div>' +
          '<p class="section-desc">' + lv.desc + '</p>' +
          '<div class="cards">' + list.map(cardHTML).join('') + '</div>' +
        '</section>';
      });
    }
    area.innerHTML = html;
    var cards = area.querySelectorAll('.passage-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        state.homeScroll = window.scrollY || window.pageYOffset || 0;
        navigate('#/p/' + this.getAttribute('data-id'));
      });
    }
  }

  function footerHTML() {
    return '' +
      '<footer class="home-footer">' +
        '<img class="footer-logo" src="icon512.png" alt="">' +
        '<div>إعداد وتنسيق: <strong>الأستاذ علي معز الشلاه</strong></div>' +
        '<div>القطع الخارجية الوزارية · 2014 — 2026 · 78 قطعة و82 دورة امتحانية</div>' +
        '<a class="guide-entry" href="#/guide">📘 دليل حل القطعة الخارجية الوزارية</a>' +
        '<div class="latin">ALI MOEZ AL-SHALLAH · ENGLISH DEPARTMENT</div>' +
      '</footer>';
  }

  function bindHome() {
    var input = document.getElementById('searchInput');
    var clear = document.getElementById('clearSearch');
    if (input) {
      input.value = state.query;
      clear.classList.toggle('show', !!state.query);
      input.addEventListener('input', function () {
        state.query = this.value.trim();
        clear.classList.toggle('show', !!state.query);
        renderList();
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          this.value = '';
          state.query = '';
          clear.classList.remove('show');
          renderList();
        }
      });
    }
    if (clear) {
      clear.addEventListener('click', function () {
        state.query = '';
        if (input) { input.value = ''; input.focus(); }
        clear.classList.remove('show');
        renderList();
      });
    }
    var rb = document.getElementById('randomBtn');
    if (rb) rb.addEventListener('click', function () {
      var pool = DATA.filter(function (p) { return matchesSearch(p, state.query) && (state.filter === 'all' || levelInfo(p.level).cls === state.filter); });
      if (!pool.length) pool = DATA;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      state.homeScroll = window.scrollY || 0;
      navigate('#/p/' + pick.id);
    });
    var chips = document.querySelectorAll('.filter-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        state.filter = this.getAttribute('data-level');
        for (var k = 0; k < chips.length; k++) chips[k].classList.remove('active');
        this.classList.add('active');
        renderList();
      });
    }
    var ab = document.getElementById('aboutBtn');
    if (ab) ab.addEventListener('click', function () {
      state.homeScroll = window.scrollY || 0;
      navigate('#/about');
    });
  }

  function renderHome() {
    document.title = 'القطع الخارجية — السادس الإعدادي';
    app.innerHTML = heroHTML() +
      '<main class="home-main">' + toolbarHTML() +
        '<div id="listArea"></div>' + footerHTML() +
      '</main>';
    renderList();
    bindHome();
    hideBoot();
  }

  /* ================= DETAIL ================= */
  function passageHTML(text) {
    var out = '';
    var last = 0;
    var i = 0;
    var re = /\S+/g;
    var m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      out += '<span class="w" data-w="' + i + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
      i++;
    }
    out += esc(text.slice(last));
    return { html: out, count: i };
  }

  function questionHTML(q, idx) {
    var text = esc(q).replace(/_{2,}/g, '<span class="blank"></span>');
    return '<li><span class="q-num">' + (idx + 1) + '</span><span class="q-text">' + text + '</span></li>';
  }

  function answerHTML(a, idx) {
    var text = esc(a);
    return '<li><span class="a-num">' + (idx + 1) + '</span><span class="a-text">' + text + '</span></li>';
  }

  function panelHead(icon, title, sub, badge, badgeClass) {
    return '<div class="panel-head">' +
      '<span class="panel-icon">' + icon + '</span>' +
      '<div class="panel-head-text"><h3>' + title + '</h3><p>' + sub + '</p></div>' +
      (badge ? '<span class="panel-badge ' + (badgeClass || '') + '">' + badge + '</span>' : '') +
    '</div>';
  }

  function detailHTML(p) {
    var lv = levelInfo(p.level);
    var idx = 0;
    for (var i = 0; i < DATA.length; i++) if (DATA[i].id === p.id) { idx = i; break; }
    var prev = DATA[idx - 1];
    var next = DATA[idx + 1];
    var qList = p.questions.map(questionHTML).join('');
    var ansCount = p.answers.length;
    var sourceBadge = p.solutionSource === 'official' ? 'حل وزاري' : 'إجابة مقترحة';
    var sourceClass = p.solutionSource === 'official' ? 'green' : 'gold';

    return '' +
      '<header class="detail-hero ' + lv.cls + '">' +
        '<div class="detail-top">' +
          '<button class="icon-btn" id="backBtn" aria-label="رجوع">' + ICONS.back + '</button>' +
          '<span class="spacer"></span>' +
          '<span class="detail-index">PASSAGE <b>' + p.n + '</b> / ' + DATA.length + '</span>' +
        '</div>' +
        '<div class="detail-head">' +
          '<p class="eyebrow">' + lv.en + ' · ' + esc(p.year) + ' · ' + esc(p.role) + '</p>' +
          '<h1 class="detail-title-ar">' + esc(p.titleAr) + '</h1>' +
          '<p class="detail-title-en">' + esc(p.titleEn) + '</p>' +
          '<div class="detail-meta">' +
            '<span class="meta-chip level">' + p.level + '</span>' +
            '<span class="meta-chip">' + ICONS.clock + p.words + ' كلمة</span>' +
            '<span class="meta-chip">' + ICONS.help + p.questions.length + ' أسئلة</span>' +
            '<span class="meta-chip">' + ICONS.book + esc(p.year) + '</span>' +
          '</div>' +
          (p.note ? '<div class="detail-note">' + esc(p.note) + '</div>' : '') +
        '</div>' +
      '</header>' +
      '<main class="detail-main">' +

        '<div class="timer-banner" id="timerBanner">' +
          '<span class="timer-icon" id="timerIcon">' + ICONS.clock + '</span>' +
          '<div class="timer-copy">' +
            '<strong id="timerTitle">الحل والترجمة مقفلان مؤقتًا</strong>' +
            '<span id="timerSub">يُفتحان تلقائيًا بعد إتمام 10 دقائق من فتح القطعة.</span>' +
          '</div>' +
          '<span class="timer-count" id="timerCount" data-clock>10:00</span>' +
          '<div class="timer-track"><i id="timerFill"></i></div>' +
        '</div>' +

        '<section class="audio-card" id="audioCard">' +
          '<div class="audio-top">' +
            '<div class="audio-title">' +
              '<span class="headphone">' + ICONS.volume + '</span>' +
              '<div><strong>استماع للقطعة</strong><span>تسجيل بصوت رجل بريطاني</span></div>' +
            '</div>' +
            '<span class="voice-badge"><span class="flag">🇬🇧</span> Ryan · UK</span>' +
          '</div>' +
          '<div class="audio-main">' +
            '<button class="play-btn" id="playBtn" aria-label="تشغيل">' + ICONS.play + '</button>' +
            '<div class="audio-timeline">' +
              '<div class="time-row"><span class="time-label" id="timeNow">0:00</span><span class="time-label" id="timeEnd">0:00</span></div>' +
              '<input class="seek" id="seek" type="range" min="0" max="1000" value="0" step="1" aria-label="موضع التسجيل">' +
            '</div>' +
          '</div>' +
          '<div class="audio-tools">' +
            '<div class="speeds">' +
              '<span class="speed-label">السرعة</span>' +
              '<button class="speed-btn" data-rate="0.75">0.75×</button>' +
              '<button class="speed-btn" data-rate="1">1×</button>' +
              '<button class="speed-btn" data-rate="1.25">1.25×</button>' +
              '<button class="speed-btn" data-rate="1.5">1.5×</button>' +
            '</div>' +
            '<div class="seek-btns">' +
              '<button class="seek-btn" id="back10" aria-label="رجوع 10 ثوان">' + ICONS.arrowStart + '</button>' +
              '<button class="seek-btn" id="fwd10" aria-label="تقديم 10 ثوان">' + ICONS.arrowEnd + '</button>' +
            '</div>' +
          '</div>' +
          '<p class="audio-hint" id="audioHint">اسحب الشريط للانتقال، أو اضغط كلمة من القطعة.</p>' +
        '</section>' +

        '<article class="reading-card">' +
          '<div class="reading-head">' +
            '<span class="eyebrow">THE PASSAGE</span>' +
            '<span class="word-count">' + ICONS.text + p.words + ' كلمة</span>' +
            '<span class="font-controls">' +
              '<button class="font-btn" id="fontMinus" aria-label="تصغير الخط">A-</button>' +
              '<button class="font-btn" id="fontPlus" aria-label="تكبير الخط">A+</button>' +
            '</span>' +
          '</div>' +
          '<div class="passage-text" id="passageText" dir="ltr" lang="en">' + passageHTML(p.text).html + '</div>' +
          '<div class="reading-foot">' +
            '<span>اضغط أي كلمة للانتقال إلى موضعها في التسجيل</span>' +
            '<span class="uk"><span class="flag">🇬🇧</span> British accent</span>' +
          '</div>' +
        '</article>' +

        '<section class="panel">' +
          panelHead(ICONS.help, 'الأسئلة', 'أجب أولًا بنفسك قبل النظر إلى الحل', p.questions.length + ' سؤال', '') +
          '<ul class="questions">' + qList + '</ul>' +
        '</section>' +

        '<section class="gate" id="gateAnswers" data-gate="answers">' +
          '<div class="gate-inner">' +
            '<span class="gate-icon">' + ICONS.lock + '</span>' +
            '<div class="gate-copy"><h3>الحلول محجوبة مؤقتًا</h3><p>تُفتح تلقائيًا بعد إتمام المدة المحددة من فتح القطعة.</p></div>' +
            '<div class="gate-time"><b data-clock>10:00</b><span>متبقٍ</span></div>' +
          '</div>' +
          '<div class="gate-track"><i data-gate-fill></i></div>' +
        '</section>' +

        '<section class="gate" id="gateTranslation" data-gate="translation">' +
          '<div class="gate-inner">' +
            '<span class="gate-icon">' + ICONS.lock + '</span>' +
            '<div class="gate-copy"><h3>الترجمة العربية محجوبة</h3><p>تظهر بعد انتهاء العدّاد، لتقرأ النص وتفهمه بنفسك أولًا.</p></div>' +
            '<div class="gate-time"><b data-clock>10:00</b><span>متبقٍ</span></div>' +
          '</div>' +
          '<div class="gate-track"><i data-gate-fill></i></div>' +
        '</section>' +

        '<section class="panel content-panel" id="answersPanel" hidden>' +
          panelHead(ICONS.check, 'الحلول النموذجية', 'الإجابات الصحيحة مرتبة بحسب الأسئلة', sourceBadge, sourceClass) +
          '<ul class="answers">' + p.answers.map(answerHTML).join('') + '</ul>' +
          (p.solutionSource === 'official'
            ? '<div class="content-note">' + ICONS.info + '<span>الحلول منقولة من الأسئلة الوزارية الرسمية المرفقة بالقطع.</span></div>'
            : '<div class="content-note">' + ICONS.info + '<span>هذه إجابات مقترحة من إعداد التطبيق، راجعها مع مدرّسك عند الحاجة.</span></div>') +
        '</section>' +

        '<section class="panel content-panel" id="translationPanel" hidden>' +
          panelHead(ICONS.book, 'الترجمة العربية', 'ترجمة تقريبية لمعاني القطعة، لا تُغني عن قراءة النص الإنكليزي', 'AR', 'gold') +
          '<div class="translation-text" id="translationText" dir="rtl" lang="ar"></div>' +
          '<div class="content-note">' + ICONS.info + '<span>الترجمة للتوضيح والمراجعة، وقد تختلف بعض الصياغات حسب السياق.</span></div>' +
        '</section>' +

        '<nav class="pager">' +
          (prev
            ? '<button class="pager-btn" id="prevBtn"><span>' + ICONS.arrowStart + '</span><span><small>القطعة السابقة</small><strong>' + esc(prev.titleAr) + '</strong></span></button>'
            : '<span class="pager-btn disabled"></span>') +
          (next
            ? '<button class="pager-btn next" id="nextBtn"><span><small>القطعة التالية</small><strong>' + esc(next.titleAr) + '</strong></span><span>' + ICONS.arrowEnd + '</span></button>'
            : '<span class="pager-btn disabled"></span>') +
        '</nav>' +
        '<a class="guide-entry detail-guide-entry" href="#/guide">📘 افتح دليل حل القطعة الخارجية</a>' +
        '<a class="back-home" href="#/">' + ICONS.grid + ' العودة إلى فهرس القطع</a>' +
      '</main>';
  }

  function timerBannerLocked(fill, pct) {
    var banner = document.getElementById('timerBanner');
    if (!banner) return;
    var count = document.getElementById('timerCount');
    if (count) count.textContent = fill;
    var bar = document.getElementById('timerFill');
    if (bar) bar.style.width = pct + '%';
  }

  function setGateProgress(remaining) {
    var pct = Math.min(100, Math.max(0, (1 - remaining / UNLOCK_MS) * 100));
    var clocks = document.querySelectorAll('[data-clock]');
    var txt = fmtClock(remaining);
    for (var i = 0; i < clocks.length; i++) clocks[i].textContent = txt;
    var fills = document.querySelectorAll('[data-gate-fill]');
    for (var j = 0; j < fills.length; j++) fills[j].style.width = pct + '%';
    var bannerBar = document.getElementById('timerFill');
    if (bannerBar) bannerBar.style.width = pct + '%';
  }

  function tick(p, silent) {
    if (!state.locked) return;
    var remaining = state.openTs + UNLOCK_MS - Date.now();
    if (remaining <= 0) {
      unlockContent(p, silent);
      return;
    }
    timerBannerLocked(fmtClock(remaining), (1 - remaining / UNLOCK_MS) * 100);
    setGateProgress(remaining);
  }

  function startTimer(p) {
    teardownTimer();
    state.openTs = openStamp(p.id);
    state.locked = Date.now() < state.openTs + UNLOCK_MS;
    state.contentBuilt = false;
    if (!state.locked) {
      unlockContent(p, true);
      return;
    }
    tick(p, true);
    state.timerId = setInterval(function () { tick(p, false); }, 1000);
  }

  function buildLockedContent(p) {
    if (state.contentBuilt) return;
    state.contentBuilt = true;
    var tr = document.getElementById('translationText');
    if (tr) {
      var parts = String(p.translation || '').split(/\n{2,}/).filter(function (x) { return x.trim(); });
      tr.innerHTML = parts.length
        ? parts.map(function (x) { return '<p>' + esc(x.trim()) + '</p>'; }).join('')
        : '<p>' + esc(p.translation || '') + '</p>';
    }
    var a = document.getElementById('answersPanel');
    var t = document.getElementById('translationPanel');
    if (a) a.hidden = false;
    if (t) t.hidden = false;
    var ga = document.getElementById('gateAnswers');
    var gt = document.getElementById('gateTranslation');
    if (ga) ga.hidden = true;
    if (gt) gt.hidden = true;
  }

  function unlockContent(p, silent) {
    if (!state.locked && state.contentBuilt) return;
    state.locked = false;
    teardownTimer();
    buildLockedContent(p);
    var banner = document.getElementById('timerBanner');
    if (banner) banner.classList.add('unlocked');
    var icon = document.getElementById('timerIcon');
    if (icon) icon.innerHTML = ICONS.unlock;
    var title = document.getElementById('timerTitle');
    if (title) title.textContent = 'تم فتح الحل والترجمة';
    var sub = document.getElementById('timerSub');
    if (sub) sub.textContent = 'يمكنك الآن مراجعة الإجابات الصحيحة والترجمة العربية.';
    var count = document.getElementById('timerCount');
    if (count) count.textContent = 'مفتوح ✓';
    if (!silent) toast('تم فتح الحل والترجمة بعد 10 دقائق');
  }

  function setupFontControls() {
    var text = document.getElementById('passageText');
    if (!text) return;
    var size = savedFont();
    text.style.fontSize = size + 'px';
    var minus = document.getElementById('fontMinus');
    var plus = document.getElementById('fontPlus');
    function apply(delta) {
      size = Math.min(26, Math.max(16, size + delta));
      text.style.fontSize = size + 'px';
      lsSet(FONT_KEY, String(size));
    }
    if (minus) minus.addEventListener('click', function () { apply(-1); });
    if (plus) plus.addEventListener('click', function () { apply(1); });
  }

  function renderDetail(p) {
    document.title = p.titleAr + ' — القطع الخارجية';
    app.innerHTML = detailHTML(p);
    markSeen(p.id);
    lsSet(LAST_KEY, String(p.id));
    var back = document.getElementById('backBtn');
    if (back) back.addEventListener('click', function () {
      state.homeScroll = 0;
      navigate('#/');
    });
    var prev = document.getElementById('prevBtn');
    if (prev) prev.addEventListener('click', function () {
      var i = DATA.indexOf(p);
      if (i > 0) navigate('#/p/' + DATA[i - 1].id);
    });
    var next = document.getElementById('nextBtn');
    if (next) next.addEventListener('click', function () {
      var i = DATA.indexOf(p);
      if (i > -1 && i < DATA.length - 1) navigate('#/p/' + DATA[i + 1].id);
    });
    setupFontControls();
    setupAudio(p);
    startTimer(p);
    hideBoot();
  }

  /* ================= AUDIO ================= */
  function teardownAudio() {
    if (state.audio) {
      try {
        state.audio.onerror = null;
        state.audio.ontimeupdate = null;
        state.audio.onloadedmetadata = null;
        state.audio.onplay = null;
        state.audio.onpause = null;
        state.audio.onended = null;
        state.audio.pause();
      } catch (e) {}
    }
    state.audio = null;
    state.audioP = null;
    state.wordEls = [];
    state.wordTimes = [];
    state.activeWord = -1;
  }

  function audioErrorMessage(msg) {
    var hint = document.getElementById('audioHint');
    if (hint) {
      hint.className = 'audio-error';
      hint.textContent = msg;
    }
  }

  function wordIndexAt(t) {
    var w = state.wordTimes;
    if (!w || !w.length) return -1;
    var lo = 0, hi = w.length - 1, ans = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (w[mid][0] <= t + 0.04) { ans = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    return ans;
  }

  function setActiveWord(index) {
    if (index === state.activeWord) return;
    var els = state.wordEls;
    if (state.activeWord > -1 && els[state.activeWord]) els[state.activeWord].classList.remove('active');
    if (index > -1 && els[index]) els[index].classList.add('active');
    state.activeWord = index;
  }

  function syncAudio() {
    var a = state.audio;
    if (!a) return;
    var p = state.audioP || {};
    var dur = 0;
    if (isFinite(a.duration) && a.duration > 0) dur = a.duration;
    else if (p.duration) dur = p.duration;
    var t = a.currentTime || 0;
    var nowEl = document.getElementById('timeNow');
    var endEl = document.getElementById('timeEnd');
    if (nowEl) nowEl.textContent = fmtTime(t);
    if (endEl) endEl.textContent = fmtTime(dur);
    var seek = document.getElementById('seek');
    if (seek && dur) {
      var pct = Math.max(0, Math.min(100, (t / dur) * 100));
      seek.value = String(Math.round(pct * 10));
      seek.style.setProperty('--p', pct + '%');
    }
    setActiveWord(wordIndexAt(t));
  }

  function setPlayIcon(playing) {
    var btn = document.getElementById('playBtn');
    if (!btn) return;
    btn.innerHTML = playing ? ICONS.pause : ICONS.play;
    btn.setAttribute('aria-label', playing ? 'إيقاف مؤقت' : 'تشغيل');
  }

  function applyRate(rate, save) {
    state.rate = rate;
    if (state.audio) {
      try {
        state.audio.playbackRate = rate;
        state.audio.preservesPitch = true;
        state.audio.mozPreservesPitch = true;
        state.audio.webkitPreservesPitch = true;
      } catch (e) {}
    }
    var btns = document.querySelectorAll('.speed-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', parseFloat(btns[i].getAttribute('data-rate')) === rate);
    }
    if (save) lsSet(RATE_KEY, String(rate));
  }

  function setupAudio(p) {
    teardownAudio();
    state.audioP = p;
    state.wordTimes = Array.isArray(p.wordTimes) ? p.wordTimes : [];
    var textEl = document.getElementById('passageText');
    state.wordEls = textEl ? Array.prototype.slice.call(textEl.querySelectorAll('.w')) : [];
    state.activeWord = -1;
    var playBtn = document.getElementById('playBtn');
    var speed = savedRate();
    applyRate(speed, false);

    if (!p.audio) {
      audioErrorMessage('تسجيل هذه القطعة غير متوفر حاليًا.');
      if (playBtn) playBtn.disabled = true;
      return;
    }

    var a = new Audio();
    a.preload = 'metadata';
    a.src = p.audio;
    state.audio = a;
    try {
      a.playbackRate = speed;
      a.preservesPitch = true;
    } catch (e) {}

    a.addEventListener('loadedmetadata', function () {
      try { a.playbackRate = state.rate; } catch (e) {}
      syncAudio();
    });
    a.addEventListener('durationchange', syncAudio);
    a.addEventListener('timeupdate', syncAudio);
    a.addEventListener('play', function () { setPlayIcon(true); });
    a.addEventListener('pause', function () { setPlayIcon(false); });
    a.addEventListener('ended', function () {
      setPlayIcon(false);
      setActiveWord(-1);
      try { a.currentTime = 0; } catch (e) {}
      syncAudio();
    });
    a.addEventListener('error', function () {
      audioErrorMessage('تعذّر تشغيل التسجيل داخل التطبيق. أعد فتح القطعة ثم اضغط تشغيل.');
    });

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (a.paused) {
          var pr = a.play();
          if (pr && pr.catch) pr.catch(function () {
            audioErrorMessage('اضغط زر التشغيل مرة أخرى لبدء الاستماع.');
          });
        } else {
          a.pause();
        }
      });
    }

    var seek = document.getElementById('seek');
    if (seek) {
      seek.addEventListener('input', function () {
        var dur = isFinite(a.duration) && a.duration > 0 ? a.duration : (p.duration || 0);
        if (!dur) return;
        a.currentTime = (parseInt(this.value, 10) / 1000) * dur;
        syncAudio();
      });
    }

    var back = document.getElementById('back10');
    var fwd = document.getElementById('fwd10');
    if (back) back.addEventListener('click', function () {
      a.currentTime = Math.max(0, a.currentTime - 10);
      syncAudio();
    });
    if (fwd) fwd.addEventListener('click', function () {
      var dur = isFinite(a.duration) && a.duration > 0 ? a.duration : (p.duration || 1e9);
      a.currentTime = Math.min(dur - 0.2, a.currentTime + 10);
      syncAudio();
    });

    var rateBtns = document.querySelectorAll('.speed-btn');
    for (var i = 0; i < rateBtns.length; i++) {
      rateBtns[i].addEventListener('click', function () {
        applyRate(parseFloat(this.getAttribute('data-rate')), true);
      });
    }

    for (var w = 0; w < state.wordEls.length; w++) {
      (function (idx) {
        state.wordEls[idx].addEventListener('click', function () {
          var times = state.wordTimes;
          if (!times[idx]) return;
          a.currentTime = Math.max(0, times[idx][0] - 0.03);
          syncAudio();
          if (a.paused) {
            var pr = a.play();
            if (pr && pr.catch) pr.catch(function () {});
          }
        });
      })(w);
    }

    syncAudio();
  }

  /* ================= STUDY GUIDE ================= */
  function renderGuide() {
    document.title = 'دليل حل القطعة الخارجية — القطع الخارجية';
    var refs = DATA.map(function (p) {
      return '<a class="guide-ref" href="#/p/' + p.id + '"><b>' + esc(p.n) + '</b><span><strong>' + esc(p.titleAr) + '</strong><small>' + esc(p.titleEn) + ' · ' + esc(p.year) + '</small></span><i>فتح القطعة ←</i></a>';
    }).join('');
    app.innerHTML = '<header class="guide-hero"><div class="guide-top"><a class="icon-btn" href="#/">' + ICONS.back + '</a><span>STUDY GUIDE · 2027</span></div><div class="guide-kicker">MINISTRY READING</div><h1>دليل حل القطعة الخارجية</h1><p>خطوات عملية لفهم القطعة والإجابة عن أسئلتها</p><div class="guide-pills"><span>78 قطعة مرتبطة</span><span>شرح مختصر</span><span>يعمل دون إنترنت</span></div></header>' +
      '<main class="guide-main">' +
      '<section class="guide-callout"><small>الفكرة الأساسية</small><p>اقرأ لفهم المعنى، ثم ارجع إلى السطر الذي يحتوي الدليل على الإجابة. لا تعتمد على التخمين أو حفظ قالب واحد.</p></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>01</span><div><h2>خطة الحل في ست خطوات</h2><p>ابدأ من فهم النص ثم انتقل إلى الإجابة</p></div></div><div class="guide-steps">' +
      ['اقرأ التعليمات وانتبه إلى عدد الإجابات المطلوبة.','اقرأ القطعة سريعاً لتعرف موضوعها والشخصيات والأحداث.','اقرأ الأسئلة وحدد الكلمات المفتاحية: اسم، مكان، زمن.','ارجع إلى القطعة وابحث عن الجملة أو الفكرة الدالة.','اكتب إجابة واضحة مع مراعاة الزمن والضمير وصيغة الفعل.','راجع مطابقة كل إجابة للسؤال وعدم ترك أي فرع مطلوب.'].map(function(x,i){return '<div class="guide-step"><b>'+(i+1)+'</b><span>'+x+'</span></div>';}).join('') + '</div><p class="guide-note">عدد الفروع المطلوب قد يختلف حسب تعليمات السؤال؛ اقرأ المطلوب في ورقتك.</p></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>02</span><div><h2>كلمات السؤال WH</h2><p>حدد نوع المعلومة التي يبحث عنها السؤال</p></div></div><div class="guide-wh">' +
      [['What','شيء أو معلومة أو حدث'],['Where','مكان'],['When','زمن أو وقت'],['Who','شخص'],['Which','اختيار بين بدائل'],['Whose','الملكية: لمن يعود الشيء؟'],['Why','السبب؛ غالباً تبدأ الإجابة بـ Because'],['How','الطريقة أو الكيفية'],['How many','عدد المعدود'],['How much','كمية أو مقدار'],['How far','المسافة'],['How long','المدة أو الطول حسب السياق'],['How often','التكرار: كم مرة؟']].map(function(x){return '<div class="guide-wh-row"><b dir="ltr">'+x[0]+'</b><span>'+x[1]+'</span></div>';}).join('') + '</div></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>03</span><div><h2>بناء إجابة WH</h2><p>ابدأ بالفاعل وحافظ على الزمن المناسب</p></div></div><div class="guide-formula">الفاعل + الفعل المساعد (إن وجد) + الفعل الرئيسي بصيغته الصحيحة + المعلومة المطلوبة</div><div class="guide-transform"><div><b>DO</b><p>نحذف Do ويبقى الفعل بصيغته الأساسية.</p><code>Do + subject + base verb</code></div><div><b>DOES</b><p>نحذف Does ويأخذ الفعل s مع المفرد الغائب.</p><code>Does + subject + base verb</code></div><div><b>DID</b><p>نحذف Did ونحوّل الفعل إلى الماضي.</p><code>Did + subject + base verb</code></div></div><p class="guide-note">الأفعال المساعدة مثل am / is / are / was / were / will / can / should تبقى عندما يتطلب تركيب الجملة ذلك، مع اختيار ما يناسب الفاعل والزمن. في سؤال Why أجب عن السبب المذكور في القطعة، ويمكن أن تبدأ بـ Because.</p></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>04</span><div><h2>أنواع الأسئلة الشائعة</h2><p>تعامل مع كل نوع بالطريقة المناسبة</p></div></div><div class="guide-types">' +
      [['Yes / No','إذا بدأ السؤال بفعل مساعد، أجب بـ Yes أو No ثم الضمير والفعل المساعد نفسه.','Yes, he did. / No, he won’t.'],['True / False','قارن معنى العبارة بما ورد في القطعة، وحدد المعلومة الصحيحة عند الخطأ.','تحقق من دليل العبارة في النص.'],['Or / Choice','اختر البديل الذي تؤيده القطعة، واكتب إجابة قصيرة واضحة.','اتبع معنى النص لا التخمين.'],['What was … doing?','ابحث عما كان الشخص يفعله، وحافظ على صيغة الاستمرار إذا كان السؤال بالماضي المستمر.','Ahmed was helping his father.'],['What happened to …?','اذكر الحدث الذي وقع للشخص أو الشيء كما توضحه القطعة.','راعِ زمن الفعل.'],['Suitable title','اختر عنواناً قصيراً يعبّر عن الفكرة الرئيسية، لا عنواناً عاماً.','استند إلى موضوع القطعة.']].map(function(x){return '<article class="guide-type"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><small>'+x[2]+'</small></article>';}).join('') + '</div></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>05</span><div><h2>ملاحظات ترفع دقة الإجابة</h2><p>انتبه إلى المعنى والسياق</p></div></div><ul class="guide-bullets"><li>إذا لم تجد السؤال بالنص نفسه، ابحث عن المعنى المقصود؛ فقد تختلف الصياغة.</li><li><b>The writer</b> تعني الشخص الذي يروي أو يتحدث في القطعة بحسب سياقها.</li><li><b>How</b> قد تسأل عن الطريقة، مثل by bus أو on foot.</li><li><b>How often</b> ترتبط بكلمات التكرار مثل always, often, sometimes, once, twice, every day.</li><li><b>How long</b> قد تسأل عن مدة باستعمال for أو since، وقد تسأل عن الطول.</li><li>في <b>Whose</b> ابحث عن علامة الملكية أو صاحب الشيء.</li><li>استنتج معنى الكلمة غير المعروفة من الجملة والسياق.</li></ul></section>' +
      '<section class="guide-section"><div class="guide-section-head"><span>06</span><div><h2>قائمة المراجعة</h2><p>قبل تسليم الإجابة</p></div></div><div class="guide-checks">' + ['أجبت عن العدد المطلوب من الفروع.','كل إجابة مستندة إلى معنى القطعة.','بدأت بالفاعل عند الحاجة.','راجعت الزمن وصيغة الفعل والضمير.','راجعت الاختيارات وعبارات True / False.','العنوان يعبّر عن الفكرة الرئيسية.'].map(function(x){return '<label><input type="checkbox"><span>'+x+'</span></label>';}).join('') + '</div></section>' +
      '<section class="guide-section guide-index"><div class="guide-section-head"><span>↗</span><div><h2>فهرس القطع المرجعي</h2><p>اختر أي قطعة للانتقال إليها مباشرة</p></div></div><div class="guide-ref-list">'+refs+'</div></section>' +
      '<div class="guide-sign">إعداد وتنسيق<br><strong>الأستاذ علي معز الشلاه</strong><small>ALI MOEZ AL-SHALLAH · ENGLISH DEPARTMENT</small></div><a class="back-home" href="#/">' + ICONS.grid + ' العودة إلى فهرس القطع</a></main>';
    hideBoot();
  }

  /* ================= ABOUT ================= */
  function renderAbout() {
    document.title = 'عن التطبيق — القطع الخارجية';
    app.innerHTML = '' +
      '<header class="about-hero">' +
        '<div class="top-nav"><button class="icon-btn" id="aboutBack" aria-label="رجوع">' + ICONS.back + '</button></div>' +
        '<img class="about-logo" src="icon512.png" alt="شعار الأستاذ علي معز الشلاه">' +
        '<h1>القطع الخارجية</h1>' +
        '<p>السادس الإعدادي · اللغة الإنكليزية</p>' +
        '<div class="latin">MINISTRY PASSAGES · 2014 — 2026</div>' +
      '</header>' +
      '<main class="about-main">' +
        '<div class="about-grid">' +
          '<section class="about-card">' +
            '<h3>' + ICONS.info + ' عن التطبيق</h3>' +
            '<p>تطبيق يجمع القطع الخارجية الوزارية لمادة اللغة الإنكليزية للسادس الإعدادي، مرتبة بحسب ورودها في الملف الأصلي، مع أسئلة كل قطعة وحلولها وترجمتها.</p>' +
            '<p>يعمل التطبيق دون إنترنت. عند الخروج من القطعة يُحجب الحل والترجمة، ويبدأ عدّاد جديد لمدة 10 دقائق عند فتحها مجددًا.</p>' +
          '</section>' +
          '<section class="about-card">' +
            '<h3>' + ICONS.help + ' طريقة الاستخدام</h3>' +
            '<ol class="steps">' +
              '<li>افتح القطعة من الفهرس واقرأ النص الإنكليزي بتمعّن.</li>' +
              '<li>استمع إلى التسجيل بصوت بريطاني، وعدّل السرعة حسب مستواك.</li>' +
              '<li>أجب عن الأسئلة بنفسك قبل النظر إلى الحل.</li>' +
              '<li>بعد 10 دقائق من فتح القطعة يظهر الحل والترجمة تلقائيًا.</li>' +
            '</ol>' +
          '</section>' +
          '<section class="about-card">' +
            '<h3>' + ICONS.volume + ' الاستماع والسرعة</h3>' +
            '<p>التسجيل بصوت رجل بريطاني واضح، ويمكنك اختيار سرعة 0.75× أو 1× أو 1.25× أو 1.5×، والانتقال إلى أي كلمة بالضغط عليها.</p>' +
            '<p>يُحفظ اختيار السرعة تلقائيًا لجميع القطع.</p>' +
          '</section>' +
          '<section class="about-card">' +
            '<h3>' + ICONS.grid + ' المحتوى بالأرقام</h3>' +
            '<div class="about-stats">' +
              '<div class="about-stat"><b>' + (META.total || 78) + '</b><span>قطعة وزارية</span></div>' +
              '<div class="about-stat"><b>' + (META.questions || 469) + '</b><span>سؤالًا</span></div>' +
              '<div class="about-stat"><b>' + (META.sessions || 82) + '</b><span>دورة امتحانية</span></div>' +
              '<div class="about-stat"><b>10</b><span>دقائق الانتظار</span></div>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="about-signature">' +
          '<strong>الأستاذ علي معز الشلاه</strong>' +
          '<span>إعداد وتنسيق المحتوى</span>' +
          '<div class="latin">ALI MOEZ AL-SHALLAH</div>' +
        '</div>' +
        '<div class="about-version">VERSION ' + (META.version || '1.0') + ' · OFFLINE EDITION</div>' +
      '</main>';
    var back = document.getElementById('aboutBack');
    if (back) back.addEventListener('click', function () {
      navigate('#/');
    });
    hideBoot();
  }

  /* ================= WELCOME ================= */
  function maybeWelcome() {
    if (lsGet(WELCOME_KEY) === '1') return;
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'welcomeOverlay';
    overlay.innerHTML = '' +
      '<div class="welcome" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">' +
        '<button class="welcome-close" id="welcomeClose" aria-label="إغلاق">' + ICONS.close + '</button>' +
        '<div class="welcome-logo"><img src="icon512.png" alt=""></div>' +
        '<p class="eyebrow">WELCOME · أهلاً بك</p>' +
        '<h2 id="welcomeTitle">القطع الخارجية</h2>' +
        '<p class="lead">78 قطعة وزارية للسادس الإعدادي، مع الاستماع بصوت بريطاني، والحل والترجمة بعد عشر دقائق من فتح القطعة.</p>' +
        '<div class="welcome-steps">' +
          '<div class="welcome-step"><span class="n">1</span><div><strong>اقرأ القطعة بتمعّن</strong><span>النص الإنكليزي كاملًا مع عدد الكلمات.</span></div></div>' +
          '<div class="welcome-step"><span class="n">2</span><div><strong>استمع وتحكّم بالسرعة</strong><span>صوت رجل بريطاني، واضغط أي كلمة للانتقال إليها.</span></div></div>' +
          '<div class="welcome-step"><span class="n">3</span><div><strong>انتظر العدّاد</strong><span>بعد 10 دقائق يظهر الحل والترجمة تلقائيًا.</span></div></div>' +
        '</div>' +
        '<button class="welcome-cta" id="welcomeStart">ابدأ الآن</button>' +
        '<p class="welcome-note">إعداد: الأستاذ علي معز الشلاه</p>' +
      '</div>';
    document.body.appendChild(overlay);
    function close() {
      lsSet(WELCOME_KEY, '1');
      overlay.classList.add('hidden');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 240);
    }
    var c = document.getElementById('welcomeClose');
    var s = document.getElementById('welcomeStart');
    if (c) c.addEventListener('click', close);
    if (s) s.addEventListener('click', close);
  }

  /* ================= BOOT ================= */
  var bootHidden = false;
  function hideBoot() {
    if (bootHidden || !boot) return;
    bootHidden = true;
    setTimeout(function () { boot.classList.add('done'); }, 360);
    setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 1100);
  }

  /* ================= INIT ================= */
  function init() {
    if (!DATA.length) {
      hideBoot();
      app.innerHTML = '<div style="padding:48px 22px"><div class="empty-state">' +
        '<strong>تعذّر تحميل بيانات القطع</strong>' +
        '<span>أعد تشغيل التطبيق، فإن استمرت المشكلة فأعد تثبيته.</span>' +
      '</div></div>';
      return;
    }
    maybeWelcome();
    window.addEventListener('hashchange', route);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && state.locked && state.audioP) tick(state.audioP, false);
    });
    route();
  }

  init();
})();

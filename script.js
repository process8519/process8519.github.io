/* =========================================================
   process8519 — interactions
   Vanilla JavaScript. No dependencies.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function savedTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? '切换浅色模式' : '切换深色模式');
    }

    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#111110' : '#f3f0e8');
    }

    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch (error) { /* 忽略隐私模式下的写入失败 */ }
    }
  }

  applyTheme(root.dataset.theme || (systemDark.matches ? 'dark' : 'light'), false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  systemDark.addEventListener('change', function (event) {
    if (!savedTheme()) {
      applyTheme(event.matches ? 'dark' : 'light', false);
    }
  });

  /* ---------- Header, scroll progress & active navigation ---------- */
  var header = document.getElementById('siteHeader');
  var progressBar = document.getElementById('progressBar');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sectionIds = ['about', 'skills', 'projects', 'contact'];
  var sections = sectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);
  var ticking = false;

  function updateScrollUI() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (progressBar) {
      progressBar.style.width = (progress * 100).toFixed(2) + '%';
    }

    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 16);
    }

    var marker = scrollTop + (header ? header.offsetHeight : 0) + window.innerHeight * 0.28;
    var currentId = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) {
        currentId = section.id;
      }
    });

    if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      currentId = sections.length ? sections[sections.length - 1].id : currentId;
    }

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateScrollUI();

  /* ---------- Mobile navigation ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var siteNav = document.getElementById('siteNav');

  function setMenu(open) {
    document.body.classList.toggle('nav-open', open);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    }
    if (open && siteNav) {
      var firstLink = siteNav.querySelector('a');
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 60);
      }
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('nav-open'));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open')) {
        setMenu(false);
        if (menuToggle) {
          menuToggle.focus();
        }
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setMenu(false);
      if (menuToggle) {
        menuToggle.focus();
      }
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && document.body.classList.contains('nav-open')) {
      setMenu(false);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* ---------- Local time ---------- */
  var localTime = document.getElementById('localTime');
  var timeFormatter = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  function updateTime() {
    if (localTime) {
      localTime.textContent = timeFormatter.format(new Date());
    }
  }

  updateTime();
  window.setInterval(updateTime, 15000);

  /* ---------- Typewriter ---------- */
  var typewriter = document.getElementById('typewriter');
  var phrases = ['keep_curious', 'build_things', 'stay_humble'];
  var phraseIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function typeLoop() {
    if (!typewriter) {
      return;
    }

    var phrase = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    typewriter.textContent = phrase.slice(0, charIndex);

    var delay = deleting ? 55 : 95;

    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      delay = 1700;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 420;
    }

    window.setTimeout(typeLoop, delay);
  }

  if (typewriter) {
    if (reduceMotion) {
      typewriter.textContent = phrases[0];
    } else {
      window.setTimeout(typeLoop, 1000);
    }
  }

  /* ---------- Year & footer ---------- */
  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ---------- A small note for curious people ---------- */
  try {
    console.log(
      '%c p/8519 %c 保持好奇，持续构建。 ',
      'background:#ef4b26;color:#fff9f4;font-weight:700;padding:4px 8px;border-radius:3px 0 0 3px;',
      'background:#151411;color:#f3f0e8;padding:4px 8px;border-radius:0 3px 3px 0;'
    );
  } catch (error) { /* 忽略 */ }
}());

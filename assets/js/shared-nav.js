(function () {
  var config = window.siteConfig || {};

  function renderSharedNav() {
    var navRoot = document.getElementById('site-nav-root');
    if (!navRoot) return;

    navRoot.innerHTML = [
      '<nav class="top-nav">',
      '  <div class="nav-left"><a class="brand" href="index.html"><img src="' + (config.mark || 'assets/jisw-favicon/favicon-32x32.png') + '" alt="J&I SimWorks Systems mark" class="brand-logo"><span>J&I Flight Tools</span></a></div>',
      '  <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-menu">',
      '    <span></span><span></span><span></span>',
      '  </button>',
      '  <div class="nav-links" id="site-menu">',
      '    <a href="index.html">Home</a>',
      '    <a href="calendar.html">Calendar</a>',
      '    <a href="flight-checklists.html">Flight Checklists</a>',
      '    <a href="navigation-tools.html">Navigation Tools</a>',
      '    <a href="threat-database.html">Threats</a>',
      '    <a href="comms.html">Comms</a>',
      '    <a href="brevities.html">Brevities</a>',
      '    <a href="formations.html">Formations</a>',
      '    <a href="tot-calculator.html">TOT Calculator</a>',
      '    <button class="site-nav__refresh" type="button" aria-label="Refresh page and resources" title="Refresh page and resources">',
      '      <svg class="site-nav__refresh-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11a8 8 0 0 0-14.9-4M5 3v4h4M4 13a8 8 0 0 0 14.9 4M19 21v-4h-4"/></svg>',
      '      <span class="site-nav__refresh-label" role="status" aria-live="polite">Refresh</span>',
      '    </button>',
      '  </div>',
      '</nav>'
    ].join('');

    var current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var links = navRoot.querySelectorAll('.nav-links a');

    links.forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      if (href === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  renderSharedNav();

  if (!document.querySelector('.site-footer')) {
    document.body.insertAdjacentHTML('beforeend', '<footer class="site-footer"><span>Part of <a class="site-footer__link" href="https://jisw-systems.github.io/main-site/">J&amp;I SimWorks Systems</a></span><a class="site-footer__link" href="legal.html">Legal &amp; Privacy</a></footer>');
  }

  var refreshButton = document.querySelector('.site-nav__refresh');
  if (refreshButton) {
    refreshButton.addEventListener('click', function () {
      refreshButton.disabled = true;
      refreshButton.classList.add('is-checking');
      refreshButton.setAttribute('aria-label', 'Checking for updates');
      refreshButton.querySelector('.site-nav__refresh-label').textContent = 'Checking...';
      var navLinks = document.getElementById('site-menu');
      var menuToggle = document.querySelector('.menu-toggle');
      if (window.innerWidth < 760 && navLinks && menuToggle) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
      var resources = [
        window.location.href,
        new URL('data/dcs_locations.json', window.location.href).href
      ];
      document.querySelectorAll('link[rel~="stylesheet"][href], script[src], img[src], source[src]').forEach(function (resource) {
        var attribute = resource.tagName === 'LINK' ? 'href' : 'src';
        var url = new URL(resource.getAttribute(attribute), window.location.href);
        if (url.origin === window.location.origin) resources.push(url.href);
      });

      Promise.all(Array.from(new Set(resources)).map(function (resourceUrl) {
        return fetch(resourceUrl, { cache: 'reload' }).then(function (response) {
          if (!response.ok) throw new Error('Refresh request failed: ' + response.status);
        });
      })).then(function () {
        var pageUrl = new URL(window.location.href);
        pageUrl.searchParams.set('_refresh', Date.now().toString());
        window.location.replace(pageUrl.href);
      }).catch(function (error) {
        console.error('Unable to refresh the page and its assets.', error);
        refreshButton.disabled = false;
        refreshButton.classList.remove('is-checking');
        refreshButton.setAttribute('aria-label', 'Refresh failed. Try again');
        refreshButton.title = 'Refresh failed. Try again';
        refreshButton.querySelector('.site-nav__refresh-label').textContent = 'Retry';
      });
    });
  }
})();

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
      '    <a href="threat-database.html">Threats</a>',
      '    <a href="comms.html">Comms</a>',
      '    <a href="brevities.html">Brevities</a>',
      '    <a href="formations.html">Formations</a>',
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
    document.body.insertAdjacentHTML('beforeend', '<footer class="site-footer">Part of <a class="site-footer__link" href="https://jisw-systems.github.io/main-site/">J&amp;I SimWorks Systems</a></footer>');
  }
})();

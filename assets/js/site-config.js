window.siteConfig = window.siteConfig || {
  brand: 'J&I Flight Tools',
  parentBrand: 'J&I SimWorks Systems',
  logo: 'assets/jisw-logo.png',
  mark: 'assets/jisw-favicon/favicon-32x32.png',
  favicons: [
    { rel: 'icon', type: 'image/x-icon', href: 'assets/jisw-favicon/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'assets/jisw-favicon/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'assets/jisw-favicon/favicon-32x32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: 'assets/jisw-favicon/apple-touch-icon.png' },
    { rel: 'manifest', href: 'assets/jisw-favicon/site.webmanifest' }
  ],
  titles: {
    inicio: 'J&I Flight Tools — Home',
    calendar: 'J&I Flight Tools — Calendar',
    'flight-checklists': 'J&I Flight Tools — Flight Checklists',
    threats: 'J&I Flight Tools — Threat Database',
    comms: 'J&I Flight Tools — Comms',
    brevities: 'J&I Flight Tools — Brevities',
    formations: 'J&I Flight Tools — Formations'
  }
};

(function () {
  var config = window.siteConfig;
  var page = document.body && document.body.dataset && document.body.dataset.page
    ? document.body.dataset.page
    : 'inicio';

  if (config.titles && config.titles[page]) {
    document.title = config.titles[page];
  } else if (config.brand) {
    document.title = config.brand;
  }

  if (config.favicons) {
    config.favicons.forEach(function (favicon) {
      var iconLink = document.createElement('link');
      iconLink.rel = favicon.rel;
      if (favicon.type) iconLink.type = favicon.type;
      if (favicon.sizes) iconLink.sizes = favicon.sizes;
      iconLink.href = favicon.href;
      document.head.appendChild(iconLink);
    });
  }
})();

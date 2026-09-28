window.siteConfig = window.siteConfig || {
  brand: 'J&I Flight Tools',
  parentBrand: 'J&I SimWorks Systems',
  logo: 'assets/jisw-logo.png',
  mark: 'assets/jisw-favicon/favicon-32x32.png',
  titles: {
    inicio: 'J&I Flight Tools — Home',
    calendar: 'J&I Flight Tools — Calendar',
    'flight-checklists': 'J&I Flight Tools — Flight Checklists',
    threats: 'J&I Flight Tools — Threat Database',
    comms: 'J&I Flight Tools — Comms',
    brevities: 'J&I Flight Tools — Brevities',
    formations: 'J&I Flight Tools — Formations',
    'tot-calculator': 'J&I Flight Tools — TOT Calculator'
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

})();

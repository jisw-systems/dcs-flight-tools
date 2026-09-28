/* ===========================
   FILE: main.js
   =========================== */
document.addEventListener('DOMContentLoaded', function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('pageshow', function (event) {
    document.body.classList.remove('page-exit');
    if (!reducedMotion && event.persisted) {
      document.body.classList.remove('page-return');
      window.requestAnimationFrame(function () {
        document.body.classList.add('page-return');
      });
    }
  });

  if (!reducedMotion) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target && link.target !== '_self') return;

        var destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;

        event.preventDefault();
        document.body.classList.add('page-exit');
        window.setTimeout(function () {
          window.location.href = destination.href;
        }, 280);
      });
    });
  }

  var splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    var splashDelay = reducedMotion ? 100 : 3800;
    window.setTimeout(function () {
      document.documentElement.classList.remove('splash-active');
      document.body.classList.remove('splash-active');
      splashScreen.remove();
    }, splashDelay);
  }

  var menuToggle = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    function closeMenu() {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    menuToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 760) closeMenu();
      });
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth < 760 && !navLinks.contains(e.target) && e.target !== menuToggle) {
        closeMenu();
      }
    });
  }

  var aircraftSearch = document.getElementById('perneras-search');
  var aircraftEmpty = document.getElementById('perneras-empty');
  if (aircraftSearch && aircraftEmpty) {
    var aircraftItems = document.querySelectorAll('.perneras-list li');
    aircraftSearch.addEventListener('input', function () {
      var query = aircraftSearch.value.trim().toLowerCase();
      var matches = 0;

      aircraftItems.forEach(function (item) {
        var label = item.textContent || '';
        var match = !query || label.toLowerCase().indexOf(query) !== -1;
        item.classList.toggle('is-hidden', !match);
        if (match) matches += 1;
      });

      aircraftEmpty.hidden = matches !== 0;
    });
  }

  function setChecklistState(btn, done) {
    btn.classList.toggle('is-done', done);
    btn.setAttribute('aria-pressed', done ? 'true' : 'false');
    var key = btn.getAttribute('data-key');
    if (!key) return;
    try {
      localStorage.setItem('dcs-checklist-' + key, done ? 'done' : 'pending');
    } catch (e) {}
  }

  function refreshToggleAllButton(panel) {
    var button = panel.querySelector('.toggle-all-checklist');
    if (!button) return;
    var items = panel.querySelectorAll('.check-item');
    var allDone = items.length > 0 && Array.from(items).every(function (item) {
      return item.classList.contains('is-done');
    });
    button.textContent = allDone ? 'Unmark all' : 'Mark all';
  }

  var chuckGuides = {
    tf51: {
      summary: 'Prioritize a clean start, engine stability, and flight preparation before moving the aircraft.',
      items: [
        'Verify that the carburetor, fuel pump, and RPM are set correctly.',
        'Warm up the engine before leaving the parking area.',
        'Check trim, oxygen, and radio before taxi.'
      ]
    },
    p47: {
      summary: 'This aircraft requires an orderly fuel, pressure, and cooling setup before takeoff.',
      items: [
        'Check the carburetor, tank selector, and cooling flaps.',
        'Complete a stable warm-up before increasing RPM.',
        'Do not forget the trim and radio setup before departure.'
      ]
    },
    f4u1d: {
      summary: 'The key is correct priming, oil pressure, and mixture setup before starting.',
      items: [
        'Check the fuel selector and starter position.',
        'Confirm warm-up and oil pressure before departure.',
        'Prepare the flaps and supercharger settings for the initial leg.'
      ]
    },
    bf109: {
      summary: 'This aircraft requires a precise start and proper warm-up to avoid problems on departure.',
      items: [
        'Verify the fuel pumps, magnetos, and ignition before starting.',
        'Ensure engine warm-up and coolant stability.',
        'Prepare the radiators, oxygen, and radio for taxi and takeoff.'
      ]
    },
    fw190a8: {
      summary: 'Engine warm-up and fuel-pressure control are the priorities here.',
      items: [
        'Check fuel pressure before starting.',
        'Use a progressive warm-up until the oil and engine are stable.',
        'Prepare the flaps, canopy, and oxygen before departure.'
      ]
    },
    fw190d9: {
      summary: 'It needs a clean start and thorough warm-up to leave the engine in good condition.',
      items: [
        'Check fuel pressure and the cooling-flap position.',
        'Warm up the oil and coolant before departure.',
        'Do not forget the canopy, oxygen, and landing-gear setup before taxi.'
      ]
    },
    spitfire: {
      summary: 'The short guide here is: prepare the carburetor, mixture, and warm-up before moving.',
      items: [
        'Check the carburetor filter and fuel-selector position.',
        'Warm up the engine before departure.',
        'Check the radio, oxygen, and trim before takeoff.'
      ]
    },
    mosquito: {
      summary: 'For this aircraft, the key is preparing the fuel system, radiators, and engines before moving.',
      items: [
        'Check the fuel valves, pressure, and fuel transfer.',
        'Confirm engine priming and warm-up before departure.',
        'Prepare the trim, oxygen, and radio for taxi.'
      ]
    },
    i16: {
      summary: 'Electrical preparation and engine priming are essential for this aircraft.',
      items: [
        'Check the ground electrical supply and wheel chocks.',
        'Ensure correct engine priming before starting.',
        'Do not forget the warm-up and brake setup before takeoff.'
      ]
    },
    la7: {
      summary: 'The priorities here are the air supply, fuel pressure, and engine warm-up.',
      items: [
        'Check the ground air supply and fuel shutoff valve.',
        'Ensure fuel pressure before starting.',
        'Monitor oil and cylinder-head warm-up before departure.'
      ]
    }
  };

  function renderChuckGuide(key) {
    var guide = chuckGuides[key] || chuckGuides.tf51;
    var summary = document.getElementById('chuck-guide-summary');
    var list = document.getElementById('chuck-guide-list');
    if (summary) summary.textContent = guide.summary;
    if (list) {
      list.innerHTML = '';
      guide.items.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
    }
  }

  // Checklist interactivo: marcar/desmarcar pasos
  document.querySelectorAll('.check-item').forEach(function (btn) {
    var key = btn.getAttribute('data-key');
    if (!key) return;

    try {
      var saved = localStorage.getItem('dcs-checklist-' + key);
      if (saved === 'done') {
        setChecklistState(btn, true);
      } else {
        setChecklistState(btn, false);
      }
    } catch (e) {
      setChecklistState(btn, false);
    }

    btn.addEventListener('click', function () {
      var done = !btn.classList.contains('is-done');
      setChecklistState(btn, done);
      var panel = btn.closest('.pernera-panel');
      if (panel) refreshToggleAllButton(panel);
    });
  });

  document.querySelectorAll('.toggle-all-checklist').forEach(function (button) {
    var checklistContainer = button.closest('.checklist-toolbar').nextElementSibling;
    if (!checklistContainer || !checklistContainer.classList.contains('checklist')) return;
    
    var items = checklistContainer.querySelectorAll('.check-item');
    var refreshUI = function() {
      var allDone = items.length > 0 && Array.from(items).every(function (item) {
        return item.classList.contains('is-done');
      });
      button.textContent = allDone ? 'Unmark all' : 'Mark all';
    };
    
    refreshUI();

    button.addEventListener('click', function () {
      var shouldMarkAll = Array.from(items).some(function (item) {
        return !item.classList.contains('is-done');
      });
      items.forEach(function (item) {
        setChecklistState(item, shouldMarkAll);
      });
      refreshUI();
    });
  });

  document.querySelectorAll('.video-accordion').forEach(function (accordion) {
    var toggle = accordion.querySelector('.video-accordion-toggle');
    var content = accordion.querySelector('.video-accordion-content');
    if (!toggle || !content) return;

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      content.hidden = isOpen;
    });
  });

  function formatConverted(value) {
    if (!Number.isFinite(value)) return '';
    var rounded = Math.round(value * 1000) / 1000;
    return String(rounded);
  }

  function convertTemperature(value, unit) {
    if (unit === 'c') return { c: value, f: (value * 9 / 5) + 32 };
    return { c: (value - 32) * 5 / 9, f: value };
  }

  function convertPressure(value, unit) {
    var inhg;
    if (unit === 'inhg') inhg = value;
    else if (unit === 'mmhg') inhg = value / 25.4;
    else inhg = value / 33.8638866667;
    return {
      inhg: inhg,
      mmhg: inhg * 25.4,
      hpa: inhg * 33.8638866667
    };
  }

  function convertSpeed(value, unit) {
    var mph;
    if (unit === 'mph') mph = value;
    else if (unit === 'kmh') mph = value / 1.609344;
    else mph = value / 0.868976242;
    return {
      mph: mph,
      kmh: mph * 1.609344,
      kts: mph * 0.868976242
    };
  }

  function convertAltitude(value, unit) {
    if (unit === 'ft') return { ft: value, m: value * 0.3048 };
    return { ft: value / 0.3048, m: value };
  }

  function convertFuel(value, unit) {
    if (unit === 'gal') return { gal: value, l: value * 3.785411784 };
    return { gal: value / 3.785411784, l: value };
  }

  document.querySelectorAll('.converter-item').forEach(function (item) {
    var type = item.getAttribute('data-converter');
    var inputs = item.querySelectorAll('input[data-unit]');
    if (!type || !inputs.length) return;

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var unit = input.getAttribute('data-unit');
        var raw = input.value.trim();

        if (raw === '') {
          inputs.forEach(function (other) { if (other !== input) other.value = ''; });
          return;
        }

        var value = Number(raw);
        if (!Number.isFinite(value)) return;

        var converted;
        if (type === 'temperature') converted = convertTemperature(value, unit);
        else if (type === 'pressure') converted = convertPressure(value, unit);
        else if (type === 'speed') converted = convertSpeed(value, unit);
        else if (type === 'altitude') converted = convertAltitude(value, unit);
        else if (type === 'fuel') converted = convertFuel(value, unit);
        else return;

        inputs.forEach(function (other) {
          var otherUnit = other.getAttribute('data-unit');
          if (!converted.hasOwnProperty(otherUnit)) return;
          if (other === input) return;
          other.value = formatConverted(converted[otherUnit]);
        });
      });
    });
  });

  // Perneras: cambiar panel
  var list = document.querySelector('.perneras-list');
  var buttons = list ? list.querySelectorAll('button[data-plane]') : [];
  var panels = document.querySelectorAll('.pernera-panel');

  if (buttons && buttons.length && panels && panels.length) {
    function activatePlane(id) {
      var targetId = 'pernera-' + id;
      var target = document.getElementById(targetId);
      if (!target) return;
      panels.forEach(function (p) { p.classList.remove('active'); });
      target.classList.add('active');
      buttons.forEach(function (b) {
        if (b.getAttribute('data-plane') === id) {
          b.setAttribute('aria-pressed', 'true');
          b.classList.add('active-btn');
        } else {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('active-btn');
        }
      });
      if (window.innerWidth < 760) {
        setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      }
      renderChuckGuide(id);
    }

    buttons.forEach(function (btn) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('aria-pressed', 'false');

      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-plane');
        activatePlane(id);
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var id = btn.getAttribute('data-plane');
          activatePlane(id);
        }
      });
    });

    var anyActive = Array.from(panels).some(function (p) { return p.classList.contains('active'); });
    if (!anyActive) {
      var firstId = buttons[0].getAttribute('data-plane');
      activatePlane(firstId);
    } else {
      var activeButton = Array.from(buttons).find(function (b) {
        return b.classList.contains('active-btn');
      });
      if (activeButton) {
        renderChuckGuide(activeButton.getAttribute('data-plane'));
      }
    }
  }

  // Smooth anchor links (works across pages for same-domain anchors)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href.length > 1) {
        var el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================
  // LOCATION FINDER
  // ============================================
  (function initLocationFinder() {
    var mapSelector = document.getElementById('map-selector');
    var typeSelector = document.getElementById('type-selector');
    var nameSearch = document.getElementById('location-name-search');
    var mgrsSearch = document.getElementById('location-mgrs-search');
    var resultsContainer = document.getElementById('location-results');
    var resultsInfo = document.getElementById('location-results-info');

    if (!mapSelector || !typeSelector || !nameSearch || !mgrsSearch || !resultsContainer || !resultsInfo) {
      return;
    }

    var locationsData = null;
    var allLocations = [];

    // Load JSON data
    fetch('data/dcs_locations.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load locations data');
        return response.json();
      })
      .then(function (data) {
        locationsData = data;
        populateMapSelector();
        buildLocationsList();
        renderResults();
      })
      .catch(function (error) {
        console.error('Error loading locations:', error);
        resultsInfo.textContent = 'Error loading location data.';
      });

    function populateMapSelector() {
      if (!locationsData || !locationsData.maps) return;

      var maps = Object.keys(locationsData.maps).sort();
      maps.forEach(function (mapName) {
        var option = document.createElement('option');
        option.value = mapName;
        option.textContent = mapName;
        mapSelector.appendChild(option);
      });
    }

    function buildLocationsList() {
      if (!locationsData || !locationsData.maps) return;

      allLocations = [];
      Object.keys(locationsData.maps).forEach(function (mapName) {
        var mapData = locationsData.maps[mapName];
        if (!mapData.locations) return;

        Object.keys(mapData.locations).forEach(function (locKey) {
          allLocations.push(mapData.locations[locKey]);
        });
      });
    }

    function filterLocations() {
      var selectedMap = mapSelector.value.trim();
      var selectedType = typeSelector.value.trim();
      var nameQuery = nameSearch.value.trim().toLowerCase();
      var mgrsQuery = mgrsSearch.value.trim().toUpperCase();

      var filtered = allLocations.filter(function (loc) {
        // Filter by map
        if (selectedMap && loc.map !== selectedMap) return false;

        // Filter by type
        if (selectedType && loc.type !== selectedType) return false;

        // Filter by name
        if (nameQuery) {
          var name = (loc.name || '').toLowerCase();
          var displayName = (loc.display_name || '').toLowerCase();
          if (!name.includes(nameQuery) && !displayName.includes(nameQuery)) {
            return false;
          }
        }

        // Filter by MGRS
        if (mgrsQuery) {
          var mgrs = (loc.mgrs || '').toUpperCase();
          if (!mgrs.includes(mgrsQuery)) return false;
        }

        return true;
      });

      return filtered;
    }

    function renderResults() {
      var filtered = filterLocations();
      resultsContainer.innerHTML = '';

      if (!locationsData) {
        resultsInfo.textContent = 'Loading data...';
        return;
      }

      if (filtered.length === 0) {
        resultsInfo.textContent = 'No results found.';
        return;
      }

      resultsInfo.textContent = 'Showing ' + filtered.length + ' location' + (filtered.length !== 1 ? 's' : '') + ' of ' + allLocations.length + ' total.';

      // Limit results to prevent performance issues
      var displayLimit = 100;
      var toDisplay = filtered.slice(0, displayLimit);

      toDisplay.forEach(function (loc) {
        var li = document.createElement('li');

        var nameDiv = document.createElement('div');
        nameDiv.className = 'location-name';
        nameDiv.textContent = loc.display_name || loc.name;
        li.appendChild(nameDiv);

        var metaDiv = document.createElement('div');
        metaDiv.className = 'location-meta';

        var typeItem = document.createElement('div');
        typeItem.className = 'location-meta-item';
        var typeLabel = loc.type === 'airfield' ? 'Airfield' : 'City';
        typeItem.innerHTML = '<span class="location-meta-label">Type:</span> <span class="location-meta-value">' + typeLabel + '</span>';
        metaDiv.appendChild(typeItem);

        var mapItem = document.createElement('div');
        mapItem.className = 'location-meta-item';
        mapItem.innerHTML = '<span class="location-meta-label">Map:</span> <span class="location-meta-value">' + (loc.map || 'N/A') + '</span>';
        metaDiv.appendChild(mapItem);

        var mgrsItem = document.createElement('div');
        mgrsItem.className = 'location-meta-item';
        mgrsItem.innerHTML = '<span class="location-meta-label">MGRS:</span> <span class="location-meta-value">' + (loc.mgrs_formatted || loc.mgrs || 'N/A') + '</span>';
        metaDiv.appendChild(mgrsItem);

        var latItem = document.createElement('div');
        latItem.className = 'location-meta-item';
        latItem.innerHTML = '<span class="location-meta-label">Lat:</span> <span class="location-meta-value">' + (loc.latitude != null ? loc.latitude.toFixed(6) : 'N/A') + '</span>';
        metaDiv.appendChild(latItem);

        var lonItem = document.createElement('div');
        lonItem.className = 'location-meta-item';
        lonItem.innerHTML = '<span class="location-meta-label">Lon:</span> <span class="location-meta-value">' + (loc.longitude != null ? loc.longitude.toFixed(6) : 'N/A') + '</span>';
        metaDiv.appendChild(lonItem);

        var latDmsItem = document.createElement('div');
        latDmsItem.className = 'location-meta-item';
        latDmsItem.innerHTML = '<span class="location-meta-label">Lat DMS:</span> <span class="location-meta-value">' + (loc.lat_dms || 'N/A') + '</span>';
        metaDiv.appendChild(latDmsItem);

        var lonDmsItem = document.createElement('div');
        lonDmsItem.className = 'location-meta-item';
        lonDmsItem.innerHTML = '<span class="location-meta-label">Lon DMS:</span> <span class="location-meta-value">' + (loc.lon_dms || 'N/A') + '</span>';
        metaDiv.appendChild(lonDmsItem);

        if (loc.altitude != null) {
          var altItem = document.createElement('div');
          altItem.className = 'location-meta-item';
          altItem.innerHTML = '<span class="location-meta-label">Altitude:</span> <span class="location-meta-value">' + loc.altitude.toFixed(2) + ' m</span>';
          metaDiv.appendChild(altItem);
        }

        li.appendChild(metaDiv);
        resultsContainer.appendChild(li);
      });

      if (filtered.length > displayLimit) {
        var infoLi = document.createElement('li');
        infoLi.style.textAlign = 'center';
        infoLi.style.color = 'var(--muted)';
        infoLi.style.fontStyle = 'italic';
        infoLi.style.padding = '12px';
        infoLi.textContent = 'Showing the first ' + displayLimit + ' results. Refine your search to see more.';
        resultsContainer.appendChild(infoLi);
      }
    }

    // Event listeners
    mapSelector.addEventListener('change', renderResults);
    typeSelector.addEventListener('change', renderResults);
    nameSearch.addEventListener('input', renderResults);
    mgrsSearch.addEventListener('input', renderResults);
  })();
});

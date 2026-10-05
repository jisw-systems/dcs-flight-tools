document.addEventListener('DOMContentLoaded', function () {
  var viewButtons = Array.from(document.querySelectorAll('[data-formation-view]'));
  var cards = Array.from(document.querySelectorAll('.formation-card'));
  if (!viewButtons.length || !cards.length) return;

  var formationData = {
    '01': {
      positions: [[20, 28], [40, 42], [60, 56], [80, 70]],
      advantages: 'Keeps the flight visually aligned on one side of the leader and makes wing positions easy to brief.',
      limitations: 'Uses lateral airspace and asks wing aircraft to manage spacing through turns.',
      uses: 'Visual transit, formation demonstrations, and maintaining a common direction of travel.'
    },
    '02': {
      positions: [[80, 28], [60, 42], [40, 56], [20, 70]],
      advantages: 'Keeps the flight visually aligned on one side of the leader and makes wing positions easy to brief.',
      limitations: 'Uses lateral airspace and asks wing aircraft to manage spacing through turns.',
      uses: 'Visual transit, formation demonstrations, and maintaining a common direction of travel.'
    },
    '03': {
      positions: [[42, 46], [18, 50], [66, 50], [86, 50]],
      advantages: 'Places aircraft side by side for a broad visual line and straightforward mutual reference.',
      limitations: 'Lateral spacing can be harder to judge and the formation occupies a wide frontage.',
      uses: 'Visual search practice, formation references, and short, briefed line-abreast exercises.'
    },
    '04': {
      positions: [[50, 17], [50, 39], [50, 61], [50, 83]],
      advantages: 'Simple to brief and keeps every aircraft on one predictable track behind the leader.',
      limitations: 'Aircraft behind have less lateral separation and may lose sight if spacing or visibility degrades.',
      uses: 'Route following, orderly joins, and practicing a simple formation reference.'
    },
    '05': {
      positions: [[43, 16], [58, 39], [43, 61], [58, 84]],
      advantages: 'Alternating offsets help maintain visual separation while keeping the flight in trail.',
      limitations: 'Each aircraft must track both longitudinal spacing and the alternating side.',
      uses: 'Visual transit and formation-spacing exercises when a straight trail is not preferred.'
    },
    '06': {
      positions: [[57, 16], [42, 39], [57, 61], [42, 84]],
      advantages: 'Alternating offsets help maintain visual separation while keeping the flight in trail.',
      limitations: 'Each aircraft must track both longitudinal spacing and the alternating side.',
      uses: 'Visual transit and formation-spacing exercises when a straight trail is not preferred.'
    },
    '07': {
      positions: [[50, 18], [31, 50], [69, 50]],
      advantages: 'A compact, symmetrical three-aircraft reference with the lead aircraft clearly at the point.',
      limitations: 'Vic is a three-aircraft formation; adding aircraft changes the formation and needs a separate brief.',
      uses: 'Three-aircraft visual formation practice and basic mutual-position references.'
    },
    '08': {
      positions: [[50, 17], [31, 50], [69, 50], [50, 83]],
      advantages: 'Provides a compact four-aircraft shape with a clear lead and two wing positions.',
      limitations: 'The rear position must preserve separation and visual contact with the aircraft ahead.',
      uses: 'Close-formation practice and maintaining a compact visual group.'
    },
    '09': {
      positions: [[50, 15], [67, 34], [33, 34], [50, 53], [50, 87], [92, 67], [8, 67], [79, 52], [21, 52]],
      advantages: 'The broad, layered shape makes the nine positions easy to distinguish in a top-down brief.',
      limitations: 'Nine aircraft require deliberate spacing, role assignment, and deconfliction; this diagram is a reference, not a universal procedure.',
      uses: 'Large helicopter-formation visualization and position-briefing exercises.'
    },
    '10': {
      positions: [[31, 31], [69, 31], [31, 69], [69, 69]],
      advantages: 'Shows four distinct positions around a shared center and makes relative placement easy to compare.',
      limitations: 'The rectangular geometry needs active station-keeping as heading or speed changes.',
      uses: 'Formation geometry demonstrations and coordinated position-keeping practice.'
    },
    '11': {
      positions: [[50, 39], [17, 39], [83, 39], [50, 75]],
      advantages: 'Makes the two flanks and supporting position visually distinct around the lead.',
      limitations: 'The group must coordinate roles, timing, and separation; the diagram alone is not an attack procedure.',
      uses: 'Briefing and coordination exercises using a pincer-shaped formation reference.'
    },
    '12': {
      positions: [[31, 50], [69, 50], [12, 70], [88, 70]],
      target: true,
      advantages: 'Shows aircraft on opposite sides of a shared reference point with support behind each side.',
      limitations: 'Requires clear identification, coordination, and deconfliction around the reference point.',
      uses: 'Training briefs about coordinated positions around a designated target reference.'
    },
    '13': {
      positions: [[31, 50], [69, 50], [12, 70], [88, 70]],
      target: true,
      advantages: 'Makes the relationship between the target reference and the two helicopter elements easy to visualize.',
      limitations: 'Crossing or converging paths need explicit separation and coordination in the mission brief.',
      uses: 'Helicopter formation visualization and deconfliction practice.'
    },
    '14': {
      positions: [[50, 17], [50, 83], [31, 52], [69, 52]],
      leaderLabel: '1↑',
      advantages: 'Separates the lead role from the supporting positions in a simple top-down brief.',
      limitations: 'Execution details depend on aircraft, mission, and unit procedures; this diagram is conceptual.',
      uses: 'Discussing roles and relative positions in a pop-up attack training profile.'
    }
  };

  var aircraftPath = 'M0-30 L4-8 L27 0 L27 5 L4 2 L3 19 L12 26 L12 30 L1 27 L0 38 L-1 27 L-12 30 L-12 26 L-3 19 L-4 2 L-27 5 L-27 0 L-4-8Z';

  function makeSvgElement(tagName, attributes) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    Object.keys(attributes).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  function renderSvg(diagram, data) {
    var svg = makeSvgElement('svg', {
      class: 'formation-svg',
      viewBox: '0 0 1000 300',
      role: 'img',
      'aria-label': diagram.getAttribute('aria-label') || 'Formation diagram'
    });
    var background = makeSvgElement('rect', { class: 'formation-svg__background', x: 0, y: 0, width: 1000, height: 300 });
    var grid = makeSvgElement('g', { class: 'formation-svg__grid', 'aria-hidden': 'true' });

    for (var x = 50; x < 1000; x += 50) {
      grid.appendChild(makeSvgElement('line', {
        class: x % 200 === 0 ? 'is-major' : '',
        x1: x,
        y1: 0,
        x2: x,
        y2: 300
      }));
    }
    for (var y = 30; y < 300; y += 30) {
      grid.appendChild(makeSvgElement('line', {
        class: y % 120 === 0 ? 'is-major' : '',
        x1: 0,
        y1: y,
        x2: 1000,
        y2: y
      }));
    }
    var heading = makeSvgElement('text', { class: 'formation-svg__heading', x: 500, y: 24, 'text-anchor': 'middle' });
    heading.textContent = 'FLIGHT DIRECTION';
    svg.appendChild(background);
    svg.appendChild(grid);
    svg.appendChild(heading);

    if (data.target) {
      svg.appendChild(makeSvgElement('circle', { class: 'formation-svg__target', cx: 500, cy: 150, r: 23 }));
      var targetLabel = makeSvgElement('text', { class: 'formation-svg__target-label', x: 500, y: 154, 'text-anchor': 'middle' });
      targetLabel.textContent = 'OBJ';
      svg.appendChild(targetLabel);
    }

    var markers = Array.from(diagram.querySelectorAll('.marker'));
    markers.forEach(function (marker, index) {
      var coordinate = data.positions[index];
      if (!coordinate) return;
      var xPosition = coordinate[0] * 10;
      var yPosition = coordinate[1] * 3;
      var isLeader = marker.classList.contains('marker-1');
      var aircraft = makeSvgElement('g', {
        class: isLeader ? 'formation-svg__aircraft is-leader' : 'formation-svg__aircraft',
        transform: 'translate(' + xPosition + ' ' + yPosition + ')'
      });
      aircraft.appendChild(makeSvgElement('path', { d: aircraftPath }));
      svg.appendChild(aircraft);

      var textAnchor = coordinate[0] > 84 ? 'end' : 'start';
      var labelX = xPosition + (textAnchor === 'end' ? -35 : 35);
      var number = makeSvgElement('text', { class: 'formation-svg__number', x: labelX, y: yPosition + 5, 'text-anchor': textAnchor });
      number.textContent = isLeader && data.leaderLabel ? data.leaderLabel : marker.textContent.trim();
      svg.appendChild(number);
    });

    diagram.querySelectorAll('.marker,.target').forEach(function (marker) { marker.remove(); });
    diagram.appendChild(svg);
    diagram.classList.add('has-svg');
  }

  function addFormationDetails(card, data) {
    var details = document.createElement('details');
    var summary = document.createElement('summary');
    var grid = document.createElement('div');
    details.className = 'formation-details';
    summary.textContent = 'Show more lines';
    grid.className = 'formation-details-grid';

    [
      ['Advantages', data.advantages],
      ['Limitations', data.limitations],
      ['Typical use', data.uses]
    ].forEach(function (sectionData) {
      var section = document.createElement('section');
      var heading = document.createElement('h4');
      var paragraph = document.createElement('p');
      heading.textContent = sectionData[0];
      paragraph.textContent = sectionData[1];
      section.appendChild(heading);
      section.appendChild(paragraph);
      grid.appendChild(section);
    });

    details.appendChild(summary);
    details.appendChild(grid);
    card.appendChild(details);
  }

  cards.forEach(function (card) {
    var index = card.querySelector('.formation-index');
    var diagram = card.querySelector('.formation-visual');
    if (!index || !diagram) return;
    var data = formationData[index.textContent.trim()];
    if (!data) return;
    renderSvg(diagram, data);
    addFormationDetails(card, data);
  });

  function setView(mode) {
    viewButtons.forEach(function (button) {
      var isActive = button.getAttribute('data-formation-view') === mode;
      button.setAttribute('aria-pressed', String(isActive));
    });
    cards.forEach(function (card) {
      var diagram = card.querySelector('.formation-visual');
      var positions = card.querySelector('.formation-positions');
      if (!diagram || !positions) return;
      diagram.hidden = mode !== 'svg';
      positions.hidden = mode !== 'text';
    });
  }

  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setView(button.getAttribute('data-formation-view'));
    });
  });

  setView('svg');
});
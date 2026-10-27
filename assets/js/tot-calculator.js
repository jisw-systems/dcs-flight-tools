(function () {
  var form = document.getElementById('tot-form');
  if (!form) return;

  var departureInput = document.getElementById('departure-time');
  var distanceUnitInput = document.getElementById('distance-unit');
  var speedUnitInput = document.getElementById('speed-unit');
  var routeLegs = document.getElementById('route-legs');
  var legTemplate = document.getElementById('route-leg-template');
  var addLegButton = document.getElementById('add-route-leg');
  var results = document.getElementById('tot-results');
  var totalDistanceOutput = document.getElementById('total-distance');
  var totalTimeOutput = document.getElementById('total-flight-time');
  var finalArrivalOutput = document.getElementById('final-arrival');
  var resultRows = document.getElementById('route-results-rows');
  var distanceToNm = { nm: 1, km: 1 / 1.852, mi: 1 / 1.150779448 };
  var speedToKt = { kt: 1, kmh: 1 / 1.852, mph: 1 / 1.150779448 };
  var distanceUnitLabels = { nm: 'NM', km: 'km', mi: 'mi' };
  var speedUnitLabels = { kt: 'kt', kmh: 'km/h', mph: 'mph' };

  function updateUnitLabels() {
    document.querySelectorAll('.tot-distance-unit-label').forEach(function (label) {
      label.textContent = distanceUnitLabels[distanceUnitInput.value];
    });
    document.querySelectorAll('.tot-speed-unit-label').forEach(function (label) {
      label.textContent = speedUnitLabels[speedUnitInput.value];
    });
  }

  function formatDuration(minutes) {
    var roundedMinutes = Math.round(minutes);
    var hours = Math.floor(roundedMinutes / 60);
    var remainder = roundedMinutes % 60;
    return hours ? hours + 'h ' + String(remainder).padStart(2, '0') + 'm' : remainder + 'm';
  }

  function parseMissionTime(value) {
    var timeParts = value.split(':').map(Number);
    if (timeParts.length !== 2 || !timeParts.every(Number.isInteger) || timeParts[0] > 23 || timeParts[1] > 59) return null;
    return timeParts[0] * 60 + timeParts[1];
  }

  function formatMissionTime(totalMinutes) {
    var dayOffset = Math.floor(totalMinutes / 1440);
    var clockMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    var hours = String(Math.floor(clockMinutes / 60)).padStart(2, '0');
    var minutes = String(clockMinutes % 60).padStart(2, '0');
    var dayLabel = dayOffset === 1 ? ' (+1 day)' : dayOffset > 1 ? ' (+' + dayOffset + ' days)' : '';
    return hours + ':' + minutes + dayLabel;
  }

  function updateLegLabels() {
    var legs = routeLegs.querySelectorAll('.tot-leg');
    legs.forEach(function (leg, index) {
      var number = String(index + 1).padStart(2, '0');
      leg.querySelector('.tot-leg-title').textContent = 'Leg ' + number;
      var removeButton = leg.querySelector('.tot-remove-leg');
      removeButton.hidden = legs.length === 1;
      removeButton.setAttribute('aria-label', 'Remove leg ' + number);
    });
  }

  function addRouteLeg(fromValue, toValue, linkedOrigin) {
    var legFragment = legTemplate.content.cloneNode(true);
    var leg = legFragment.querySelector('.tot-leg');
    leg.dataset.linkedOrigin = String(linkedOrigin);
    leg.querySelector('[data-field="from"]').value = fromValue;
    leg.querySelector('[data-field="to"]').value = toValue;

    leg.querySelector('.tot-remove-leg').addEventListener('click', function () {
      leg.remove();
      results.hidden = true;
      updateLegLabels();
    });

    routeLegs.appendChild(legFragment);
    updateLegLabels();
    results.hidden = true;
  }

  function createResultCell(row, value) {
    var cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
  }

  addRouteLeg('Takeoff', 'Waypoint 1', false);

  addLegButton.addEventListener('click', function () {
    var currentLegs = routeLegs.querySelectorAll('.tot-leg');
    var lastDestination = currentLegs[currentLegs.length - 1].querySelector('[data-field="to"]').value.trim();
    var newWaypointName = 'Waypoint ' + (currentLegs.length + 1);
    addRouteLeg(lastDestination || 'Waypoint ' + currentLegs.length, newWaypointName, true);
  });

  [distanceUnitInput, speedUnitInput].forEach(function (unitInput) {
    unitInput.addEventListener('change', function () {
      updateUnitLabels();
      results.hidden = true;
    });
  });

  routeLegs.addEventListener('input', function (event) {
    var currentLeg = event.target.closest('.tot-leg');
    if (event.target.matches('[data-field="from"]')) currentLeg.dataset.linkedOrigin = 'false';

    if (event.target.matches('[data-field="to"]')) {
      var legs = Array.from(routeLegs.querySelectorAll('.tot-leg'));
      var nextLeg = legs[legs.indexOf(currentLeg) + 1];
      if (nextLeg && nextLeg.dataset.linkedOrigin === 'true') {
        nextLeg.querySelector('[data-field="from"]').value = event.target.value;
      }
    }

    results.hidden = true;
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var departureMinutes = departureInput.value ? parseMissionTime(departureInput.value) : null;
    if (departureInput.value && departureMinutes === null) return;

    var cumulativeMinutes = 0;
    var totalDistance = 0;
    var routeRows = [];
    var legs = routeLegs.querySelectorAll('.tot-leg');

    for (var index = 0; index < legs.length; index += 1) {
      var leg = legs[index];
      var from = leg.querySelector('[data-field="from"]').value.trim();
      var to = leg.querySelector('[data-field="to"]').value.trim();
      var distance = Number(leg.querySelector('[data-field="distance"]').value);
      var groundspeed = Number(leg.querySelector('[data-field="groundspeed"]').value);

      if (!from || !to || !Number.isFinite(distance) || distance <= 0 || !Number.isFinite(groundspeed) || groundspeed <= 0) return;

      var distanceNm = distance * distanceToNm[distanceUnitInput.value];
      var groundspeedKt = groundspeed * speedToKt[speedUnitInput.value];
      var legMinutes = distanceNm / groundspeedKt * 60;
      cumulativeMinutes += legMinutes;
      totalDistance += distanceNm;
      routeRows.push({
        index: index + 1,
        from: from,
        to: to,
        distance: distance,
        groundspeed: groundspeed,
        legMinutes: legMinutes,
        arrivalMinutes: departureMinutes === null ? null : departureMinutes + Math.round(cumulativeMinutes)
      });
    }

    resultRows.replaceChildren();
    routeRows.forEach(function (routeRow) {
      var row = document.createElement('tr');
      createResultCell(row, String(routeRow.index).padStart(2, '0'));
      createResultCell(row, routeRow.from);
      createResultCell(row, routeRow.to);
      createResultCell(row, routeRow.distance.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' ' + distanceUnitLabels[distanceUnitInput.value]);
      createResultCell(row, routeRow.groundspeed.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' ' + speedUnitLabels[speedUnitInput.value]);
      createResultCell(row, formatDuration(routeRow.legMinutes));
      createResultCell(row, routeRow.arrivalMinutes === null ? 'Set departure time' : formatMissionTime(routeRow.arrivalMinutes));
      resultRows.appendChild(row);
    });

    var displayedDistance = totalDistance / distanceToNm[distanceUnitInput.value];
    totalDistanceOutput.textContent = displayedDistance.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' ' + distanceUnitLabels[distanceUnitInput.value];
    totalTimeOutput.textContent = formatDuration(cumulativeMinutes);
    finalArrivalOutput.textContent = departureMinutes === null ? 'Set departure time for ETA' : formatMissionTime(departureMinutes + Math.round(cumulativeMinutes));
    results.hidden = false;
  });

  form.addEventListener('input', function () {
    results.hidden = true;
  });

  form.addEventListener('reset', function (event) {
    event.preventDefault();
    departureInput.value = '';
    routeLegs.replaceChildren();
    addRouteLeg('Takeoff', 'Waypoint 1', false);
    results.hidden = true;
  });
})();
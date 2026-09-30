document.addEventListener('DOMContentLoaded', function () {
  var mgrsLibrary = window.mgrs;
  var geodesic = window.geodesic && window.geodesic.Geodesic.WGS84;

  function showResult(output, message, isError) {
    output.textContent = message;
    output.classList.toggle('is-error', Boolean(isError));
    output.hidden = !message;
  }

  function bindForm(formId, action, errorMessage) {
    var form = document.getElementById(formId);
    if (!form) return;

    var output = form.querySelector('.geo-tool-result');
    var bearingResult = form.querySelector('.geo-bearing-result');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      try {
        showResult(output, '', false);
        if (bearingResult) bearingResult.hidden = true;
        action(form, output);
      } catch (error) {
        if (bearingResult) bearingResult.hidden = true;
        showResult(output, errorMessage, true);
      }
    });
  }

  function readMgrs(value) {
    if (!mgrsLibrary) throw new Error('MGRS library unavailable');
    var coordinate = value.trim().replace(/\s+/g, '').toUpperCase();
    if (!coordinate) throw new Error('MGRS coordinate required');
    var point = mgrsLibrary.toPoint(coordinate);
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) throw new Error('Invalid MGRS coordinate');
    return { longitude: point[0], latitude: point[1] };
  }

  function readPoint(form, prefix, format) {
    if (format === 'mgrs') return readMgrs(form.elements[prefix + '-mgrs'].value);

    var latitude = Number(form.elements[prefix + '-latitude'].value);
    var longitude = Number(form.elements[prefix + '-longitude'].value);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Coordinates out of range');
    }
    return { latitude: latitude, longitude: longitude };
  }

  var bearingDistanceForm = document.getElementById('bearing-distance-form');
  var coordinateFormatInput = document.getElementById('bearing-coordinate-format');
  if (bearingDistanceForm && coordinateFormatInput) {
    var coordinateGroups = bearingDistanceForm.querySelectorAll('[data-coordinate-format-fields]');
    function updateCoordinateFormat() {
      coordinateGroups.forEach(function (group) {
        var isActive = group.getAttribute('data-coordinate-format-fields') === coordinateFormatInput.value;
        group.hidden = !isActive;
        group.querySelectorAll('input').forEach(function (input) {
          input.disabled = !isActive;
        });
      });
    }
    coordinateFormatInput.addEventListener('change', updateCoordinateFormat);
    updateCoordinateFormat();
  }

  function formatLatLon(point) {
    return point.latitude.toFixed(6) + ', ' + point.longitude.toFixed(6);
  }

  function toMgrs(point) {
    return mgrsLibrary.forward([point.longitude, point.latitude], 5);
  }

  bindForm('mgrs-to-latlon-form', function (form, output) {
    var point = readMgrs(form.elements.mgrs.value);
    showResult(output, 'Latitude, longitude: ' + formatLatLon(point), false);
  }, 'Invalid MGRS coordinate. Check the grid zone, easting, and northing.');

  bindForm('latlon-to-mgrs-form', function (form, output) {
    var latitude = Number(form.elements.latitude.value);
    var longitude = Number(form.elements.longitude.value);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Coordinates out of range');
    }
    showResult(output, 'MGRS: ' + toMgrs({ latitude: latitude, longitude: longitude }), false);
  }, 'Enter a valid latitude and longitude.');

  bindForm('offset-point-form', function (form, output) {
    if (!geodesic) throw new Error('Geodesic library unavailable');
    var origin = readMgrs(form.elements.origin.value);
    var bearing = Number(form.elements.bearing.value);
    var distance = Number(form.elements.distance.value);
    var unitToMeters = { nm: 1852, km: 1000, m: 1 };
    var unit = form.elements.unit.value;
    if (!Number.isFinite(bearing) || bearing < 0 || bearing > 360 || !Number.isFinite(distance) || distance < 0 || !unitToMeters[unit]) {
      throw new Error('Invalid offset values');
    }

    var destination = geodesic.Direct(origin.latitude, origin.longitude, bearing % 360, distance * unitToMeters[unit]);
    var point = { latitude: destination.lat2, longitude: destination.lon2 };
    showResult(output, 'Destination MGRS: ' + toMgrs(point) + ' | Lat/Lon: ' + formatLatLon(point), false);
  }, 'Check the origin MGRS, bearing (0-360), and distance.');

  bindForm('bearing-distance-form', function (form, output) {
    if (!geodesic) throw new Error('Geodesic library unavailable');
    var format = form.elements.coordinateFormat.value;
    var start = readPoint(form, 'start', format);
    var end = readPoint(form, 'end', format);
    var result = geodesic.Inverse(start.latitude, start.longitude, end.latitude, end.longitude);
    var initialBearing = ((result.azi1 % 360) + 360) % 360;
    var nauticalMiles = result.s12 / 1852;
    var kilometres = result.s12 / 1000;
    var compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    var direction = result.s12 < 0.01 ? 'Same point' : compassPoints[Math.round(initialBearing / 45) % compassPoints.length];
    form.querySelector('[data-bearing-value]').textContent = initialBearing.toFixed(1) + '°';
    form.querySelector('[data-bearing-direction]').textContent = direction;
    form.querySelector('[data-distance-value]').textContent = nauticalMiles.toFixed(2) + ' NM';
    form.querySelector('[data-distance-secondary]').textContent = kilometres.toFixed(2) + ' km';
    form.querySelector('.geo-bearing-result').hidden = false;
  }, 'Enter valid coordinates in the selected format.');
});
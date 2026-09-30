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
    var structuredResult = form.querySelector('.geo-bearing-result');
    if (structuredResult) {
      function clearStructuredResult() {
        structuredResult.hidden = true;
        showResult(output, '', false);
      }
      form.addEventListener('input', clearStructuredResult);
      form.addEventListener('change', clearStructuredResult);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (structuredResult) structuredResult.hidden = true;
      showResult(output, '', false);
      if (!form.reportValidity()) return;

      try {
        action(form, output);
      } catch (error) {
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

  function parseDms(value, axis) {
    var match = value.trim().match(/^([+-]?\d{1,3})\s*[°º]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]?\s*([NSEW])?$/i);
    if (!match) throw new Error('Invalid DMS coordinate');

    var degreesValue = Number(match[1]);
    var degrees = Math.abs(degreesValue);
    var minutes = Number(match[2]);
    var seconds = Number(match[3]);
    var hemisphere = (match[4] || '').toUpperCase();
    var isLatitude = axis === 'latitude';
    var maxDegrees = isLatitude ? 90 : 180;
    var validHemispheres = isLatitude ? ['N', 'S'] : ['E', 'W'];

    if (minutes > 59 || seconds >= 60 || degrees > maxDegrees || (degrees === maxDegrees && (minutes > 0 || seconds > 0))) {
      throw new Error('DMS coordinate out of range');
    }
    if (hemisphere && validHemispheres.indexOf(hemisphere) === -1) throw new Error('DMS hemisphere does not match axis');

    var sign = degreesValue < 0 ? -1 : 1;
    if (hemisphere) {
      var hemisphereSign = hemisphere === 'S' || hemisphere === 'W' ? -1 : 1;
      if (degreesValue !== 0 && sign !== hemisphereSign) throw new Error('DMS sign conflicts with hemisphere');
      sign = hemisphereSign;
    }

    return sign * (degrees + minutes / 60 + seconds / 3600);
  }

  function readPoint(form, prefix, format) {
    if (format === 'mgrs') return readMgrs(form.elements[prefix + '-mgrs'].value);

    if (format === 'dms') {
      return {
        latitude: parseDms(form.elements[prefix + '-latitude-dms'].value, 'latitude'),
        longitude: parseDms(form.elements[prefix + '-longitude-dms'].value, 'longitude')
      };
    }

    var latitude = Number(form.elements[prefix + '-latitude'].value);
    var longitude = Number(form.elements[prefix + '-longitude'].value);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Coordinates out of range');
    }
    return { latitude: latitude, longitude: longitude };
  }

  function initCoordinateFormat(formId, selectorId) {
    var form = document.getElementById(formId);
    var selector = document.getElementById(selectorId);
    if (!form || !selector) return;

    var coordinateGroups = form.querySelectorAll('[data-coordinate-format-fields]');
    function updateCoordinateFormat() {
      coordinateGroups.forEach(function (group) {
        var isActive = group.getAttribute('data-coordinate-format-fields') === selector.value;
        group.hidden = !isActive;
        group.querySelectorAll('input').forEach(function (input) {
          input.disabled = !isActive;
        });
      });
    }
    selector.addEventListener('change', updateCoordinateFormat);
    updateCoordinateFormat();
  }

  initCoordinateFormat('offset-point-form', 'offset-coordinate-format');
  initCoordinateFormat('bearing-distance-form', 'bearing-coordinate-format');

  function formatLatLon(point) {
    return point.latitude.toFixed(6) + ', ' + point.longitude.toFixed(6);
  }

  function formatDms(value, axis) {
    var totalSeconds = Math.round(Math.abs(value) * 360000);
    var degrees = Math.floor(totalSeconds / 360000);
    var minutes = Math.floor((totalSeconds % 360000) / 6000);
    var seconds = (totalSeconds % 6000) / 100;
    var hemisphere = axis === 'latitude'
      ? (value < 0 ? 'S' : 'N')
      : (value < 0 ? 'W' : 'E');

    return degrees + '° ' + String(minutes).padStart(2, '0') + "' " + seconds.toFixed(2).padStart(5, '0') + '" ' + hemisphere;
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
    var origin = readPoint(form, 'origin', form.elements.coordinateFormat.value);
    var bearing = Number(form.elements.bearing.value);
    var distance = Number(form.elements.distance.value);
    var unitToMeters = { nm: 1852, km: 1000, m: 1 };
    var unit = form.elements.unit.value;
    if (!Number.isFinite(bearing) || bearing < 0 || bearing > 360 || !Number.isFinite(distance) || distance < 0 || !unitToMeters[unit]) {
      throw new Error('Invalid offset values');
    }

    var destination = geodesic.Direct(origin.latitude, origin.longitude, bearing % 360, distance * unitToMeters[unit]);
    var point = { latitude: destination.lat2, longitude: destination.lon2 };
    form.querySelector('[data-offset-mgrs]').textContent = toMgrs(point);
    form.querySelector('[data-offset-latlon]').textContent = formatLatLon(point);
    form.querySelector('[data-offset-lat-dms]').textContent = formatDms(point.latitude, 'latitude');
    form.querySelector('[data-offset-lon-dms]').textContent = formatDms(point.longitude, 'longitude');
    form.querySelector('.geo-offset-result').hidden = false;
  }, 'Check the origin coordinates, bearing (0-360), and distance.');

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
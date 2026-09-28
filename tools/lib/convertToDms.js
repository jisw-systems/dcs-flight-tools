/**
 * Convert decimal degrees to DMS (Degrees/Minutes/Seconds) format
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @returns {Object} Object with lat_dms and lon_dms strings
 */
function toDMS(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Invalid coordinates: latitude=${latitude}, longitude=${longitude}`);
  }

  /**
   * Convert a single coordinate to DMS format
   * @param {number} decimal - Coordinate in decimal degrees
   * @param {boolean} isLat - true for latitude, false for longitude
   * @returns {string} Formatted DMS string
   */
  function convertCoordinate(decimal, isLat) {
    // Determine direction
    const positive = decimal >= 0;
    const direction = isLat
      ? (positive ? 'N' : 'S')
      : (positive ? 'E' : 'W');

    // Work with absolute value
    const absolute = Math.abs(decimal);

    // Extract degrees
    const degrees = Math.floor(absolute);

    // Extract minutes
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);

    // Extract seconds (rounded to 2 decimal places)
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);

    // Format: DD°MM'SS.SS"D
    return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.padStart(5, '0')}"${direction}`;
  }

  return {
    lat_dms: convertCoordinate(latitude, true),
    lon_dms: convertCoordinate(longitude, false)
  };
}

module.exports = {
  toDMS
};

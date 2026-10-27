/**
 * Format MGRS coordinate string for readability
 * @param {string} mgrsString - Compact MGRS string (e.g., "38TLN4807310304")
 * @returns {string} Formatted MGRS (e.g., "38 TLN 48073 10304")
 */
function formatMGRS(mgrsString) {
  if (!mgrsString || typeof mgrsString !== 'string') {
    return mgrsString || '';
  }

  const clean = mgrsString.trim().replace(/\s+/g, '');

  // MGRS structure: ZZ B XX EEEEE NNNNN
  // ZZ = zone (2 digits)
  // B = band (1 letter)
  // XX = 100km square (2 letters)
  // EEEEE NNNNN = easting/northing (variable length, split evenly)

  if (clean.length < 5) {
    return mgrsString; // Too short to be valid
  }

  // Extract zone (first 2 characters, should be digits)
  const zone = clean.substring(0, 2);

  // Extract band (1 letter after zone)
  const band = clean.substring(2, 3);

  // Extract 100km square (2 letters)
  const square = clean.substring(3, 5);

  // Remaining digits are easting/northing
  const coords = clean.substring(5);

  // Coordinates must have even length (half easting, half northing)
  if (coords.length % 2 !== 0) {
    return mgrsString; // Invalid format
  }

  const halfLen = coords.length / 2;
  const easting = coords.substring(0, halfLen);
  const northing = coords.substring(halfLen);

  // Format: "ZZ BXX EEEEE NNNNN"
  return `${zone} ${band}${square} ${easting} ${northing}`;
}

module.exports = {
  formatMGRS
};

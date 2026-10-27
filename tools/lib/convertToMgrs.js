const mgrs = require('mgrs');

function convertLatLonToMgrs(latitude, longitude, accuracy = 5) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Invalid coordinates: latitude=${latitude}, longitude=${longitude}`);
  }

  return mgrs.forward([longitude, latitude], accuracy);
}

module.exports = {
  convertLatLonToMgrs
};

const { formatMGRS } = require('./formatMgrs');
const { toDMS } = require('./convertToDms');

function buildLocationsObject(towns, airfields = []) {
  const maps = {};

  // Process cities (type: "city")
  for (const town of towns) {
    if (!maps[town.map]) {
      maps[town.map] = {
        map: town.map,
        locations: {}
      };
    }

    // Convert to DMS format
    const dms = toDMS(town.latitude, town.longitude);

    maps[town.map].locations[town.name] = {
      name: town.name,
      display_name: town.display_name,
      type: 'city',
      latitude: town.latitude,
      longitude: town.longitude,
      lat_dms: dms.lat_dms,
      lon_dms: dms.lon_dms,
      mgrs: town.mgrs,
      mgrs_formatted: formatMGRS(town.mgrs),
      map: town.map
    };
  }

  // Process airfields (type: "airfield")
  for (const airfield of airfields) {
    if (!maps[airfield.map]) {
      maps[airfield.map] = {
        map: airfield.map,
        locations: {}
      };
    }

    // Convert to DMS and MGRS
    const dms = toDMS(airfield.latitude, airfield.longitude);
    const mgrs = require('./convertToMgrs').convertLatLonToMgrs(airfield.latitude, airfield.longitude);

    // Create unique key combining airfield name and ID to avoid conflicts
    const airfieldKey = `${airfield.name}_AF${airfield.airbaseId}`;

    maps[airfield.map].locations[airfieldKey] = {
      name: airfieldKey,
      display_name: airfield.display_name,
      type: 'airfield',
      latitude: airfield.latitude,
      longitude: airfield.longitude,
      lat_dms: dms.lat_dms,
      lon_dms: dms.lon_dms,
      altitude: airfield.altitude,
      mgrs: mgrs,
      mgrs_formatted: formatMGRS(mgrs),
      map: airfield.map,
      airbaseId: airfield.airbaseId,
      theatre: airfield.theatre
    };
  }

  // Count total locations
  let totalLocations = 0;
  for (const mapData of Object.values(maps)) {
    totalLocations += Object.keys(mapData.locations).length;
  }

  return {
    generated_at: new Date().toISOString(),
    total_maps: Object.keys(maps).length,
    total_locations: totalLocations,
    maps
  };
}

module.exports = {
  buildLocationsObject
};

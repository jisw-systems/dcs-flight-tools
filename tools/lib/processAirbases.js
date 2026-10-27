const fs = require('fs');
const path = require('path');

/**
 * Map Briefing Room theatre names to DCS map names
 * @param {string} theatre - Theatre name from TheatersAirbases.json
 * @returns {string} DCS map name (uses theatre name when not in original project)
 */
function mapTheatreToMap(theatre) {
  const theatreToMapMapping = {
    'Caucasus': 'Caucasus',
    'MarianaIslands': 'MarianaIslands',
    'MarianaIslandsWWII': 'MarianasWWII',
    'Nevada': 'Nevada',
    'Normandy': 'Normandy',
    'Syria': 'Syria',
    // Additional theatres - map to theatre name directly
    'Afghanistan': 'Afghanistan',
    'Falklands': 'Falklands',
    'GermanyCW': 'GermanyCW',
    'Iraq': 'Iraq',
    'Kola': 'Kola',
    'PersianGulf': 'PersianGulf',
    'SinaiMap': 'SinaiMap',
    'TheChannel': 'TheChannel'
  };
  
  return theatreToMapMapping[theatre] || theatre;
}

/**
 * Parse airfields from Briefing Room TheatersAirbases.json
 * @param {string} filePath - Path to TheatersAirbases.json
 * @returns {Array} Array of airfield objects with extracted data
 */
function parseAirbases(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Airfields file not found: ${filePath}`);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const airbases = JSON.parse(rawData);
  
  const airfields = [];

  for (const airbase of airbases) {
    const mapName = mapTheatreToMap(airbase.theatre);
    
    // Skip if theatre not in current project
    if (!mapName) continue;
    
    // Skip if no parking data
    if (!airbase.parking || airbase.parking.length === 0) continue;
    
    // Use first parking spot as representative location for airfield
    const firstParking = airbase.parking[0];
    if (!firstParking.pos || !firstParking.pos.World) continue;
    
    const worldPos = firstParking.pos.World;
    
    airfields.push({
      name: airbase.displayName,
      display_name: airbase.displayName,
      latitude: worldPos.lat,
      longitude: worldPos.lon,
      altitude: worldPos.alt,
      map: mapName,
      theatre: airbase.theatre,
      airbaseId: airbase.ID
    });
  }

  return airfields;
}

module.exports = {
  parseAirbases,
  mapTheatreToMap
};

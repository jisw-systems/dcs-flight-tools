const fs = require('fs');
const path = require('path');
const { readMapDirectories } = require('./lib/readMapDirectories');
const { parseTownsLua } = require('./lib/parseTownsLua');
const { convertLatLonToMgrs } = require('./lib/convertToMgrs');
const { buildLocationsObject } = require('./lib/buildLocations');
const { parseAirbases } = require('./lib/processAirbases');

// Use relative paths from the tools directory
const TOOLS_DIR = __dirname;
const PROJECT_ROOT = path.dirname(TOOLS_DIR);
const MAPS_DIR = path.join(PROJECT_ROOT, 'data', 'maps');
const AIRFIELDS_FILE = path.join(PROJECT_ROOT, 'data', 'maps', 'Airfields', 'TheatersAirbases.json');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'data', 'dcs_locations.json');

function generateLocationsObject() {
  const mapFiles = readMapDirectories(MAPS_DIR);
  const towns = [];

  for (const mapFile of mapFiles) {
    const parsedTowns = parseTownsLua(mapFile.content, mapFile.mapName).map((town) => ({
      ...town,
      mgrs: convertLatLonToMgrs(town.latitude, town.longitude)
    }));

    towns.push(...parsedTowns);
  }

  // Parse airfields from Briefing Room data
  let airfields = [];
  if (fs.existsSync(AIRFIELDS_FILE)) {
    try {
      airfields = parseAirbases(AIRFIELDS_FILE);
      console.log(`Processed ${airfields.length} airfields`);
    } catch (error) {
      console.warn(`Warning: Could not process airfields: ${error.message}`);
    }
  } else {
    console.warn(`Warning: Airfields file not found at ${AIRFIELDS_FILE}`);
  }

  return buildLocationsObject(towns, airfields);
}

const locations = generateLocationsObject();

function writeLocationsJson(outputFile = OUTPUT_FILE, data = generateLocationsObject()) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  return outputFile;
}

if (require.main === module) {
  const shouldWrite = process.argv.includes('--write');

  if (shouldWrite) {
    const writtenFile = writeLocationsJson();
    console.log(`DCS locations JSON written to: ${writtenFile}`);
  } else {
    console.log(JSON.stringify(locations, null, 2));
  }
}

module.exports = {
  TOOLS_DIR,
  PROJECT_ROOT,
  MAPS_DIR,
  OUTPUT_FILE,
  locations,
  generateLocationsObject,
  writeLocationsJson
};

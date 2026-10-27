const fs = require('fs');
const path = require('path');

function readMapDirectories(mapsRootDir) {
  if (!fs.existsSync(mapsRootDir)) {
    return [];
  }

  return fs
    .readdirSync(mapsRootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const mapName = entry.name;
      const townsFilePath = path.join(mapsRootDir, mapName, 'towns.lua');

      if (!fs.existsSync(townsFilePath)) {
        return null;
      }

      return {
        mapName,
        townsFilePath,
        content: fs.readFileSync(townsFilePath, 'utf8')
      };
    })
    .filter(Boolean);
}

module.exports = {
  readMapDirectories
};

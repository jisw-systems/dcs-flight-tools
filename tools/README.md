# DCS Locations Data Generator

Tool for combining DCS World location data (cities and airfields) and generating structured JSON with formatted MGRS and DMS coordinates for the location finder feature.

## Data Sources

### Cities
- Extracted from DCS World game files
- Source files: `data/maps/<MapName>/towns.lua`
- Automatically detected and processed

### Airfields
- Source: [Briefing Room for DCS](https://github.com/DCS-BR-Tools/briefing-room-for-dcs) project
- File: `TheatersAirbases.json`
- Location: `data/maps/Airfields/TheatersAirbases.json`
- Contains 799 airbases across all DCS theatres
- Only airbases for supported maps are included

## Quick Start

```bash
npm install
node index.js --write
```

This generates `/data/dcs_locations.json` with:
- All cities from DCS map files
- All airfields from TheatersAirbases.json (for supported maps)
- All coordinates in decimal degrees, DMS, and MGRS formats
- Type field (`city` or `airfield`) for each location

## Installation

```bash
cd tools
npm install
```

## Usage

### Generate JSON
```bash
node index.js --write
```

Outputs to: `../data/dcs_locations.json` when run from the `tools/` directory.

### Preview Output (without writing file)
```bash
node index.js
```

Prints JSON to console for inspection.

## Input Structure

The tool scans for `towns.lua` files in the data directory:

```
data/
  maps/
    Caucasus/
      towns.lua
    Syria/
      towns.lua
    Nevada/
      towns.lua
    ...
```

## Output Structure

Generated JSON contains location data for all maps:

```json
{
  "generated_at": "2026-07-16T22:47:44.854Z",
  "total_maps": 6,
  "total_locations": 4702,
  "maps": {
    "Caucasus": {
      "map": "Caucasus",
      "locations": {
        "KUTAISI": {
          "name": "KUTAISI",
          "display_name": "KUTAISI",
          "type": "city",
          "latitude": 42.267086,
          "longitude": 42.696849,
          "lat_dms": "42°16'01.51\"N",
          "lon_dms": "42°41'48.66\"E",
          "mgrs": "38TLM1005381999",
          "mgrs_formatted": "38 TLM 10053 81999",
          "map": "Caucasus"
        },
        "Gudauta_AF21": {
          "name": "Gudauta_AF21",
          "display_name": "Gudauta",
          "type": "airfield",
          "latitude": 43.105475209985,
          "longitude": 40.567379515029,
          "lat_dms": "43°06'19.71\"N",
          "lon_dms": "40°34'02.57\"E",
          "altitude": 21.01,
          "mgrs": "37TFH2753673719",
          "mgrs_formatted": "37 TFH 27536 73719",
          "map": "Caucasus",
          "airbaseId": 21,
          "theatre": "Caucasus"
        }
      }
    }
  }
}
```

## Modules

- **index.js** - Main entry point, CLI handler, coordinates city + airfield processing
- **lib/readMapDirectories.js** - Scans map directories for Lua files
- **lib/parseTownsLua.js** - Parses Lua table format from towns.lua
- **lib/convertToMgrs.js** - Lat/lon → MGRS (Military Grid Reference System) conversion
- **lib/convertToDms.js** - Lat/lon → DMS (Degrees/Minutes/Seconds) conversion
- **lib/formatMgrs.js** - Formats MGRS for readability (adds spaces)
- **lib/processAirbases.js** - Processes Briefing Room TheatersAirbases.json
- **lib/buildLocations.js** - Builds final unified JSON structure with cities + airfields

## Dependencies

- **[mgrs](https://www.npmjs.com/package/mgrs)** (^2.1.0) - Coordinate conversion to MGRS

## Technical Details

- **MGRS Precision:** 5 digits (1-meter accuracy)
- **MGRS Format:** `38 TLN 48073 10304` (zone, band, 100km square, easting, northing)
- **DMS Format:** `42°16'01.51"N` (degrees, minutes, seconds with direction)
- **DMS Precision:** 2 decimal places for seconds
- **Decimal Precision:** 6 places (~0.1m accuracy)
- **Auto-detection:** Finds all maps in `/data/maps/` automatically
- **Relative paths:** Uses `__dirname` for portability

### Location Types

Each location has a `type` field:

- `"city"` - Towns and cities from DCS map files (towns.lua)
- `"airfield"` - Airbases from Briefing Room project (TheatersAirbases.json)

Airfields include additional fields:
- `altitude` - Airfield elevation in meters
- `airbaseId` - Briefing Room database ID
- `theatre` - DCS theatre name

### Supported Maps

Only airbases for these maps are included in the final JSON:

- Caucasus (21 airfields)
- MarianaIslands (XX airfields)
- MarianasWWII (XX airfields)
- Nevada (XX airfields)
- Normandy (XX airfields)
- Syria (XX airfields)

### Coordinate Formats

Each location includes three coordinate representations:

1. **Decimal Degrees** - `latitude: 42.267086, longitude: 42.696849`
2. **DMS (Degrees/Minutes/Seconds)** - `lat_dms: "42°16'01.51"N", lon_dms: "42°41'48.66"E"`
3. **MGRS (Military Grid)** - `mgrs: "38TLM1005381999"` and `mgrs_formatted: "38 TLM 10053 81999"`

## When to Regenerate

Run the tool when:
- Adding new map data to `data/maps/<Map>/`
- Updating `data/maps/Airfields/TheatersAirbases.json`
- DCS updates change location coordinates
- Location names or airfield data are modified in source files

## Output Size

Expect ~1.8MB JSON file for all 6 maps with ~4,700 locations:
- ~1,600 cities (from towns.lua)
- ~364 airfields (from TheatersAirbases.json)


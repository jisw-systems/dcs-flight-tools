# J&I Flight Tools

This repository contains the current static DCS World web toolkit for J&I Flight Tools. It provides separate pages for aircraft cold starts and checklists, mission navigation tools, radio brevities, training calendars, communications references, formations, threat data, and route timing.

The project is intentionally lightweight and framework-free: HTML, CSS, vanilla JavaScript and generated JSON assets are used without a build pipeline. It can be opened locally in a browser or served directly through a static web server such as GitHub Pages.

J&I Flight Tools is part of [J&I SimWorks Systems](https://jisw-systems.github.io/main-site/).

This repository is the active project site for the J&I SimWorks Systems portfolio and is published independently at [https://jisw-systems.github.io/dcs-flight-tools/](https://jisw-systems.github.io/dcs-flight-tools/). The main portfolio homepage remains the parent project and contains the broader project overview, roadmap, and public-facing brand context.

The site is organized as a framework-free static application. Public HTML pages stay at the repository root for stable GitHub Pages URLs; shared frontend resources live under `assets/`, generated data lives under `data/`, authoring references live under `docs/`, and data-generation utilities live under `tools/`.

A comprehensive digital kneeboard and reference toolkit for DCS World (Digital Combat Simulator). Aircraft procedures live in Flight Checklists; unit conversion, location search, and coordinate-based mission-planning tools are grouped on the separate Navigation Tools page.

## Project Relationship

- Parent site: [J&I SimWorks Systems](https://jisw-systems.github.io/main-site/)
- Project site: [J&I Flight Tools](https://jisw-systems.github.io/dcs-flight-tools/)
- This repo focuses on the functional DCS tooling and quick-reference modules.
- The parent site provides the project overview, roadmap, and portfolio context.

## Features

### [Aircraft Checklists (Perneras)](flight-checklists.html)
- **24 Aircraft** with detailed cold start procedures and essential operations
- Step-by-step interactive checklists with progress tracking
- Technical notes and engine management procedures
- Video references for complex procedures
- Alphabetically organized for quick access

**Supported Aircraft:**
- AH-64D Apache
- BF-109 K4 Kurfürst
- C-130 Hercules
- Eurofighter Typhoon
- F-100D Super Sabre
- F-14 Tomcat
- F-4E Phantom II
- F4U-1D Corsair
- F-86F Sabre
- F/A-18C Hornet
- FW-190 A8 Anton & D9 Dora
- Fiat G.91
- I-16 Ishak
- Lavochkin LA-7
- MiG-19P Farmer
- MiG-15bis Fagot
- MiG-21bis Fishbed
- MiG-29 Fulcrum
- Mi-24P Hind
- Mosquito FB Mk VI
- P-47D Thunderbolt
- Spitfire Mk IX
- TF-51D / P-51D Mustang

### Radio Brevities
- Searchable table with 100+ aviation communication terms
- Phonetic alphabet reference
- Standard radio procedures and phrases
- Real-time search filtering

### Route Timing Calculator
- Build multi-leg routes with distance and speed per leg
- Enter distances in nautical miles, kilometres, or miles, and speeds in knots, km/h, or mph
- Calculate cumulative en-route time and ETA
- Support departure times and midnight rollover
- Useful for mission planning and flight timing estimates

### Formation Reference
- Explore official and attack formations with interactive SVG diagrams or plain-text position lists
- Expand each formation for its explanation, advantages, limitations, and typical use

### Privacy and use
- See [Legal & Privacy](legal.html) for browser storage, GitHub Pages hosting logs, external video embeds, and the simulator-only use disclaimer.
- Checklist progress is saved in browser local storage only after the visitor opts in; YouTube videos are plain links and connect only when followed.
- Use the refresh icon in the top navigation to revalidate the current page and its local assets before reloading, without clearing saved checklist progress. On mobile, it is inside the navigation menu.

### [Navigation Tools](navigation-tools.html)

The mission-planning tools live on their own page, separate from the aircraft procedures in [Flight Checklists](flight-checklists.html). Coordinate calculations are handled by `assets/js/coordinate-tools.js`; shared unit conversion and location search are handled by `assets/js/main.js`.

#### Unit Converter
Convert between common aviation units:
- **Temperature:** Celsius ↔ Fahrenheit
- **Pressure:** inHg ↔ mmHg ↔ hPa
- **Speed:** mph ↔ km/h ↔ knots
- **Altitude:** feet ↔ meters
- **Fuel:** gallons ↔ liters

#### Location Finder
- Search 5,134 locations across 14 DCS maps
- **Cities:** Town and city names from DCS map files
- **Airfields:** Complete airbase directory with parking positions
- Filter by map, name, or MGRS coordinates
- Display formatted MGRS coordinates for easy reading
- Lat/Lon coordinates in decimal degrees (6-decimal precision)
- Lat/Lon coordinates in DMS format (Degrees/Minutes/Seconds)
- Altitude data for airfields
- Multiple coordinate formats for maximum compatibility

#### Coordinate and Route Tools
- Convert between MGRS and decimal latitude/longitude coordinates
- Use MGRS, decimal latitude/longitude, or DMS coordinate input for offset and bearing calculations
- Calculate an offset point from a coordinate origin, true bearing, and distance; show its destination in MGRS, decimal degrees, and DMS
- Calculate the initial true bearing and WGS84 distance between two MGRS, decimal latitude/longitude, or DMS points
- MGRS inputs use the center of the represented grid square
- The location finder searches cities and airfields across DCS maps using map, name, or MGRS filters

**Supported Maps:**
- Caucasus
- MarianaIslands
- MarianasWWII
- Nevada
- Normandy
- Syria
- Afghanistan
- Falklands
- GermanyCW
- Iraq
- Kola
- PersianGulf
- SinaiMap
- TheChannel

## Project Structure

dcs-flight-tools/
├── index.html              # Landing page and module overview
├── flight-checklists.html  # Aircraft checklists
├── navigation-tools.html   # Unit, location, and coordinate tools
├── legal.html              # Legal, privacy, and third-party media information
├── threat-database.html    # Searchable threat reference page
├── tot-calculator.html     # Multi-leg route timing and ETA calculator
├── assets/
│   ├── css/
│   │   └── styles.css      # Global styles
│   └── js/
│       ├── main.js         # Shared frontend behavior and unit/location tools
│       ├── coordinate-tools.js # MGRS conversion and route-navigation calculations
│       ├── formations.js   # Interactive SVG/plain-text formation diagrams
│       ├── shared-nav.js   # Shared navigation menu and footer
│       ├── site-config.js  # Brand, page titles, and favicon configuration
│       ├── vendor/         # Local MGRS and WGS84 geodesic browser libraries
│       ├── tot-calculator.js # Route timing calculator logic
│       └── threats.js      # Threat database rendering and filtering
├── calendar.html           # Training calendar page
├── comms.html              # Communications page
├── brevities.html          # Radio communications reference
├── data/
│   ├── dcs_locations.json       # Generated locations database
│   ├── threat-database.js       # Extracted threat reference data
│   └── maps/
│       ├── Airfields/
│       │   └── TheatersAirbases.json    # Source from Briefing Room project
│       ├── Caucasus/
│       ├── MarianaIslands/
│       ├── MarianasWWII/
│       ├── Nevada/
│       ├── Normandy/
│       ├── Syria/
│       └── Additional DCS maps represented in generated JSON
├── docs/                                # Contracts, guides, and references
└── tools/                               # Data generation utilities
    ├── README.md
    ├── index.js
    ├── package.json
    └── lib/
        ├── buildLocations.js
        ├── convertToMgrs.js
        ├── convertToDms.js
        ├── formatMgrs.js
        ├── parseTownsLua.js
        ├── processAirbases.js
        └── readMapDirectories.js
```

## File organization

- Root HTML files are public entry points and keep their existing filenames for stable links.
- `assets/css/` contains shared stylesheets.
- `assets/js/` contains shared and page-specific frontend scripts.
- `data/` contains generated datasets and source map data; page code refers to it from the site root.
- `docs/` contains contracts, style guidance, and reference documents.
- `tools/` contains scripts and dependencies used to regenerate data; it is not loaded by the browser.

When adding a page, keep the HTML entry point in the root, load shared resources from `assets/`, and document any new data or tooling under the matching directory.

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, grid layouts, responsive design
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **LocalStorage** - Persist checklist progress

### Data Processing
- **Node.js** - Backend tooling
- **mgrs** (npm) - Coordinate conversion library
- **GeographicLib** (npm) - WGS84 geodesic calculations for offsets, bearings, and distances

### Hosting
- **GitHub Pages** - Static site hosting with Jekyll

## Design Philosophy

**Minimalist Technical Theme:**
- Dark background (#0D0D0F) for reduced eye strain
- Red accent color (#B33939) for important elements
- Clean typography with system fonts
- Responsive grid layouts
- No external dependencies (CSS frameworks, etc.)
- Performance-first approach

## Getting Started

### View the Website

Simply open `index.html` in any modern web browser. No build process required.

For development with live reload:
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

Then navigate to `http://localhost:8000`

### Data Sources

#### Cities
- Extracted from DCS World game files (`towns.lua` from each map)
- Located in `data/maps/<MapName>/towns.lua`
- Automatically detected and processed by the tool

#### Airfields
- Source: [Briefing Room for DCS](https://github.com/DCS-BR-Tools/briefing-room-for-dcs)
- File: `TheatersAirbases.json` - Complete airbase directory for all DCS theatres
- Location: `data/maps/Airfields/TheatersAirbases.json`
- Contains 799 airbases with parking positions and coordinates
- Only airbases for maps in the current project are included (Caucasus, MarianaIslands, MarianasWWII, Nevada, Normandy, Syria, Afghanistan, Falklands, GermanyCW, Iraq, Kola, PersianGulf, SinaiMap, TheChannel)

### Updating Airfield Data

To update with newer Briefing Room data:

1. Download the latest `TheatersAirbases.json` from [Briefing Room GitHub](https://github.com/DCS-BR-Tools/briefing-room-for-dcs/blob/main/DatabaseJSON/TheatersAirbases.json)
2. Replace `data/maps/Airfields/TheatersAirbases.json`
3. Regenerate: `cd tools && node index.js --write`

The script automatically:
- Filters airbases by supported maps
- Extracts first parking position as representative location
- Converts coordinates to MGRS and DMS formats
- Merges with cities into unified database
- Adds `type: "airfield"` field to distinguish from cities

### Regenerate Location Data

If you need to update the locations database from new DCS map data:

```bash
cd tools
npm install          # First time only
node index.js --write
```

This will:
1. Read all `towns.lua` files from `data/maps/<Map>/`
2. Parse city names and coordinates
3. Read `data/maps/Airfields/TheatersAirbases.json`
4. Parse airfield names, coordinates, and altitude
5. Convert all coordinates to MGRS format
6. Convert all coordinates to DMS format (Degrees/Minutes/Seconds)
7. Add `type` field: `"city"` or `"airfield"`
8. Generate formatted `data/dcs_locations.json`

See [tools/README.md](tools/README.md) for detailed documentation.

## Features Deep Dive

### Interactive Checklists
- Click items to mark as complete
- Progress persists across sessions
- "Mark/unmark all" toggle for quick reset
- Mobile-friendly accordion layout

### Smart Search
- Real-time filtering without page reload
- Case-insensitive matching
- Search across multiple fields (name, display name, MGRS)
- Performance optimized (limits to 100 results)

### Coordinate Formats

Location coordinates are provided in multiple formats for maximum compatibility:

#### MGRS (Military Grid Reference System)
- **Raw:** `38TLN4807310304`
- **Formatted:** `38 TLN 48073 10304`
- Format: `<Zone> <Band><100km Square> <Easting> <Northing>`

#### DMS (Degrees/Minutes/Seconds)
- **Example:** `42°16'01.51"N` and `42°41'48.66"E`
- Format: `DD°MM'SS.SS"D` (degrees, minutes, seconds, direction)
- Precision: 2 decimal places for seconds

#### Decimal Degrees
- **Example:** `42.267086`, `42.696849`
- Precision: 6 decimal places (~0.1 meter accuracy)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Areas for improvement:

- [ ] Add more aircraft checklists
- [ ] Include airfield diagrams
- [ ] Add weapon employment data
- [ ] Expand brevities table
- [ ] Add kneeboard export feature
- [ ] Support for custom user notes

## Data Sources

- Aircraft procedures: Based on official DCS documentation and Chuck's Guides
- Location data: Extracted from DCS World game files (`towns.lua`)
- MGRS conversion: Using the [mgrs](https://www.npmjs.com/package/mgrs) npm package

## Community licenses

The project is published for the community to use, share, and improve. Original code is licensed under [GNU GPL-3.0-or-later](LICENSE); original written content, including original checklist wording, is licensed under [CC BY-SA 4.0](CONTENT-LICENSE.md). Both allow commercial use, subject to their terms: code redistributions must preserve the GPL freedoms, and adapted content must retain attribution and use the same CC BY-SA license. Project names, logos, and third-party material are excluded.

Third-party code and data remain subject to their own notices and licences; see [third-party software notices](assets/js/vendor/THIRD-PARTY-LICENSES.md). DCS World is a trademark of Eagle Dynamics; this project is independent and is not affiliated with or endorsed by Eagle Dynamics.

## Acknowledgments

- **Chuck's Guides** - Comprehensive aircraft documentation
- **Eagle Dynamics** - DCS World and map data
- **Briefing Room for DCS** - Complete airbase database
- **DCS Community** - Feedback and procedure validation


---

**Live Demo:** [https://jisw-systems.github.io/dcs-flight-tools/](https://jisw-systems.github.io/dcs-flight-tools/)

**Built with ❤️ for the DCS community**

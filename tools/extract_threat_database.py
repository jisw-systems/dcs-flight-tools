#!/usr/bin/env python3
"""Extract the saved Hoggitworld threat tables without flattening row/col spans."""

import json
import sys
from html.parser import HTMLParser
from pathlib import Path


class ThreatPageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.heading_level = None
        self.heading_text = []
        self.current_heading = "Threat Database"
        self.table = None
        self.row = None
        self.cell = None
        self.tables = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"h2", "h3"}:
            self.heading_level = tag
            self.heading_text = []
        elif tag == "table":
            self.table = {"title": self.current_heading, "rows": []}
        elif tag == "tr" and self.table is not None:
            self.row = []
        elif tag in {"th", "td"} and self.row is not None:
            self.cell = {"text": [], "rowspan": int(attrs.get("rowspan", "1")), "colspan": int(attrs.get("colspan", "1"))}

    def handle_data(self, data):
        if self.heading_level:
            self.heading_text.append(data)
        if self.cell is not None:
            self.cell["text"].append(data)

    def handle_endtag(self, tag):
        if tag == self.heading_level:
            heading = " ".join("".join(self.heading_text).split())
            if heading:
                self.current_heading = heading
            self.heading_level = None
            self.heading_text = []
        elif tag in {"th", "td"} and self.cell is not None:
            self.cell["value"] = " ".join("".join(self.cell.pop("text")).split())
            self.row.append(self.cell)
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.row:
                self.table["rows"].append(self.row)
            self.row = None
        elif tag == "table" and self.table is not None:
            if len(self.table["rows"]) > 1:
                self.tables.append(self.table)
            self.table = None


def expand_rows(raw_rows):
    """Expand rowspan/colspan into a rectangular grid."""
    grid = []
    active = {}
    for raw_row in raw_rows:
        row = []
        column = 0

        def fill_active(index):
            while index in active:
                while len(row) <= index:
                    row.append("")
                row[index] = active[index]["value"]
                active[index]["remaining"] -= 1
                if active[index]["remaining"] == 0:
                    del active[index]
                index += 1
            return index

        for cell in raw_row:
            column = fill_active(column)
            for offset in range(cell["colspan"]):
                target = column + offset
                while len(row) <= target:
                    row.append("")
                row[target] = cell["value"]
                if cell["rowspan"] > 1:
                    active[target] = {"remaining": cell["rowspan"] - 1, "value": cell["value"]}
            column += cell["colspan"]

        while active and column in active:
            column = fill_active(column)
        grid.append(row)

    width = max((len(row) for row in grid), default=0)
    return [row + [""] * (width - len(row)) for row in grid]


SCHEMAS = {
    "Anti Aircraft Artillery (AAA)": ["Threat", "NATO Designation", "RWR Symbology", "HARM Code", "Range Min (NMI)", "Range Max (NMI)", "Altitude Min (Feet)", "Altitude Max (Feet)", "Acquire Time (Seconds)", "Guidance Type", "Ammunition"],
    "Man Portable Air Defense Systems (MANPADS)": ["Threat", "NATO Designation", "RWR Symbology", "Range Min (NMI)", "Range Max (NMI)", "Altitude Min (Feet)", "Altitude Max (Feet)", "Acquire Time (Seconds)", "Guidance Type", "Ammunition"],
    "Surface to Air Missile (SAM) Systems": ["Threat", "NATO Designation", "RWR Symbology", "Track Radar", "Track HARM Code", "Search Radar", "Search HARM Code", "Range Min (NMI)", "Range Max (NMI)", "Altitude Min (Feet)", "Altitude Max (Feet)", "Acquire Time (Seconds)", "Missile Guidance", "Ammunition"],
    "Naval": ["Threat", "SAM Systems Onboard", "Ground Based Equivalent", "RWR Symbology", "Radar", "Radar HARM Code", "Range Min (NMI)", "Range Max (NMI)", "Altitude Min (Feet)", "Altitude Max (Feet)", "Acquire Time (Seconds)", "Missile Guidance", "CIWS", "Ammunition"],
    "RADARS": ["Radar", "NATO Designation", "RWR Symbology", "Role", "Associated SAM", "HARM Code", "Range (NMI)", "Notes"],
    "Overall": ["Threat Type", "Threat", "NATO Code", "RWR Ident", "Type", "Gun Ammo", "Missile Amount", "Speed (Mach)", "Range Min (NM)", "Range Max (NM)", "Radar (NM)", "Acquire Time (Sec.)", "Altitude Min (Feet)", "Altitude Max (Feet)", "Danger (1-10)"],
    "Non-NATO missiles": ["Russian Designation", "NATO Designation", "Platform", "Min Range (NM)", "Max Range (NM)", "Speed (Mach)", "Guidance Type", "Armament", "Threat Level"],
    "NATO missiles": ["NATO Designation", "Platform", "RWR Symbols", "Min Range (NM)", "Max Range (NM)", "Speed (Mach)", "Guidance", "Armament", "Threat Level"],
    "Non-NATO aircraft": ["NATO Designation", "Platform", "RWR Symbols", "Min Range (NM)", "Max Range (NM)", "Min Altitude", "Max Altitude", "Speed", "Armament"],
    "Airspace Surveillance": ["NATO Designation", "Platform", "RWR Symbols", "Flexibility", "Max Detection Range", "Min Altitude", "Max Altitude"],
}

TYPE_NAMES = {
    "Anti Aircraft Artillery (AAA)": "AAA",
    "Man Portable Air Defense Systems (MANPADS)": "MANPADS",
    "Surface to Air Missile (SAM) Systems": "SAM",
    "Naval": "Naval",
    "RADARS": "Radar",
    "Overall": "Ground threat guide",
    "Non-NATO missiles": "Air-to-air missile (non-NATO)",
    "NATO missiles": "Air-to-air missile (NATO)",
    "Non-NATO aircraft": "Aircraft",
    "Airspace Surveillance": "Airspace surveillance",
}


def clean(value):
    return "Unknown" if value.strip().lower() == "link" else value.strip()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_threat_database.py INPUT.html OUTPUT.js")

    parser = ThreatPageParser()
    parser.feed(Path(sys.argv[1]).read_text(errors="replace"))
    categories = []
    records = []
    notes = []
    radar_names = set()
    overall_classifications = []

    for index, table in enumerate(parser.tables, 1):
        key = {7: "Non-NATO missiles", 8: "NATO missiles", 9: "Non-NATO aircraft", 10: "Airspace Surveillance"}.get(index, table["title"])
        source_rows = table["rows"]
        if key == "Overall":
            for source_row in source_rows:
                if len(source_row) == 1 and source_row[0]["colspan"] > 1 and source_row[0]["value"]:
                    notes.append(source_row[0]["value"])
            source_rows = [source_row for source_row in source_rows if not (len(source_row) == 1 and source_row[0]["colspan"] > 1)]
        grid = expand_rows(source_rows)
        headers = SCHEMAS[key]
        data_start = 1 if key in {"RADARS", "Non-NATO missiles", "NATO missiles", "Non-NATO aircraft", "Airspace Surveillance"} else 2
        data_rows = grid[data_start:]

        if key == "RADARS":
            radar_names = {row[0] for row in data_rows if row and row[0]}

        normalized_rows = []
        for row in data_rows:
            row = [clean(value) for value in row[:len(headers)]]
            non_empty = [value for value in row if value]
            if key == "Overall" and row[0] in {"TGT RAD*", "EWR / ACQR"}:
                continue
            if key == "Overall":
                if row[0] and row[1]:
                    overall_classifications.append({"classification": row[0], "threat": row[1], "code": row[2]})
                continue
            if key == "Non-NATO aircraft" and row[0].lower() == "shell":
                continue
            if any(row):
                normalized_rows.append(row + [""] * (len(headers) - len(row)))

        category = {"title": key, "type": TYPE_NAMES[key], "headers": headers, "rows": normalized_rows}
        if key != "Overall":
            categories.append(category)
        for row_index, row in enumerate(normalized_rows, 1):
            records.append({
                "id": f"threat-{index}-row-{row_index}",
                "type": TYPE_NAMES[key],
                "sourceCategory": key,
                "fields": [{"label": header, "value": row[field_index]} for field_index, header in enumerate(headers)],
            })

    def normalized(value):
        return " ".join(value.lower().replace("-", " ").split())

    aliases = {
        "flk. pnz. gepard": "flakpanzer gepard",
        "m163 vads": "m163 vulcan",
        "jeep avenger ads": "avenger ads",
        "mim 72g chaparral": "mim 72g chapparal",
    }

    for classification in overall_classifications:
        candidates = [aliases.get(normalized(classification["threat"]), classification["threat"]), classification["code"]]
        target = next((record for record in records if any(
            normalized(candidate) and normalized(candidate) in {normalized(field["value"]) for field in record["fields"]}
            for candidate in candidates
        )), None)
        if target:
            target["fields"].append({"label": "Overall Classification", "value": classification["classification"]})

    payload = {"source": "DCS World Wiki - Hoggitworld.com, saved HTML reference", "categories": categories, "records": records, "notes": notes}
    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("window.threatDatabase = " + json.dumps(payload, ensure_ascii=False) + ";\n")
    print(f"extracted {len(categories)} categories")
    print(f"extracted {len(records)} threat records")
    print(f"extracted {len(notes)} table notes")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path


def main():
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    sections = []
    current = None
    lines = source.read_text().splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        if line.startswith('## '):
            current = {'title': line[3:].strip(), 'headers': [], 'rows': []}
            sections.append(current)
        elif current and line.startswith('| ') and index + 1 < len(lines) and lines[index + 1].startswith('|---'):
            current['headers'] = [cell.strip() for cell in line.strip('|').split('|')]
            index += 1
        elif current and current['headers'] and line.startswith('| '):
            cells = [cell.strip() for cell in line.strip('|').split('|')]
            if len(cells) == len(current['headers']):
                current['rows'].append(cells)
        index += 1
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('window.rwrWorkbook = ' + json.dumps({'sections': sections}, ensure_ascii=False) + ';\n')
    print('sections:', len(sections))
    print('rows:', sum(len(section['rows']) for section in sections))


if __name__ == '__main__':
    main()

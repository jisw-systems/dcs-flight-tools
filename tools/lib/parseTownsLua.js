function parseLuaString(value) {
  const trimmed = value.trim();
  const wrappedMatch = trimmed.match(/^_\(\s*(["'])(.*?)\1\s*\)$/s);
  if (wrappedMatch) {
    return wrappedMatch[2];
  }

  const plainMatch = trimmed.match(/^(["'])(.*?)\1$/s);
  if (plainMatch) {
    return plainMatch[2];
  }

  return trimmed;
}

function parseNumberField(block, fieldName) {
  const pattern = new RegExp(`${fieldName}\\s*=\\s*([-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?)`);
  const match = block.match(pattern);
  return match ? Number(match[1]) : null;
}

function parseStringField(block, fieldName) {
  const pattern = new RegExp(`${fieldName}\\s*=\\s*([^,\\n\\r]+)`);
  const match = block.match(pattern);
  return match ? parseLuaString(match[1]) : null;
}

function stripLuaComments(content) {
  return content.replace(/--.*$/gm, '');
}

function parseTownsLua(content, mapName) {
  const sanitized = stripLuaComments(content);
  const entryPattern = /\[\s*["']([^"']+)["']\s*\]\s*=\s*\{([\s\S]*?)\}\s*,?/g;
  const towns = [];

  let match;
  while ((match = entryPattern.exec(sanitized)) !== null) {
    const name = match[1];
    const block = match[2];
    const latitude = parseNumberField(block, 'latitude');
    const longitude = parseNumberField(block, 'longitude');
    const displayName = parseStringField(block, 'display_name');

    if (latitude === null || longitude === null) {
      continue;
    }

    towns.push({
      map: mapName,
      name,
      latitude,
      longitude,
      display_name: displayName
    });
  }

  return towns;
}

module.exports = {
  parseTownsLua
};

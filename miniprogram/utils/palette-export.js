function normalizeColors(colors) {
  return (colors || []).filter(Boolean).map(hex => String(hex).toUpperCase());
}

function toCssVariables(colors, prefix = 'color') {
  return normalizeColors(colors).map((hex, index) => `--${prefix}-${index + 1}: ${hex};`).join('\n');
}

function toScssVariables(colors, prefix = 'color') {
  return normalizeColors(colors).map((hex, index) => `$${prefix}-${index + 1}: ${hex};`).join('\n');
}

function toJson(colors, name = 'Palette') {
  return JSON.stringify({ name, colors:normalizeColors(colors) }, null, 2);
}

function toDesignTokens(colors, name = 'Palette') {
  const values = {};
  normalizeColors(colors).forEach((hex, index) => {
    values[`color-${index + 1}`] = { value:hex, type:'color' };
  });
  return JSON.stringify({ [name]: values }, null, 2);
}

function toTailwind(colors, prefix = 'palette') {
  const values = {};
  normalizeColors(colors).forEach((hex, index) => { values[index + 1] = hex; });
  return JSON.stringify({ [prefix]:values }, null, 2);
}

function buildExport(colors, name) {
  return {
    css:toCssVariables(colors),
    scss:toScssVariables(colors),
    json:toJson(colors, name),
    tokens:toDesignTokens(colors, name),
    tailwind:toTailwind(colors)
  };
}

module.exports = { normalizeColors, toCssVariables, toScssVariables, toJson, toDesignTokens, toTailwind, buildExport };
